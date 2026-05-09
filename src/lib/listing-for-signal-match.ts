import type { Prisma } from "@/generated/prisma/client";
import { BARCELONA_ZONE_LABELS } from "@/lib/barcelona-zones";

type SignalForMatch = Prisma.SignalGetPayload<true>;
type ListingForMatch = Prisma.ListingGetPayload<true>;

function intersect<T>(a: readonly T[], b: readonly T[]): boolean {
  if (a.length === 0 || b.length === 0) return false;
  const set = new Set(a);
  return b.some((x) => set.has(x));
}

/**
 * Convert a Señal's `preferredZones` (which can be a mix of zone slugs and
 * already-resolved labels) into the canonical neighborhood label set so we can
 * compare against `Listing.neighborhood` directly.
 */
function preferredZoneLabels(zones: readonly string[]): string[] {
  return zones
    .map((z) => BARCELONA_ZONE_LABELS[z] ?? z)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * True iff the Listing satisfies every populated preference on the Señal.
 * Empty arrays / `null` mins mean "no constraint" — they always match.
 *
 * Date overlap is intentionally not enforced in v1: the listing model doesn't
 * carry advertised dates, and the availability calendar is too noisy to be a
 * reliable matching signal. We surface every spatial/structural fit and let
 * the human do the date check on the listing page.
 */
export function listingMatchesSignal(
  listing: ListingForMatch,
  signal: SignalForMatch,
): boolean {
  if (signal.preferredZones.length > 0) {
    const wanted = preferredZoneLabels(signal.preferredZones);
    if (wanted.length > 0 && !wanted.includes(listing.neighborhood.trim())) {
      return false;
    }
  }
  if (signal.preferredBedSizes.length > 0) {
    if (!signal.preferredBedSizes.includes(listing.bedSize)) return false;
  }
  if (signal.preferredWindowTypes.length > 0) {
    if (!intersect(listing.windowTypes, signal.preferredWindowTypes)) {
      return false;
    }
  }
  if (
    signal.preferredRoomSizeSqmMin !== null &&
    listing.roomSizeSqm < signal.preferredRoomSizeSqmMin
  ) {
    return false;
  }
  if (
    signal.preferredFurnished !== null &&
    listing.furnished !== signal.preferredFurnished
  ) {
    return false;
  }
  if (
    signal.preferredApartmentRoomsMin !== null &&
    listing.apartmentRooms < signal.preferredApartmentRoomsMin
  ) {
    return false;
  }
  if (
    signal.preferredApartmentBathsMin !== null &&
    listing.apartmentBaths < signal.preferredApartmentBathsMin
  ) {
    return false;
  }
  if (
    signal.preferredApartmentSizeSqmMin !== null &&
    listing.apartmentSizeSqm < signal.preferredApartmentSizeSqmMin
  ) {
    return false;
  }
  if (signal.preferredWifi !== null && listing.wifi !== signal.preferredWifi) {
    return false;
  }
  return true;
}

/**
 * Returns all active Señales (with at least one alert channel on) that match a
 * specific listing. Used by the matching cron to fan out a freshly-published
 * Listing into per-signal GuestListingMatch rows.
 */
export async function findSignalsForNewListing(
  prisma: Prisma.TransactionClient,
  listing: ListingForMatch,
): Promise<SignalForMatch[]> {
  const candidates = await prisma.signal.findMany({
    where: {
      status: "ACTIVE",
      OR: [{ listingAlertInApp: true }, { listingAlertEmail: true }],
      // Don't notify the host about their own listing matching their own señal.
      NOT: { userId: listing.hostId },
    },
  });
  return candidates.filter((s) => listingMatchesSignal(listing, s));
}
