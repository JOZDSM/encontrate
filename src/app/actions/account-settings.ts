"use server";

import { randomBytes } from "node:crypto";
import { z } from "zod";
import { auth, signOut } from "@/auth";
import { designPreviewWriteBlockedMessage } from "@/lib/design-preview";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/db";
import { normalizeWhatsappE164 } from "@/lib/whatsapp-e164";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

export async function requestEmailChangeAction(
  rawNewEmail: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Iniciá sesión." };
  }
  const preview = designPreviewWriteBlockedMessage(session);
  if (preview) return { ok: false, error: preview };

  const parsed = z.string().trim().toLowerCase().email().safeParse(rawNewEmail);
  if (!parsed.success) {
    return { ok: false, error: "Ingresá un email válido." };
  }
  const newEmail = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true },
  });
  if (!user?.email) {
    return { ok: false, error: "Tu cuenta no tiene email para cambiar." };
  }
  const current = user.email.trim().toLowerCase();
  if (newEmail === current) {
    return { ok: false, error: "Ese ya es tu email actual." };
  }

  const taken = await prisma.user.findFirst({
    where: {
      email: { equals: newEmail, mode: "insensitive" },
      NOT: { id: user.id },
    },
  });
  if (taken) {
    return { ok: false, error: "Ese email ya está registrado en otra cuenta." };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.emailChangeRequest.deleteMany({ where: { userId: user.id } }),
    prisma.emailChangeRequest.create({
      data: {
        userId: user.id,
        newEmail,
        token,
        expiresAt,
      },
    }),
  ]);

  const confirmUrl = `${APP_URL}/confirmar-cambio-email?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to: newEmail,
    subject: "Confirmá tu nuevo email en encontrate",
    html: `
      <p>Hola,</p>
      <p>Recibimos un pedido para usar este email en tu cuenta de <strong>encontrate</strong>.</p>
      <p>Si fuiste vos, confirmá el cambio tocando el botón (o abriendo el link):</p>
      <p><a href="${confirmUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;border-radius:999px;text-decoration:none;font-weight:600;">Confirmar email</a></p>
      <p style="font-size:13px;color:#555"><a href="${confirmUrl}">${confirmUrl}</a></p>
      <p style="font-size:13px;color:#555">El link vence en 24 horas. Si no pediste este cambio, ignorá este mensaje.</p>
    `,
  });

  return { ok: true };
}

export async function confirmEmailChangeAction(
  token: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = token.trim();
  if (!trimmed) {
    return { ok: false, error: "Falta el token de confirmación." };
  }

  const row = await prisma.emailChangeRequest.findUnique({
    where: { token: trimmed },
    include: { user: { select: { id: true, email: true } } },
  });

  if (!row) {
    return { ok: false, error: "El link no es válido o ya fue usado." };
  }
  if (row.expiresAt.getTime() < Date.now()) {
    await prisma.emailChangeRequest.delete({ where: { id: row.id } }).catch(() => {});
    return { ok: false, error: "El link expiró. Pedí un cambio de email de nuevo." };
  }

  const newEmail = row.newEmail.trim().toLowerCase();
  const conflict = await prisma.user.findFirst({
    where: {
      email: { equals: newEmail, mode: "insensitive" },
      NOT: { id: row.userId },
    },
  });
  if (conflict) {
    await prisma.emailChangeRequest.delete({ where: { id: row.id } }).catch(() => {});
    return {
      ok: false,
      error: "Ese email ya está en uso. Pedí un cambio con otro email.",
    };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: {
        email: newEmail,
        emailVerified: new Date(),
      },
    }),
    prisma.emailChangeRequest.delete({ where: { id: row.id } }),
  ]);

  await signOut({ redirectTo: "/login?emailActualizado=1" });
  return { ok: true };
}

export async function updateWhatsappAction(
  raw: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Iniciá sesión." };
  }
  const preview = designPreviewWriteBlockedMessage(session);
  if (preview) return { ok: false, error: preview };

  const phone = normalizeWhatsappE164(raw);
  if (!phone.ok) return { ok: false, error: phone.message };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { whatsappNumber: phone.value },
  });

  return { ok: true };
}

export async function deleteAccountAction(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Iniciá sesión." };
  }
  const preview = designPreviewWriteBlockedMessage(session);
  if (preview) return { ok: false, error: preview };

  await prisma.user.delete({ where: { id: session.user.id } });

  await signOut({ redirectTo: "/?cuentaEliminada=1" });
  return { ok: true };
}
