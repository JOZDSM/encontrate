import {
  listingBedSizeLabel,
  listingWindowTypesLabel,
} from "@/lib/listing-detail-format";
import type { ListingWindowValue } from "@/lib/listing-window-options";

export type ListingCharacteristicsSummaryInput = {
  bedSize: "INDIVIDUAL" | "DOBLE";
  windowTypes: ListingWindowValue[];
  roomSizeSqm: number;
  furnished: boolean;
  apartmentRooms: number;
  apartmentBaths: number;
  apartmentSizeSqm: number;
  wifi: boolean;
};

export function formatListingCharacteristicsSummary(
  listing: ListingCharacteristicsSummaryInput,
): string {
  return [
    listingBedSizeLabel(listing.bedSize),
    `${listing.roomSizeSqm} m²`,
    listingWindowTypesLabel(listing.windowTypes),
    listing.furnished ? "Amueblada" : "Sin amueblar",
    `${listing.apartmentRooms} hab`,
    `${listing.apartmentBaths} baño${listing.apartmentBaths === 1 ? "" : "s"}`,
    `${listing.apartmentSizeSqm} m² piso`,
    listing.wifi ? "Con WIFI" : "Sin WIFI",
  ].join(" · ");
}
