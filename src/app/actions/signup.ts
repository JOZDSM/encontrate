"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";

const SignupProfileInputSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().max(120).optional().default(""),
  whatsappNumber: z.string().trim().max(40).optional().default(""),
});

export async function upsertSignupProfileAction(input: {
  email: string;
  name?: string;
  whatsappNumber?: string;
}) {
  const data = SignupProfileInputSchema.parse(input);

  const name = data.name ? data.name : null;
  const whatsappNumber = data.whatsappNumber ? data.whatsappNumber : null;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.signupProfile.upsert({
    where: { email: data.email },
    create: {
      email: data.email,
      name,
      whatsappNumber,
      expiresAt,
    },
    update: {
      name,
      whatsappNumber,
      expiresAt,
    },
  });
}

