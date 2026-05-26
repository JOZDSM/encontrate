import { prisma } from "@/lib/db";

export type ListingUnavailabilityRange = {
  key: string;
  startDate: Date;
  endDate: Date;
};

export function listingDetailTodayUtc(): Date {
  const todayUtc = new Date();
  todayUtc.setUTCHours(0, 0, 0, 0);
  return todayUtc;
}

export function mergeListingUnavailability(
  blocks: { id: string; startDate: Date; endDate: Date }[],
  bookings: { id: string; startDate: Date; endDate: Date }[],
): ListingUnavailabilityRange[] {
  return [
    ...blocks.map((b) => ({
      key: `block-${b.id}`,
      startDate: b.startDate,
      endDate: b.endDate,
    })),
    ...bookings.map((b) => ({
      key: `booking-${b.id}`,
      startDate: b.startDate,
      endDate: b.endDate,
    })),
  ].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

const listingDetailInclude = {
  photos: { orderBy: { sortOrder: "asc" as const } },
  host: {
    select: {
      id: true,
      name: true,
      email: true,
      whatsappNumber: true,
    },
  },
  blocks: {
    orderBy: { startDate: "asc" as const },
    select: { id: true, startDate: true, endDate: true },
  },
  bookings: {
    orderBy: { startDate: "asc" as const },
    select: { id: true, startDate: true, endDate: true },
  },
} as const;

export async function getListingDetailForViewer(
  listingId: string,
  opts?: { todayUtc?: Date },
) {
  const todayUtc = opts?.todayUtc ?? listingDetailTodayUtc();

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      ...listingDetailInclude,
      blocks: {
        ...listingDetailInclude.blocks,
        where: { endDate: { gte: todayUtc } },
      },
      bookings: {
        ...listingDetailInclude.bookings,
        where: { status: "CONFIRMED", endDate: { gte: todayUtc } },
      },
    },
  });

  if (!listing) return null;

  const unavailability = mergeListingUnavailability(
    listing.blocks,
    listing.bookings,
  );

  return { listing, unavailability };
}

export type ListingDetailForViewer = NonNullable<
  Awaited<ReturnType<typeof getListingDetailForViewer>>
>;
