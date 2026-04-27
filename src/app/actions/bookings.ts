"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { BookingStatus } from "@/generated/prisma/enums";
import { designPreviewWriteBlockedMessage } from "@/lib/design-preview";
import { prisma } from "@/lib/db";
import { listingHasConflict } from "@/lib/booking-guards";
import { parseDateOnly } from "@/lib/dates";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { isUserApproved } from "@/lib/approval";

const requestSchema = z.object({
  listingId: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function createBookingRequest(
  input: z.infer<typeof requestSchema>,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesión." };
  if (!isUserApproved(session)) {
    return { ok: false, error: "Tu cuenta está pendiente de aprobación." };
  }
  const previewBlock = designPreviewWriteBlockedMessage(session);
  if (previewBlock) return { ok: false, error: previewBlock };

  if (!rateLimit(`book:${session.user.id}`, 10, 60_000)) {
    return { ok: false, error: "Demasiadas solicitudes. Espera un momento." };
  }

  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Fechas no válidas." };

  const start = parseDateOnly(parsed.data.startDate);
  const end = parseDateOnly(parsed.data.endDate);
  if (!(start < end)) {
    return { ok: false, error: "La salida debe ser después de la entrada." };
  }

  const listing = await prisma.listing.findUnique({
    where: { id: parsed.data.listingId },
    include: { host: true },
  });
  if (!listing) return { ok: false, error: "Anuncio no encontrado." };
  if (listing.hostId === session.user.id) {
    return { ok: false, error: "No puedes reservar tu propio anuncio." };
  }

  const conflict = await listingHasConflict(
    prisma,
    listing.id,
    start,
    end,
  );
  if (conflict) return { ok: false, error: conflict.reason };

  const booking = await prisma.booking.create({
    data: {
      listingId: listing.id,
      guestId: session.user.id,
      startDate: start,
      endDate: end,
      status: BookingStatus.PENDING,
    },
  });

  if (listing.host.email) {
    await sendEmail({
      to: listing.host.email,
      subject: `Nueva solicitud: ${listing.title}`,
      html: `<p>Tienes una nueva solicitud de reserva en <strong>${listing.title}</strong>.</p>
        <p>Entrada: ${parsed.data.startDate} · Salida: ${parsed.data.endDate}</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/host/bookings">Ver solicitudes</a></p>`,
    });
  }

  revalidatePath(`/listings/${listing.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/host/bookings");
  revalidatePath("/admin");
  return { ok: true, id: booking.id };
}

export async function confirmBooking(
  bookingId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesión." };
  const previewBlock = designPreviewWriteBlockedMessage(session);
  if (previewBlock) return { ok: false, error: previewBlock };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { listing: true, guest: true },
  });
  if (!booking || booking.listing.hostId !== session.user.id) {
    return { ok: false, error: "No autorizado." };
  }
  if (booking.status !== BookingStatus.PENDING) {
    return { ok: false, error: "La solicitud ya fue gestionada." };
  }

  const conflict = await listingHasConflict(
    prisma,
    booking.listingId,
    booking.startDate,
    booking.endDate,
    { excludeBookingId: booking.id },
  );
  if (conflict) return { ok: false, error: conflict.reason };

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CONFIRMED },
    });
    await tx.booking.updateMany({
      where: {
        listingId: booking.listingId,
        status: BookingStatus.PENDING,
        id: { not: bookingId },
        AND: [
          { startDate: { lt: booking.endDate } },
          { endDate: { gt: booking.startDate } },
        ],
      },
      data: { status: BookingStatus.DECLINED },
    });
  });

  if (booking.guest.email) {
    await sendEmail({
      to: booking.guest.email,
      subject: `Reserva confirmada: ${booking.listing.title}`,
      html: `<p>Tu reserva en <strong>${booking.listing.title}</strong> fue <strong>confirmada</strong>.</p>
        <p>Podrás ver la dirección completa en tu panel si el anfitrión la indicó.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard">Ver mis reservas</a></p>`,
    });
  }

  revalidatePath("/host/bookings");
  revalidatePath("/dashboard");
  revalidatePath(`/listings/${booking.listingId}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function declineBooking(
  bookingId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesión." };
  const previewBlockDecline = designPreviewWriteBlockedMessage(session);
  if (previewBlockDecline) return { ok: false, error: previewBlockDecline };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { listing: true, guest: true },
  });
  if (!booking || booking.listing.hostId !== session.user.id) {
    return { ok: false, error: "No autorizado." };
  }
  if (booking.status !== BookingStatus.PENDING) {
    return { ok: false, error: "La solicitud ya fue gestionada." };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.DECLINED },
  });

  if (booking.guest.email) {
    await sendEmail({
      to: booking.guest.email,
      subject: `Actualización de reserva: ${booking.listing.title}`,
      html: `<p>La solicitud para <strong>${booking.listing.title}</strong> no fue aceptada en esta ocasión.</p>`,
    });
  }

  revalidatePath("/host/bookings");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { ok: true };
}

export async function cancelBookingAsGuest(
  bookingId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesión." };
  const previewBlockCancel = designPreviewWriteBlockedMessage(session);
  if (previewBlockCancel) return { ok: false, error: previewBlockCancel };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { listing: { include: { host: true } } },
  });
  if (!booking || booking.guestId !== session.user.id) {
    return { ok: false, error: "No autorizado." };
  }
  if (
    booking.status !== BookingStatus.PENDING &&
    booking.status !== BookingStatus.CONFIRMED
  ) {
    return { ok: false, error: "No se puede cancelar." };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CANCELLED },
  });

  if (booking.listing.host.email) {
    await sendEmail({
      to: booking.listing.host.email,
      subject: `Reserva cancelada: ${booking.listing.title}`,
      html: `<p>Un huésped canceló una reserva en <strong>${booking.listing.title}</strong>.</p>`,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/host/bookings");
  revalidatePath(`/listings/${booking.listingId}`);
  revalidatePath("/admin");
  return { ok: true };
}
