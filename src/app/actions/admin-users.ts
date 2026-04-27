"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { isPlatformAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function approveUserAction(
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!isPlatformAdmin(session)) return { ok: false, error: "No autorizado." };

  await prisma.user.update({
    where: { id: userId },
    data: { isApproved: true },
  });

  revalidatePath("/admin");
  return { ok: true };
}

