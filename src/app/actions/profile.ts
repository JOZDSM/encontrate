"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { notifyAdminsIfPendingUserAddedFirstWhatsapp } from "@/lib/admin-pending-user-email";
import { prisma } from "@/lib/db";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const UpdateProfileSchema = z.object({
  name: z.string().trim().min(1).max(120),
  whatsappNumber: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .superRefine((raw, ctx) => {
      const digitsOnly = raw.replace(/[^\d+]/g, "");
      const phone = parsePhoneNumberFromString(digitsOnly);
      if (!phone || !phone.isValid()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Número de WhatsApp inválido. Usá formato internacional (E.164), ej: +34600111222.",
        });
      }
    })
    .transform((raw) => {
      const digitsOnly = raw.replace(/[^\d+]/g, "");
      const phone = parsePhoneNumberFromString(digitsOnly);
      return phone ? phone.number : raw;
    }),
});

export async function updateMyProfileAction(input: {
  name: string;
  whatsappNumber: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesión." };

  const parsed = UpdateProfileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Revisa los campos." };

  const before = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      whatsappNumber: true,
      isApproved: true,
    },
  });
  if (!before) return { ok: false, error: "Usuario no encontrado." };

  const hadWhatsapp = Boolean(before.whatsappNumber?.trim());

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      whatsappNumber: parsed.data.whatsappNumber,
    },
  });

  const email = before.email?.trim() || session.user.email?.trim() || "";
  void notifyAdminsIfPendingUserAddedFirstWhatsapp({
    userId: session.user.id,
    hadWhatsappBefore: hadWhatsapp,
    wasApprovedBefore: before.isApproved,
    email,
    displayName: parsed.data.name.trim(),
    whatsapp: parsed.data.whatsappNumber.trim(),
  });

  return { ok: true };
}

