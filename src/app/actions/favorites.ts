"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { isUserApproved } from "@/lib/approval";
import { isUserProfileComplete } from "@/lib/profile";
import { prisma } from "@/lib/db";

export async function toggleListingFavorite(
  listingId: string,
): Promise<
  { ok: true; favorited: boolean } | { ok: false; error: string }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Inicia sesión para guardar favoritos." };
  }
  if (!isUserProfileComplete(session)) {
    return { ok: false, error: "Completá tu perfil para usar favoritos." };
  }
  if (!isUserApproved(session)) {
    return { ok: false, error: "Tu cuenta está pendiente de aprobación." };
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true },
  });
  if (!listing) return { ok: false, error: "Anuncio no encontrado." };

  try {
    const existing = await prisma.favoriteListing.findUnique({
      where: {
        userId_listingId: { userId: session.user.id, listingId },
      },
    });

    if (existing) {
      await prisma.favoriteListing.delete({ where: { id: existing.id } });
      revalidatePath("/listings");
      revalidatePath("/dashboard/favoritos");
      return { ok: true, favorited: false };
    }

    await prisma.favoriteListing.create({
      data: { userId: session.user.id, listingId },
    });
    revalidatePath("/listings");
    revalidatePath("/dashboard/favoritos");
    return { ok: true, favorited: true };
  } catch (e) {
    console.error("[toggleListingFavorite]", e);
    const hint =
      e instanceof Error &&
      (e.message.includes("does not exist") ||
        e.message.includes("FavoriteListing") ||
        e.message.includes("P2021"))
        ? " La tabla de favoritos no existe en esta base: ejecutá `npx prisma migrate deploy` con el DATABASE_URL de producción."
        : "";
    return {
      ok: false,
      error:
        "No se pudo guardar el favorito." +
        hint +
        (hint ? "" : " Revisá los logs del servidor o probá de nuevo."),
    };
  }
}
