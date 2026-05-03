"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { normalizeWhatsappE164 } from "@/lib/whatsapp-e164";

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
      const r = normalizeWhatsappE164(raw);
      if (!r.ok) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: r.message,
        });
      }
    })
    .transform((raw) => {
      const r = normalizeWhatsappE164(raw);
      return r.ok ? r.value : raw;
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

