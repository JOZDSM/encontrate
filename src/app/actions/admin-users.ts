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

