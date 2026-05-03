"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { isUserApproved } from "@/lib/approval";
import { designPreviewWriteBlockedMessage } from "@/lib/design-preview";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";

const inquirySchema = z.object({
  listingId: z.string().min(1),
  message: z.string().trim().min(5).max(4000),
});

export async function sendHostInquiry(
  input: z.infer<typeof inquirySchema>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesión." };
  if (!isUserApproved(session)) {
    return { ok: false, error: "Tu cuenta está pendiente de aprobación." };
  }

  const previewBlock = designPreviewWriteBlockedMessage(session);
  if (previewBlock) return { ok: false, error: previewBlock };

  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Mensaje no válido." };

  // One inquiry per user per listing (hard limit).
  const alreadySent = await prisma.message.findFirst({
    where: {
      listingId: parsed.data.listingId,
      senderId: session.user.id,
      bookingId: null,
    },
    select: { id: true },
  });
  if (alreadySent) {
    return { ok: false, error: "Ya enviaste una solicitud para este anuncio." };
  }

  // Burst protection (still useful even with the one-per-listing check).
  if (!rateLimit(`host-inquiry:${session.user.id}`, 6, 60_000)) {
    return { ok: false, error: "Demasiadas solicitudes. Espera un momento." };
  }

  const listing = await prisma.listing.findUnique({
    where: { id: parsed.data.listingId },
    include: { host: true },
  });
  if (!listing) return { ok: false, error: "Anuncio no encontrado." };
  if (listing.hostId === session.user.id) {
    return { ok: false, error: "No podés enviarte un mensaje a vos mismo." };
  }

  await prisma.message.create({
    data: {
      listingId: listing.id,
      bookingId: null,
      senderId: session.user.id,
      body: parsed.data.message,
    },
  });

  const recipientEmail = listing.host.email?.trim();
  if (recipientEmail) {
    const name = session.user.name?.trim() || "—";
    const email = session.user.email?.trim() || "—";
    const whatsapp =
      (session.user as { whatsappNumber?: string }).whatsappNumber?.trim() ||
      "—";

    const subject = `Nueva solicitud: ${listing.title}`;
    const html = `
      <p><strong>Nueva solicitud</strong> para <strong>${escapeHtml(listing.title)}</strong>.</p>
      <ul>
        <li><strong>Nombre</strong>: ${escapeHtml(name)}</li>
        <li><strong>Email</strong>: ${escapeHtml(email)}</li>
        <li><strong>WhatsApp</strong>: ${escapeHtml(whatsapp)}</li>
      </ul>
      <p><strong>Mensaje</strong>:</p>
      <pre style="white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;line-height:1.4;margin:0;">${escapeHtml(
        parsed.data.message,
      )}</pre>
    `;
    await sendEmail({ to: recipientEmail, subject, html }).catch(() => {});
  }

  revalidatePath("/mis-cosas/mensajes");
  revalidatePath(`/mis-cosas/mensajes/inquiry/${listing.id}/${session.user.id}`);
  revalidatePath(`/mis-cosas/mensajes/inquiry/${listing.id}/${listing.hostId}`);

  return { ok: true };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

