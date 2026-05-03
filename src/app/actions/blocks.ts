"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { designPreviewWriteBlockedMessage } from "@/lib/design-preview";
import { isUserApproved } from "@/lib/approval";
import { prisma } from "@/lib/db";
import { canEditListingAsOwnerOrAdmin } from "@/lib/listing-edit-permissions";
import { parseDateOnly } from "@/lib/dates";

const blockSchema = z.object({
  listingId: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(200).optional().nullable(),
});

export async function createAvailabilityBlock(
  input: z.infer<typeof blockSchema>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesión." };
  if (!isUserApproved(session)) {
    return { ok: false, error: "Tu cuenta está pendiente de aprobación." };
  }
  const previewBlock = designPreviewWriteBlockedMessage(session);
  if (previewBlock) return { ok: false, error: previewBlock };

  const parsed = blockSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Fechas no válidas." };

  const listing = await prisma.listing.findUnique({
    where: { id: parsed.data.listingId },
  });
  if (!listing || !canEditListingAsOwnerOrAdmin(session, listing.hostId)) {
    return { ok: false, error: "No autorizado." };
  }

  const start = parseDateOnly(parsed.data.startDate);
  const end = parseDateOnly(parsed.data.endDate);
  if (!(start < end)) {
    return { ok: false, error: "La fecha de fin debe ser posterior." };
  }

  await prisma.availabilityBlock.create({
    data: {
      listingId: listing.id,
      startDate: start,
      endDate: end,
      reason: parsed.data.reason ?? null,
    },
  });

  revalidatePath(`/host/listings/${listing.id}/edit`);
  revalidatePath(`/listings/${listing.id}`);
  revalidatePath("/listings");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteAvailabilityBlock(
  blockId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesión." };
  if (!isUserApproved(session)) {
    return { ok: false, error: "Tu cuenta está pendiente de aprobación." };
  }
  const previewBlock = designPreviewWriteBlockedMessage(session);
  if (previewBlock) return { ok: false, error: previewBlock };

  const block = await prisma.availabilityBlock.findUnique({
    where: { id: blockId },
    include: { listing: true },
  });
  if (
    !block ||
    !canEditListingAsOwnerOrAdmin(session, block.listing.hostId)
  ) {
    return { ok: false, error: "No autorizado." };
  }

  await prisma.availabilityBlock.delete({ where: { id: blockId } });

  revalidatePath(`/host/listings/${block.listingId}/edit`);
  revalidatePath(`/listings/${block.listingId}`);
  revalidatePath("/listings");
  revalidatePath("/admin");
  return { ok: true };
}
