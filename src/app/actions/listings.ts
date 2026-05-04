"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { designPreviewWriteBlockedMessage } from "@/lib/design-preview";
import { BARCELONA_ZONE_LABELS } from "@/lib/barcelona-zones";
import { isUserApproved } from "@/lib/approval";
import { BookingStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import {
  listingDescriptionPlainTextLength,
  sanitizeListingDescriptionHtml,
} from "@/lib/listing-description-html";
import { canEditListingAsOwnerOrAdmin } from "@/lib/listing-edit-permissions";

const allowedNeighborhoodLabels = new Set(
  Object.values(BARCELONA_ZONE_LABELS).map((s) => s.trim()),
);

function listingParseErrorMessage(err: z.ZodError): string {
  const issue = err.issues[0];
  if (!issue) return "Revisa los campos del formulario.";
  const top = issue.path[0];
  if (top === "title") {
    return "El título debe tener entre 3 y 120 caracteres.";
  }
  if (top === "description") {
    return "La descripción debe tener entre 10 y 8000 caracteres.";
  }
  if (top === "neighborhood") {
    return issue.message === "Barrio inválido." ? issue.message : "Revisá el barrio seleccionado.";
  }
  if (top === "photoUrls") {
    return "Alguna foto no se pudo validar. Probá volver a subir las imágenes.";
  }
  if (top === "windowTypes") {
    return "Elegí al menos un tipo de ventana.";
  }
  return "Revisa los campos del formulario.";
}

const listingSchema = z.object({
  title: z.string().min(3).max(120),
  description: z
    .string()
    .max(60_000)
    .refine(
      (s) => {
        const len = listingDescriptionPlainTextLength(s);
        return len >= 10 && len <= 8000;
      },
      { message: "La descripción debe tener entre 10 y 8000 caracteres." },
    ),
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

  showWhatsappOnListing: z.boolean(),
  showEmailOnListing: z.boolean(),
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
    return { ok: false, error: listingParseErrorMessage(parsed.error) };
  }

  const data = parsed.data;
  const listing = await prisma.listing.create({
    data: {
      hostId: session.user.id,
      title: data.title,
      description: sanitizeListingDescriptionHtml(data.description),
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
      showWhatsappOnListing: data.showWhatsappOnListing,
      showEmailOnListing: data.showEmailOnListing,
      photos: {
        create: data.photoUrls.map((url, i) => ({ url, sortOrder: i })),
      },
    },
  });

  revalidatePath("/listings");
  revalidatePath("/host/listings");
  revalidatePath("/mis-cosas/anuncios");
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
  if (!listing || !canEditListingAsOwnerOrAdmin(session, listing.hostId)) {
    return { ok: false, error: "No autorizado." };
  }

  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: listingParseErrorMessage(parsed.error) };
  }

  const data = parsed.data;
  await prisma.$transaction([
    prisma.listingPhoto.deleteMany({ where: { listingId: id } }),
    prisma.listing.update({
      where: { id },
      data: {
        title: data.title,
        description: sanitizeListingDescriptionHtml(data.description),
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
        showWhatsappOnListing: data.showWhatsappOnListing,
        showEmailOnListing: data.showEmailOnListing,
        photos: {
          create: data.photoUrls.map((url, i) => ({ url, sortOrder: i })),
        },
      },
    }),
  ]);

  revalidatePath("/listings");
  revalidatePath(`/listings/${id}`);
  revalidatePath("/host/listings");
  revalidatePath("/mis-cosas/anuncios");
  revalidatePath(`/host/listings/${id}/edit`);
  return { ok: true };
}

export async function deleteListing(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesión." };
  if (!isUserApproved(session)) {
    return { ok: false, error: "Tu cuenta está pendiente de aprobación." };
  }
  const previewBlock = designPreviewWriteBlockedMessage(session);
  if (previewBlock) return { ok: false, error: previewBlock };

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || !canEditListingAsOwnerOrAdmin(session, listing.hostId)) {
    return { ok: false, error: "No autorizado." };
  }

  const activeBookings = await prisma.booking.count({
    where: {
      listingId: id,
      status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
    },
  });
  if (activeBookings > 0) {
    return {
      ok: false,
      error:
        "No podés eliminar el anuncio mientras tenga reservas pendientes o confirmadas.",
    };
  }

  await prisma.listing.delete({ where: { id } });

  revalidatePath("/listings");
  revalidatePath(`/listings/${id}`);
  revalidatePath("/host/listings");
  revalidatePath("/mis-cosas/anuncios");
  revalidatePath(`/host/listings/${id}/edit`);
  revalidatePath("/admin");
  return { ok: true };
}
