"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const SignupProfileInputSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(1).max(120),
  whatsappNumber: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .transform((raw) => raw.replace(/\s+/g, " "))
    .superRefine((raw, ctx) => {
      const digitsOnly = raw.replace(/[^\d+]/g, "");
      const phone = parsePhoneNumberFromString(digitsOnly);
      if (!phone || !phone.isValid()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Número de WhatsApp inválido. Usá formato internacional (E.164), ej: +34600111222.",
        });
      }
    })
    .transform((raw) => {
      const digitsOnly = raw.replace(/[^\d+]/g, "");
      const phone = parsePhoneNumberFromString(digitsOnly);
      return phone ? phone.number : raw;
    }),
});

export async function upsertSignupProfileAction(input: {
  email: string;
  name: string;
  whatsappNumber: string;
}) {
  const data = SignupProfileInputSchema.parse(input);

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.signupProfile.upsert({
    where: { email: data.email },
    create: {
      email: data.email,
      name: data.name,
      whatsappNumber: data.whatsappNumber,
      expiresAt,
    },
    update: {
      name: data.name,
      whatsappNumber: data.whatsappNumber,
      expiresAt,
    },
  });
}

