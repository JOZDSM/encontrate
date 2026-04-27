"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { BookingStatus } from "@/generated/prisma/enums";
import { designPreviewWriteBlockedMessage } from "@/lib/design-preview";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { isUserApproved } from "@/lib/approval";

const messageSchema = z.object({
  listingId: z.string().min(1),
  bookingId: z.string().min(1),
  body: z.string().min(1).max(4000),
});

export async function sendListingMessage(
  input: z.infer<typeof messageSchema>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesión." };
  if (!isUserApproved(session)) {
    return { ok: false, error: "Tu cuenta está pendiente de aprobación." };
  }
  const previewBlock = designPreviewWriteBlockedMessage(session);
  if (previewBlock) return { ok: false, error: previewBlock };

  const parsed = messageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Mensaje no válido." };

  const listing = await prisma.listing.findUnique({
    where: { id: parsed.data.listingId },
    include: { host: true },
  });
  if (!listing) return { ok: false, error: "Anuncio no encontrado." };

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.data.bookingId },
    include: { guest: true },
  });
  if (!booking || booking.listingId !== listing.id) {
    return { ok: false, error: "Reserva no válida." };
  }

  const isHost = listing.hostId === session.user.id;
  const isGuest = booking.guestId === session.user.id;
  if (!isHost && !isGuest) return { ok: false, error: "No autorizado." };
  if (
    booking.status !== BookingStatus.CONFIRMED &&
    booking.status !== BookingStatus.PENDING
  ) {
    return { ok: false, error: "La reserva no admite mensajes." };
  }

  await prisma.message.create({
    data: {
      listingId: listing.id,
      bookingId: booking.id,
      senderId: session.user.id,
      body: parsed.data.body,
    },
  });

  const recipientEmail = isHost
    ? booking.guest.email
    : listing.host.email;

  if (recipientEmail) {
    await sendEmail({
      to: recipientEmail,
      subject: `Nuevo mensaje: ${listing.title}`,
      html: `<p>Nuevo mensaje en <strong>${listing.title}</strong>.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard">Abrir panel</a></p>`,
    });
  }

  revalidatePath(`/dashboard/bookings/${booking.id}`);
  revalidatePath("/host/bookings");
  revalidatePath(`/listings/${listing.id}`);
  return { ok: true };
}
