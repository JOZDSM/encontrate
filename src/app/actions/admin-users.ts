"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { isPlatformAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export async function approveUserAction(
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!isPlatformAdmin(session)) return { ok: false, error: "No autorizado." };

  const user = await prisma.user.update({
    where: { id: userId },
    data: { isApproved: true },
    select: { email: true, name: true },
  });

  if (user.email) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.encontrate.es";
    const subject = "Tu cuenta fue aprobada";
    const html = `
      <p>Hola${user.name ? ` ${user.name}` : ""},</p>
      <p>Tu cuenta en <strong>encontrate</strong> fue aprobada. Ya podés usar la plataforma.</p>
      <p><a href="${appUrl}/listings">Buscar habitaciones</a></p>
      <p>Si no solicitaste esta cuenta, podés ignorar este mensaje.</p>
    `;
    await sendEmail({ to: user.email, subject, html }).catch(() => {});
  }

  revalidatePath("/admin");
  return { ok: true };
}

export async function denyUserAction(
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!isPlatformAdmin(session)) return { ok: false, error: "No autorizado." };

  if (session?.user?.id === userId) {
    return { ok: false, error: "No podés rechazar tu propia cuenta." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, isApproved: true, isAdmin: true },
  });
  if (!user) return { ok: true };
  if (user.isAdmin) {
    return { ok: false, error: "No podés rechazar una cuenta admin." };
  }
  if (user.isApproved) {
    return { ok: false, error: "Esa cuenta ya fue aprobada." };
  }

  await prisma.user.delete({ where: { id: userId } });

  if (user.email) {
    const subject = "Tu cuenta no fue aprobada";
    const html = `
      <p>Hola${user.name ? ` ${user.name}` : ""},</p>
      <p>Gracias por registrarte en <strong>encontrate</strong>.</p>
      <p>Por el momento, tu cuenta no fue aprobada. Si creés que esto es un error, respondé a este email.</p>
    `;
    await sendEmail({ to: user.email, subject, html }).catch(() => {});
  }

  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteUserAction(
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!isPlatformAdmin(session)) return { ok: false, error: "No autorizado." };

  if (session?.user?.id === userId) {
    return { ok: false, error: "No podés eliminar tu propia cuenta." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, isAdmin: true },
  });
  if (!user) return { ok: true };
  if (user.isAdmin) {
    return { ok: false, error: "No podés eliminar una cuenta admin." };
  }

  await prisma.user.delete({ where: { id: userId } });

  if (user.email) {
    const subject = "Tu cuenta fue eliminada";
    const html = `
      <p>Hola${user.name ? ` ${user.name}` : ""},</p>
      <p>Tu cuenta en <strong>encontrate</strong> fue eliminada por el administrador.</p>
      <p>Si creés que esto es un error, respondé a este email.</p>
    `;
    await sendEmail({ to: user.email, subject, html }).catch(() => {});
  }

  revalidatePath("/admin");
  return { ok: true };
}

