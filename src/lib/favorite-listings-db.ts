import { prisma } from "@/lib/db";

/** True when Prisma reports a missing DB object (e.g. migration not applied yet). */
function isMissingDbObjectError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return (
    msg.includes("does not exist") ||
    msg.includes("P2021") ||
    msg.includes("P2010") ||
    (msg.includes("relation") && msg.includes("not exist"))
  );
}

/**
 * Favorite ids for a user. Returns [] if the table is missing (preview DB before
 * `prisma migrate deploy`) or on transient DB errors, so public pages do not 500.
 */
export async function listFavoriteListingIdsForUser(
  userId: string,
): Promise<string[]> {
  try {
    const rows = await prisma.favoriteListing.findMany({
      where: { userId },
      select: { listingId: true },
    });
    return rows.map((r) => r.listingId);
  } catch (e) {
    if (typeof console !== "undefined" && isMissingDbObjectError(e)) {
      console.warn(
        "[favorites] FavoriteListing query failed — run `npx prisma migrate deploy` on this database.",
      );
    }
    return [];
  }
}

/** Full favorite rows for dashboard; [] if table missing or on error. */
export async function listFavoriteRowsWithListings(userId: string) {
  try {
    return await prisma.favoriteListing.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          include: { photos: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });
  } catch (e) {
    if (typeof console !== "undefined" && isMissingDbObjectError(e)) {
      console.warn(
        "[favorites] FavoriteListing query failed — run `npx prisma migrate deploy` on this database.",
      );
    }
    return [];
  }
}
