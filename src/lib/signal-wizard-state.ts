import type { Prisma } from "@/generated/prisma/client";
import type { SignalWizardInitialState } from "@/components/signal-wizard";

type SignalWithPhotos = Prisma.SignalGetPayload<{ include: { photos: true } }>;

/**
 * Convert a `Signal` (with `photos`) loaded from Prisma into the JSON-safe
 * shape the client wizard expects. Dates become ISO strings; enum values are
 * narrowed to strings (the wizard re-validates them via zod on submit).
 */
export function serializeSignalForWizard(
  signal: SignalWithPhotos,
): SignalWizardInitialState {
  return {
    fullName: signal.fullName,
    age: signal.age,
    gender: signal.gender,
    countryOfOrigin: signal.countryOfOrigin,
    occupation: signal.occupation,
    languages: signal.languages,
    movingWith: signal.movingWith,
    timeUseDescription: signal.timeUseDescription,
    indoorOutdoorDescription: signal.indoorOutdoorDescription,
    cleanlinessImportance: signal.cleanlinessImportance,
    orderImportance: signal.orderImportance,
    instagramHandle: signal.instagramHandle,
    twitterHandle: signal.twitterHandle,
    facebookHandle: signal.facebookHandle,
    tiktokHandle: signal.tiktokHandle,
    dateMode: signal.dateMode,
    exactCheckIn: signal.exactCheckIn ? signal.exactCheckIn.toISOString().slice(0, 10) : null,
    exactCheckOut: signal.exactCheckOut ? signal.exactCheckOut.toISOString().slice(0, 10) : null,
    exactFlexDays: signal.exactFlexDays,
    flexStayLengths: signal.flexStayLengths,
    flexMonths: signal.flexMonths,
    asapUrgent: signal.asapUrgent,
    preferredZones: signal.preferredZones,
    preferredBedSizes: signal.preferredBedSizes,
    preferredWindowTypes: signal.preferredWindowTypes,
    preferredRoomSizeSqmMin: signal.preferredRoomSizeSqmMin,
    preferredFurnished: signal.preferredFurnished,
    preferredApartmentRoomsMin: signal.preferredApartmentRoomsMin,
    preferredApartmentBathsMin: signal.preferredApartmentBathsMin,
    preferredApartmentSizeSqmMin: signal.preferredApartmentSizeSqmMin,
    preferredWifi: signal.preferredWifi,
    description: signal.description,
    listingAlertInApp: signal.listingAlertInApp,
    listingAlertEmail: signal.listingAlertEmail,
    photos: signal.photos.map((p) => ({ id: p.id, url: p.url, sortOrder: p.sortOrder })),
  };
}
