import type { Prisma } from "@/generated/prisma/client";
import { BARCELONA_ZONE_LABELS } from "@/lib/barcelona-zones";
import { sendEmail } from "@/lib/email";

type SignalForMatch = Prisma.SignalGetPayload<true>;
type ListingForMatch = Prisma.ListingGetPayload<true>;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

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
 * Only wizard steps with listing-comparable fields are considered:
 *   - Step 7 (Dónde?): `preferredZones`
 *   - Step 8 (Hacé match con habitaciones): bed, windows, room/apt mins, wifi
 * Identity, photos, lifestyle text, social, description, and step 6 dates are
 * ignored. Date overlap is not enforced in v1 (listings lack move-in fields).
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
 * specific listing.
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

/**
 * Creates `GuestListingMatch` rows (and optional emails) for every matching
 * active Señal. Called on listing create and by the daily cron backup pass.
 */
export async function processGuestListingMatchesForListing(
  prisma: Prisma.TransactionClient,
  listing: ListingForMatch,
): Promise<{ matchesCreated: number; emailsSent: number }> {
  const signals = await findSignalsForNewListing(prisma, listing);
  let matchesCreated = 0;
  let emailsSent = 0;

  for (const signal of signals) {
    const created = await prisma.guestListingMatch
      .create({
        data: { signalId: signal.id, listingId: listing.id },
        select: { id: true },
      })
      .catch(() => null);
    if (!created) continue;

    matchesCreated++;

    if (signal.listingAlertEmail) {
      const guest = await prisma.user.findUnique({
        where: { id: signal.userId },
        select: { email: true },
      });
      const to = guest?.email?.trim();
      if (to) {
        const url = `https://encontrate.es/listings/${listing.id}`;
        await sendEmail({
          to,
          subject: `Nueva habitación que coincide con tu señal`,
          html: `
              <p>Acabamos de detectar una habitación nueva que cumple con lo que pediste.</p>
              <p><strong>${escapeHtml(listing.title)}</strong> · ${escapeHtml(listing.neighborhood)}</p>
              <p><a href="${url}">Ver la habitación</a></p>
            `,
        }).catch(() => {});
        emailsSent++;
      }
    }
  }

  return { matchesCreated, emailsSent };
}
