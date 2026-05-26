import type { ListingUnavailabilityRange } from "@/lib/listing-detail-data";
import type { ListingWindowValue } from "@/lib/listing-window-options";

export type ListingPdfProps = {
  listing: {
    id: string;
    title: string;
    neighborhood: string;
    city: string;
    country: string;
    description: string;
    priceNote: string | null;
    priceMonthlyEur: number | null;
    bedSize: "INDIVIDUAL" | "DOBLE";
    windowTypes: ListingWindowValue[];
    roomSizeSqm: number;
    furnished: boolean;
    apartmentRooms: number;
    apartmentBaths: number;
    apartmentSizeSqm: number;
    wifi: boolean;
    showWhatsappOnListing: boolean;
    showEmailOnListing: boolean;
    addressDetail: string | null;
  };
  host: {
    email: string | null;
    whatsappNumber: string | null;
  };
  unavailability: ListingUnavailabilityRange[];
  photoDataUris: string[];
  showFullAddress: boolean;
  listingUrl: string;
};
