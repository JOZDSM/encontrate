"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { isUserApproved } from "@/lib/approval";
import { isPlatformAdmin } from "@/lib/admin";
import { designPreviewWriteBlockedMessage } from "@/lib/design-preview";
import { prisma } from "@/lib/db";
import {
  listingDescriptionPlainTextLength,
  sanitizeListingDescriptionHtml,
} from "@/lib/listing-description-html";
import { COUNTRY_OPTIONS } from "@/lib/countries";

const allowedCountries = new Set<string>(COUNTRY_OPTIONS);

const GENDER = ["FEMALE", "MALE", "NON_BINARY", "OTHER"] as const;
const LANGUAGE = ["ES", "EN", "CA", "IT", "FR", "DE", "PT", "OTHER"] as const;
const MOVING_WITH = ["SOLO", "COUPLE", "OTHER"] as const;
const OCCUPATION = [
  "STUDENT",
  "EMPLOYED",
  "FREELANCE",
  "ENTREPRENEUR",
  "REMOTE_WORKER",
  "OTHER",
] as const;
const DATE_MODE = ["exact", "flex", "asap"] as const;
const FLEX_STAY_LENGTH = ["WEEKEND", "WEEK", "MONTH"] as const;
const BED_SIZE = ["INDIVIDUAL", "DOBLE"] as const;
const WINDOW_TYPE = [
  "CALLE",
  "CORAZON_DE_MANZANA",
  "POZO_DE_AIRE",
  "SIN_VENTANA",
] as const;

/** ISO `YYYY-MM-DD` (date-only). Used for date columns stored with `@db.Date`. */
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const handle = z.string().trim().max(80).optional().nullable();

/**
 * Per-step zod variants. Each variant is a "patch" applied to the Signal row;
 * we never overwrite untouched fields. The wizard calls `updateSignalStep`
 * with the variant matching the user's current step on each "Siguiente" click.
 */
const stepSchemas = {
  identity: z.object({
    step: z.literal("identity"),
    fullName: z.string().trim().min(3).max(120),
    age: z.number().int().min(16).max(120).nullable(),
    gender: z.enum(GENDER).nullable(),
    countryOfOrigin: z
      .string()
      .trim()
      .max(120)
      .nullable()
      .refine((v) => v === null || v.length === 0 || allowedCountries.has(v), {
        message: "País inválido.",
      })
      .transform((v) => (v && v.length > 0 ? v : null)),
  }),
  photos: z.object({
    step: z.literal("photos"),
    photoUrls: z.array(z.string().url()).max(1).default([]),
  }),
  basics: z.object({
    step: z.literal("basics"),
    occupation: z.enum(OCCUPATION).nullable(),
    languages: z.array(z.enum(LANGUAGE)).max(LANGUAGE.length).default([]),
    movingWith: z.enum(MOVING_WITH).nullable(),
  }),
  more: z.object({
    step: z.literal("more"),
    timeUseDescription: z.string().trim().max(280).nullable().optional().default(null),
    indoorOutdoorDescription: z
      .string()
      .trim()
      .max(280)
      .nullable()
      .optional()
      .default(null),
    cleanlinessImportance: z.number().int().min(1).max(10).nullable(),
    orderImportance: z.number().int().min(1).max(10).nullable(),
  }),
  social: z.object({
    step: z.literal("social"),
    instagramHandle: handle,
    twitterHandle: handle,
    facebookHandle: handle,
    tiktokHandle: handle,
  }),
  dates: z.object({
    step: z.literal("dates"),
    dateMode: z.enum(DATE_MODE).nullable(),
    exactCheckIn: isoDate.nullable().optional().default(null),
    exactCheckOut: isoDate.nullable().optional().default(null),
    exactFlexDays: z.number().int().min(0).max(31).nullable().optional().default(null),
    flexStayLengths: z.array(z.enum(FLEX_STAY_LENGTH)).max(FLEX_STAY_LENGTH.length).default([]),
    flexMonths: z
      .array(z.string().regex(/^\d{4}-\d{2}$/))
      .max(60)
      .default([]),
    asapUrgent: z.boolean().default(false),
  }),
  preferencesLocation: z.object({
    step: z.literal("preferencesLocation"),
    preferredZones: z.array(z.string().trim().min(1).max(80)).max(50).default([]),
  }),
  preferencesRoom: z.object({
    step: z.literal("preferencesRoom"),
    preferredBedSizes: z.array(z.enum(BED_SIZE)).max(BED_SIZE.length).default([]),
    preferredWindowTypes: z.array(z.enum(WINDOW_TYPE)).max(WINDOW_TYPE.length).default([]),
    preferredRoomSizeSqmMin: z.number().int().min(0).max(150).nullable(),
    preferredFurnished: z.boolean().nullable(),
    preferredApartmentRoomsMin: z.number().int().min(0).max(20).nullable(),
    preferredApartmentBathsMin: z.number().int().min(0).max(20).nullable(),
    preferredApartmentSizeSqmMin: z.number().int().min(0).max(500).nullable(),
    preferredWifi: z.boolean().nullable(),
  }),
  description: z.object({
    step: z.literal("description"),
    description: z
      .string()
      .max(60_000)
      .refine(
        (s) => {
          const len = listingDescriptionPlainTextLength(s);
          return len === 0 || (len >= 10 && len <= 8000);
        },
        { message: "La descripción debe tener entre 10 y 8000 caracteres." },
      ),
  }),
  notifications: z.object({
    step: z.literal("notifications"),
    listingAlertInApp: z.boolean(),
    listingAlertEmail: z.boolean(),
  }),
} as const;

const updateSignalStepSchema = z.discriminatedUnion("step", [
  stepSchemas.identity,
  stepSchemas.photos,
  stepSchemas.basics,
  stepSchemas.more,
  stepSchemas.social,
  stepSchemas.dates,
  stepSchemas.preferencesLocation,
  stepSchemas.preferencesRoom,
  stepSchemas.description,
  stepSchemas.notifications,
]);

export type UpdateSignalStepInput = z.infer<typeof updateSignalStepSchema>;

const STEP_INDEX: Record<UpdateSignalStepInput["step"], number> = {
  identity: 0,
  photos: 1,
  basics: 2,
  more: 3,
  social: 4,
  dates: 5,
  preferencesLocation: 6,
  preferencesRoom: 7,
  description: 8,
  notifications: 9,
};

type GetOwnedSignal =
  | { kind: "error"; error: string }
  | {
      kind: "ok";
      signal: NonNullable<Awaited<ReturnType<typeof prisma.signal.findUnique>>>;
      session: NonNullable<Awaited<ReturnType<typeof auth>>>;
    };

async function getOwnedSignal(signalId: string): Promise<GetOwnedSignal> {
  const session = await auth();
  if (!session?.user?.id) return { kind: "error", error: "Inicia sesión." };
  if (!isUserApproved(session)) {
    return { kind: "error", error: "Tu cuenta está pendiente de aprobación." };
  }
  const previewBlock = designPreviewWriteBlockedMessage(session);
  if (previewBlock) return { kind: "error", error: previewBlock };

  const signal = await prisma.signal.findUnique({ where: { id: signalId } });
  if (!signal) return { kind: "error", error: "Señal no encontrada." };
  if (signal.userId !== session.user.id && !isPlatformAdmin(session)) {
    return { kind: "error", error: "No autorizado." };
  }
  return { kind: "ok", signal, session };
}

/**
 * Returns the user's existing DRAFT (or creates a fresh one). When `force` is
 * true, always creates a new DRAFT — used by "Crear nueva señal" from the Mis
 * señales panel sub-section, where the user explicitly wants to start over.
 */
export async function createDraftSignal(
  options: { force?: boolean } = {},
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesión." };
  if (!isUserApproved(session)) {
    return { ok: false, error: "Tu cuenta está pendiente de aprobación." };
  }
  const previewBlock = designPreviewWriteBlockedMessage(session);
  if (previewBlock) return { ok: false, error: previewBlock };

  if (!options.force) {
    const existing = await prisma.signal.findFirst({
      where: { userId: session.user.id, status: "DRAFT" },
      select: { id: true },
    });
    if (existing) return { ok: true, id: existing.id };
  }

  const created = await prisma.signal.create({
    data: {
      userId: session.user.id,
      status: "DRAFT",
      wizardStep: 0,
      wizardFlowVersion: 2,
      fullName: "",
    },
    select: { id: true },
  });
  return { ok: true, id: created.id };
}

export async function updateSignalStep(
  signalId: string,
  input: UpdateSignalStepInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const owned = await getOwnedSignal(signalId);
  if (owned.kind === "error") return { ok: false, error: owned.error };

  const parsed = updateSignalStepSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: issue?.message ?? "Revisa los campos del formulario.",
    };
  }

  const data = parsed.data;
  const stepIndex = STEP_INDEX[data.step];
  // Only advance the resume cursor; never roll it back so going "back" doesn't
  // cause a forward jump to disappear when the user reopens the wizard.
  const nextWizardStep = Math.max(owned.signal.wizardStep, stepIndex + 1);

  if (data.step === "photos") {
    // Defense in depth: the schema already caps `photoUrls` at one entry, but
    // an old client could still POST stale state, so we slice before persisting.
    const photoUrls = data.photoUrls.slice(0, 1);
    await prisma.$transaction([
      prisma.signalPhoto.deleteMany({ where: { signalId } }),
      prisma.signalPhoto.createMany({
        data: photoUrls.map((url, sortOrder) => ({
          signalId,
          url,
          sortOrder,
        })),
      }),
      prisma.signal.update({
        where: { id: signalId },
        data: { wizardStep: nextWizardStep, wizardFlowVersion: 2 },
      }),
    ]);
  } else {
    let patch: Record<string, unknown>;
    if (data.step === "description") {
      patch = { description: sanitizeListingDescriptionHtml(data.description) };
    } else {
      const { step: _, ...rest } = data;
      void _;
      patch = { ...rest };
    }
    await prisma.signal.update({
      where: { id: signalId },
      data: { ...patch, wizardStep: nextWizardStep, wizardFlowVersion: 2 },
    });
  }

  return { ok: true };
}

export async function publishSignal(
  signalId: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const owned = await getOwnedSignal(signalId);
  if (owned.kind === "error") return { ok: false, error: owned.error };

  // Re-read with the bits we need to validate completeness before activating.
  const signal = await prisma.signal.findUnique({
    where: { id: signalId },
    include: { photos: { select: { id: true } } },
  });
  if (!signal) return { ok: false, error: "Señal no encontrada." };

  // Required fields for publish (mirrors the wizard's per-step gating).
  if (!signal.fullName.trim() || signal.fullName.trim().length < 3) {
    return { ok: false, error: "Completá tu nombre antes de publicar." };
  }
  if (!signal.occupation || !signal.movingWith || signal.languages.length === 0) {
    return { ok: false, error: "Completá los básicos antes de publicar." };
  }
  if (!signal.dateMode) {
    return { ok: false, error: "Elegí cuándo te querés mudar antes de publicar." };
  }
  if (
    !signal.description ||
    listingDescriptionPlainTextLength(signal.description) < 10
  ) {
    return {
      ok: false,
      error: "Tu presentación debe tener al menos 10 caracteres.",
    };
  }

  // Demote any prior ACTIVE Señal so the partial unique index stays consistent.
  await prisma.$transaction([
    prisma.signal.updateMany({
      where: { userId: signal.userId, status: "ACTIVE", NOT: { id: signalId } },
      data: { status: "INACTIVE" },
    }),
    prisma.signal.update({
      where: { id: signalId },
      data: { status: "ACTIVE", wizardStep: 10, wizardFlowVersion: 2 },
    }),
  ]);

  revalidatePath("/mis-cosas/signals");
  revalidatePath(`/signals/${signalId}`);
  return { ok: true, id: signalId };
}

export async function setActiveSignal(
  signalId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const owned = await getOwnedSignal(signalId);
  if (owned.kind === "error") return { ok: false, error: owned.error };
  if (owned.signal.status === "DRAFT") {
    return {
      ok: false,
      error: "Terminá de cargar la señal antes de activarla.",
    };
  }

  await prisma.$transaction([
    prisma.signal.updateMany({
      where: {
        userId: owned.signal.userId,
        status: "ACTIVE",
        NOT: { id: signalId },
      },
      data: { status: "INACTIVE" },
    }),
    prisma.signal.update({ where: { id: signalId }, data: { status: "ACTIVE" } }),
  ]);
  revalidatePath("/mis-cosas/signals");
  return { ok: true };
}

export async function deactivateSignal(
  signalId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const owned = await getOwnedSignal(signalId);
  if (owned.kind === "error") return { ok: false, error: owned.error };
  await prisma.signal.update({
    where: { id: signalId },
    data: { status: "INACTIVE" },
  });
  revalidatePath("/mis-cosas/signals");
  return { ok: true };
}

export async function deleteSignal(
  signalId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const owned = await getOwnedSignal(signalId);
  if (owned.kind === "error") return { ok: false, error: owned.error };
  await prisma.signal.delete({ where: { id: signalId } });
  revalidatePath("/mis-cosas/signals");
  return { ok: true };
}

const listingAlertsSchema = z.object({
  listingAlertInApp: z.boolean(),
  listingAlertEmail: z.boolean(),
});

export async function updateSignalListingAlerts(
  signalId: string,
  input: z.infer<typeof listingAlertsSchema>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const owned = await getOwnedSignal(signalId);
  if (owned.kind === "error") return { ok: false, error: owned.error };

  const parsed = listingAlertsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Revisa los campos del formulario." };
  }

  await prisma.signal.update({
    where: { id: signalId },
    data: parsed.data,
  });
  revalidatePath("/mis-cosas/signals");
  return { ok: true };
}

const signalInquiryReplySchema = z.object({
  signalId: z.string().min(1),
  peerUserId: z.string().min(1),
  body: z.string().trim().min(1).max(4000),
});

/**
 * Reply inside a Señal-anchored inquiry thread. Either the Señal author or the
 * peer (the user who first reached out) can call this; the route page enforces
 * the same authorization as the thread view.
 */
export async function sendSignalInquiryReply(
  input: z.infer<typeof signalInquiryReplySchema>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesión." };
  if (!isUserApproved(session)) {
    return { ok: false, error: "Tu cuenta está pendiente de aprobación." };
  }
  const previewBlock = designPreviewWriteBlockedMessage(session);
  if (previewBlock) return { ok: false, error: previewBlock };

  const parsed = signalInquiryReplySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Mensaje no válido." };

  const signal = await prisma.signal.findUnique({
    where: { id: parsed.data.signalId },
    select: { id: true, userId: true, status: true },
  });
  if (!signal) return { ok: false, error: "Señal no encontrada." };
  if (signal.status === "DRAFT") {
    return { ok: false, error: "Esta señal todavía no está publicada." };
  }

  const isAuthor = signal.userId === session.user.id;
  const isPeer = parsed.data.peerUserId === session.user.id;
  if (isAuthor === isPeer) {
    // Either both true (author replied to themselves) or neither — both invalid.
    return { ok: false, error: "No autorizado." };
  }

  // Verify the peer actually started a thread for this Señal.
  const peerStarted = await prisma.message.findFirst({
    where: {
      signalId: signal.id,
      bookingId: null,
      senderId: parsed.data.peerUserId,
    },
    select: { id: true },
  });
  if (!peerStarted) {
    return { ok: false, error: "No hay una conversación con esa persona." };
  }

  await prisma.message.create({
    data: {
      signalId: signal.id,
      listingId: null,
      bookingId: null,
      senderId: session.user.id,
      body: parsed.data.body,
    },
  });

  revalidatePath("/mis-cosas/mensajes");
  revalidatePath(
    `/mis-cosas/mensajes/signal/${signal.id}/${parsed.data.peerUserId}`,
  );
  revalidatePath(
    `/mis-cosas/mensajes/signal/${signal.id}/${signal.userId}`,
  );
  return { ok: true };
}

export async function markGuestListingMatchViewed(
  matchId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesión." };

  // Owner-gated through the linked Señal: only the user who owns the matching
  // Señal can mark their own match notification as viewed.
  const match = await prisma.guestListingMatch.findUnique({
    where: { id: matchId },
    select: { signal: { select: { userId: true } } },
  });
  if (!match || match.signal.userId !== session.user.id) {
    return { ok: false, error: "No autorizado." };
  }

  await prisma.guestListingMatch.update({
    where: { id: matchId },
    data: { viewedAt: new Date() },
  });
  revalidatePath("/mis-cosas/mensajes");
  return { ok: true };
}
