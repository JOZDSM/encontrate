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
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/mis-cosas/mensajes">Abrir mensajes</a></p>`,
    });
  }

  revalidatePath(`/dashboard/bookings/${booking.id}`);
  revalidatePath("/mis-cosas/mensajes");
  revalidatePath(`/listings/${listing.id}`);
  return { ok: true };
}

const inquiryReplySchema = z.object({
  listingId: z.string().min(1),
  guestUserId: z.string().min(1),
  body: z.string().trim().min(1).max(4000),
});

/** Reply in a pre-booking thread (messages with no booking). Only the listing host can send. */
export async function sendInquiryReply(
  input: z.infer<typeof inquiryReplySchema>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesión." };
  if (!isUserApproved(session)) {
    return { ok: false, error: "Tu cuenta está pendiente de aprobación." };
  }
  const previewBlock = designPreviewWriteBlockedMessage(session);
  if (previewBlock) return { ok: false, error: previewBlock };

  const parsed = inquiryReplySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Mensaje no válido." };

  const listing = await prisma.listing.findUnique({
    where: { id: parsed.data.listingId },
    include: { host: true },
  });
  if (!listing) return { ok: false, error: "Anuncio no encontrado." };
  if (listing.hostId !== session.user.id) {
    return { ok: false, error: "Solo el anfitrión puede responder acá." };
  }
  if (parsed.data.guestUserId === session.user.id) {
    return { ok: false, error: "Destinatario no válido." };
  }

  const guestStarted = await prisma.message.findFirst({
    where: {
      listingId: listing.id,
      bookingId: null,
      senderId: parsed.data.guestUserId,
    },
    select: { id: true },
  });
  if (!guestStarted) {
    return { ok: false, error: "No hay una conversación con ese huésped." };
  }

  await prisma.message.create({
    data: {
      listingId: listing.id,
      bookingId: null,
      senderId: session.user.id,
      body: parsed.data.body,
    },
  });

  const guest = await prisma.user.findUnique({
    where: { id: parsed.data.guestUserId },
    select: { email: true },
  });
  const guestEmail = guest?.email?.trim();
  if (guestEmail) {
    await sendEmail({
      to: guestEmail,
      subject: `Nuevo mensaje: ${listing.title}`,
      html: `<p>El anfitrión te respondió sobre <strong>${listing.title}</strong>.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/mis-cosas/mensajes/inquiry/${listing.id}/${listing.hostId}">Ver conversación</a></p>`,
    }).catch(() => {});
  }

  revalidatePath("/mis-cosas/mensajes");
  revalidatePath(
    `/mis-cosas/mensajes/inquiry/${listing.id}/${parsed.data.guestUserId}`,
  );
  revalidatePath(
    `/mis-cosas/mensajes/inquiry/${listing.id}/${listing.hostId}`,
  );
  revalidatePath(`/listings/${listing.id}`);

  return { ok: true };
}
