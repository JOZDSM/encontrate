import { Prisma, BedSize, WindowType } from "@/generated/prisma/client";
import { BARCELONA_ZONE_NEIGHBORHOOD_KEYWORDS } from "@/lib/barcelona-zones";
import { prisma } from "@/lib/db";
import { listingHasConflict } from "@/lib/booking-guards";
import { addDays, differenceInCalendarDays } from "date-fns";

export type PublicListingSort = "recent" | "neighborhood" | "title";

export type AvailabilityRange = { start: Date; end: Date };

export async function getPublicListings(opts: {
  city?: string;
  country?: string;
  zones?: string[];
  rangeStart?: Date;
  rangeEnd?: Date;
  rangeFlexDays?: number;
  availabilityRanges?: AvailabilityRange[];
  bedSize?: string;
  windowType?: string;
  roomSizeSqm?: number;
  furnished?: boolean;
  apartmentRooms?: number;
  apartmentBaths?: number;
  apartmentSizeSqm?: number;
  wifi?: boolean;
  sort?: PublicListingSort;
}) {
  const andParts: Prisma.ListingWhereInput[] = [];

  if (opts.city?.trim()) {
    andParts.push({
      city: { contains: opts.city.trim(), mode: "insensitive" },
    });
  }
  if (opts.country?.trim()) {
    andParts.push({
      country: { contains: opts.country.trim(), mode: "insensitive" },
    });
  }
  if (opts.zones?.length) {
    const zoneClauses = opts.zones
      .map((slug) => {
        const keywords = BARCELONA_ZONE_NEIGHBORHOOD_KEYWORDS[slug];
        if (!keywords?.length) return null;
        return {
          OR: keywords.map((k) => ({
            neighborhood: { contains: k, mode: "insensitive" as const },
          })),
        };
      })
      .filter((c): c is NonNullable<typeof c> => c != null);

    if (zoneClauses.length) {
      andParts.push({ OR: zoneClauses });
    }
  }

  if (opts.bedSize && Object.prototype.hasOwnProperty.call(BedSize, opts.bedSize)) {
    andParts.push({ bedSize: opts.bedSize as BedSize });
  }
  if (
    opts.windowType &&
    Object.prototype.hasOwnProperty.call(WindowType, opts.windowType)
  ) {
    andParts.push({ windowType: opts.windowType as WindowType });
  }
  if (typeof opts.roomSizeSqm === "number" && Number.isFinite(opts.roomSizeSqm)) {
    andParts.push({ roomSizeSqm: { gte: opts.roomSizeSqm } });
  }
  if (typeof opts.furnished === "boolean") {
    andParts.push({ furnished: opts.furnished });
  }
  if (
    typeof opts.apartmentRooms === "number" &&
    Number.isFinite(opts.apartmentRooms)
  ) {
    andParts.push({ apartmentRooms: { gte: opts.apartmentRooms } });
  }
  if (
    typeof opts.apartmentBaths === "number" &&
    Number.isFinite(opts.apartmentBaths)
  ) {
    andParts.push({ apartmentBaths: { gte: opts.apartmentBaths } });
  }
  if (
    typeof opts.apartmentSizeSqm === "number" &&
    Number.isFinite(opts.apartmentSizeSqm)
  ) {
    andParts.push({ apartmentSizeSqm: { gte: opts.apartmentSizeSqm } });
  }
  if (typeof opts.wifi === "boolean") {
    andParts.push({ wifi: opts.wifi });
  }

  const where: Prisma.ListingWhereInput =
    andParts.length === 0
      ? {}
      : andParts.length === 1
        ? andParts[0]!
        : { AND: andParts };

  const orderBy: Prisma.ListingOrderByWithRelationInput =
    opts.sort === "neighborhood"
      ? { neighborhood: "asc" }
      : opts.sort === "title"
        ? { title: "asc" }
        : { createdAt: "desc" };

  const listings = await prisma.listing.findMany({
    where,
    orderBy,
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
      host: { select: { id: true, name: true } },
    },
  });

  if (opts.availabilityRanges?.length) {
    const ranges = opts.availabilityRanges.filter((r) => r.start < r.end).slice(0, 160);
    if (!ranges.length) return listings;

    const filtered = [];
    for (const l of listings) {
      let ok = false;
      for (const r of ranges) {
        const conflict = await listingHasConflict(prisma, l.id, r.start, r.end);
        if (!conflict) {
          ok = true;
          break;
        }
      }
      if (ok) filtered.push(l);
    }
    return filtered;
  }

  if (!opts.rangeStart || !opts.rangeEnd || !(opts.rangeStart < opts.rangeEnd)) {
    return listings;
  }

  const flexDays =
    opts.rangeFlexDays && opts.rangeFlexDays > 0
      ? Math.min(opts.rangeFlexDays, 14)
      : 0;
  const stayDays = differenceInCalendarDays(opts.rangeEnd, opts.rangeStart);

  const filtered = [];
  for (const l of listings) {
    if (flexDays <= 0) {
      const conflict = await listingHasConflict(
        prisma,
        l.id,
        opts.rangeStart,
        opts.rangeEnd,
      );
      if (!conflict) filtered.push(l);
      continue;
    }

    let ok = false;
    for (let delta = -flexDays; delta <= flexDays; delta++) {
      const start = addDays(opts.rangeStart, delta);
      const end = addDays(start, stayDays);
      if (!(start < end)) continue;
      const conflict = await listingHasConflict(prisma, l.id, start, end);
      if (!conflict) {
        ok = true;
        break;
      }
    }
    if (ok) filtered.push(l);
  }
  return filtered;
}
