"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { isUserApproved } from "@/lib/approval";
import { parseAdminEmails } from "@/lib/admin";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { designPreviewWriteBlockedMessage } from "@/lib/design-preview";

const contactSchema = z.object({
  message: z.string().trim().min(5).max(4000),
});

export async function sendContactMessageAction(
  input: z.infer<typeof contactSchema>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesión." };
  if (!isUserApproved(session)) {
    return { ok: false, error: "Tu cuenta está pendiente de aprobación." };
  }

  const previewBlock = designPreviewWriteBlockedMessage(session);
  if (previewBlock) return { ok: false, error: previewBlock };

  if (!rateLimit(`contact:${session.user.id}`, 6, 60_000)) {
    return { ok: false, error: "Demasiados mensajes. Espera un momento." };
  }

  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Mensaje no válido." };
  }

  const adminEmails = parseAdminEmails();
  if (adminEmails.length === 0) {
    return { ok: false, error: "Contacto no disponible en este momento." };
  }

  const name = session.user.name?.trim() || "—";
  const email = session.user.email?.trim() || "—";
  const whatsapp = (session.user as { whatsappNumber?: string }).whatsappNumber?.trim() || "—";

  const subject = `Contacto: ${name} (${email})`;
  const html = `
    <p><strong>Nuevo mensaje de contacto</strong></p>
    <ul>
      <li><strong>Usuario</strong>: ${escapeHtml(name)}</li>
      <li><strong>Email</strong>: ${escapeHtml(email)}</li>
      <li><strong>WhatsApp</strong>: ${escapeHtml(whatsapp)}</li>
    </ul>
    <p><strong>Mensaje</strong>:</p>
    <pre style="white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;line-height:1.4;margin:0;">${escapeHtml(
      parsed.data.message,
    )}</pre>
  `;

  await Promise.all(adminEmails.map((to) => sendEmail({ to, subject, html }).catch(() => {})));
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

