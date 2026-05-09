"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { isUserApproved } from "@/lib/approval";
import { designPreviewWriteBlockedMessage } from "@/lib/design-preview";
import { COUNTRY_OPTIONS } from "@/lib/countries";
import { prisma } from "@/lib/db";

const GENDER = ["FEMALE", "MALE", "NON_BINARY", "OTHER"] as const;
const LANGUAGE = ["ES", "EN", "CA", "IT", "FR", "DE", "PT", "OTHER"] as const;
const MOVING_WITH = ["SOLO", "COUPLE", "FAMILY", "ROOMMATES"] as const;
const OCCUPATION = [
  "STUDENT",
  "EMPLOYED",
  "FREELANCE",
  "ENTREPRENEUR",
  "REMOTE_WORKER",
  "OTHER",
] as const;
const FLEX_STAY_LENGTH = ["WEEKEND", "WEEK", "MONTH"] as const;
const DATE_MODE = ["exact", "flex", "asap"] as const;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const allowedCountries = new Set<string>(COUNTRY_OPTIONS);

const filterSchema = z.object({
  enabled: z.boolean(),
  notifyByEmail: z.boolean(),
  genders: z.array(z.enum(GENDER)).max(GENDER.length),
  ageMin: z.number().int().min(16).max(120).nullable(),
  ageMax: z.number().int().min(16).max(120).nullable(),
  countriesOfOrigin: z
    .array(z.string().trim().min(1).max(120))
    .max(COUNTRY_OPTIONS.length)
    .refine((arr) => arr.every((v) => allowedCountries.has(v)), {
      message: "País inválido.",
    }),
  occupations: z.array(z.enum(OCCUPATION)).max(OCCUPATION.length),
  languages: z.array(z.enum(LANGUAGE)).max(LANGUAGE.length),
  movingWith: z.array(z.enum(MOVING_WITH)).max(MOVING_WITH.length),
  cleanlinessMin: z.number().int().min(1).max(10).nullable(),
  cleanlinessMax: z.number().int().min(1).max(10).nullable(),
  orderMin: z.number().int().min(1).max(10).nullable(),
  orderMax: z.number().int().min(1).max(10).nullable(),
  dateMode: z.enum(DATE_MODE).nullable(),
  exactCheckIn: isoDate.nullable(),
  exactCheckOut: isoDate.nullable(),
  exactFlexDays: z.number().int().min(0).max(31).nullable(),
  flexStayLengths: z.array(z.enum(FLEX_STAY_LENGTH)).max(FLEX_STAY_LENGTH.length),
  flexMonths: z.array(z.string().regex(/^\d{4}-\d{2}$/)).max(60),
  includeAsap: z.boolean(),
});

export type BuscarHuespedFilterInput = z.infer<typeof filterSchema>;

export async function saveBuscarHuespedFilter(
  input: BuscarHuespedFilterInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesión." };
  if (!isUserApproved(session)) {
    return { ok: false, error: "Tu cuenta está pendiente de aprobación." };
  }
  const previewBlock = designPreviewWriteBlockedMessage(session);
  if (previewBlock) return { ok: false, error: previewBlock };

  const parsed = filterSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: issue?.message ?? "Revisa los campos del formulario.",
    };
  }

  const data = parsed.data;
  await prisma.buscarHuespedFilter.upsert({
    where: { userId: session.user.id },
    update: data,
    create: { userId: session.user.id, ...data },
  });

  revalidatePath("/mis-cosas/buscar-huesped");
  return { ok: true };
}

export async function markSignalMatchViewed(
  matchId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesión." };

  // Owner-gated: only the host who received the match can mark it viewed.
  const match = await prisma.signalMatch.findUnique({
    where: { id: matchId },
    select: { hostId: true },
  });
  if (!match || match.hostId !== session.user.id) {
    return { ok: false, error: "No autorizado." };
  }

  await prisma.signalMatch.update({
    where: { id: matchId },
    data: { viewedAt: new Date() },
  });
  revalidatePath("/mis-cosas/buscar-huesped");
  return { ok: true };
}
