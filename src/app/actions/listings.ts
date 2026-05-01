"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import {
  designPreviewAllowsEditAnyListing,
  designPreviewWriteBlockedMessage,
} from "@/lib/design-preview";
import { BARCELONA_ZONE_LABELS } from "@/lib/barcelona-zones";
import { isUserApproved } from "@/lib/approval";
import { prisma } from "@/lib/db";

const allowedNeighborhoodLabels = new Set(
  Object.values(BARCELONA_ZONE_LABELS).map((s) => s.trim()),
);

const listingSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(8000),
  city: z.string().min(2).max(80),
  country: z.string().min(2).max(80),
  neighborhood: z
    .string()
    .min(2)
    .max(120)
    .refine((v) => allowedNeighborhoodLabels.has(v.trim()), {
      message: "Barrio inválido.",
    }),
  addressDetail: z.string().max(500).optional().nullable(),
  priceMonthlyEur: z.number().int().min(0).max(50_000).optional().nullable(),
  priceNote: z.string().max(200).optional().nullable(),
  timeZone: z.string().min(3).max(80).default("Europe/Madrid"),
  photoUrls: z.array(z.string().url()).max(12).default([]),

  // Características de la habitación (required)
  bedSize: z.enum(["INDIVIDUAL", "DOBLE"]),
  windowTypes: z
    .array(
      z.enum([
        "CALLE",
        "CORAZON_DE_MANZANA",
        "POZO_DE_AIRE",
        "SIN_VENTANA",
      ]),
    )
    .min(1)
    .max(4)
    .transform((values) => [...new Set(values)]),
  roomSizeSqm: z.number().int().min(5).max(150),
  furnished: z.boolean(),

  // Características del piso (required)
  apartmentRooms: z.number().int().min(1).max(20),
  apartmentBaths: z.number().int().min(1).max(20),
  apartmentSizeSqm: z.number().int().min(10).max(500),
  wifi: z.boolean(),
});

export async function createListing(
  input: z.infer<typeof listingSchema>,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesión." };
  if (!isUserApproved(session)) {
    return { ok: false, error: "Tu cuenta está pendiente de aprobación." };
  }
  const previewBlock = designPreviewWriteBlockedMessage(session);
  if (previewBlock) return { ok: false, error: previewBlock };

  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Revisa los campos del formulario." };
  }

  const data = parsed.data;
  const listing = await prisma.listing.create({
    data: {
      hostId: session.user.id,
      title: data.title,
      description: data.description,
      city: data.city,
      country: data.country,
      neighborhood: data.neighborhood,
      addressDetail: data.addressDetail ?? null,
      priceMonthlyEur: data.priceMonthlyEur ?? null,
      priceNote: data.priceNote ?? null,
      timeZone: data.timeZone,
      bedSize: data.bedSize,
      windowTypes: data.windowTypes,
      roomSizeSqm: data.roomSizeSqm,
      furnished: data.furnished,
      apartmentRooms: data.apartmentRooms,
      apartmentBaths: data.apartmentBaths,
      apartmentSizeSqm: data.apartmentSizeSqm,
      wifi: data.wifi,
      photos: {
        create: data.photoUrls.map((url, i) => ({ url, sortOrder: i })),
      },
    },
  });

  revalidatePath("/listings");
  revalidatePath("/host/listings");
  return { ok: true, id: listing.id };
}

export async function updateListing(
  id: string,
  input: z.infer<typeof listingSchema>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesión." };
  if (!isUserApproved(session)) {
    return { ok: false, error: "Tu cuenta está pendiente de aprobación." };
  }
  const previewBlock = designPreviewWriteBlockedMessage(session);
  if (previewBlock) return { ok: false, error: previewBlock };

  const listing = await prisma.listing.findUnique({ where: { id } });
  const allowAnyPreview =
    designPreviewAllowsEditAnyListing() && Boolean(session.user.designPreview);
  if (
    !listing ||
    (!allowAnyPreview && listing.hostId !== session.user.id)
  ) {
    return { ok: false, error: "No autorizado." };
  }

  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Revisa los campos del formulario." };
  }

  const data = parsed.data;
  await prisma.$transaction([
    prisma.listingPhoto.deleteMany({ where: { listingId: id } }),
    prisma.listing.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        city: data.city,
        country: data.country,
        neighborhood: data.neighborhood,
        addressDetail: data.addressDetail ?? null,
        priceMonthlyEur: data.priceMonthlyEur ?? null,
        priceNote: data.priceNote ?? null,
        timeZone: data.timeZone,
        bedSize: data.bedSize,
        windowTypes: data.windowTypes,
        roomSizeSqm: data.roomSizeSqm,
        furnished: data.furnished,
        apartmentRooms: data.apartmentRooms,
        apartmentBaths: data.apartmentBaths,
        apartmentSizeSqm: data.apartmentSizeSqm,
        wifi: data.wifi,
        photos: {
          create: data.photoUrls.map((url, i) => ({ url, sortOrder: i })),
        },
      },
    }),
  ]);

  revalidatePath("/listings");
  revalidatePath(`/listings/${id}`);
  revalidatePath("/host/listings");
  revalidatePath(`/host/listings/${id}/edit`);
  return { ok: true };
}
