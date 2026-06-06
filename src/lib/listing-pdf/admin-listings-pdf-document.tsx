import { Document, Page, Text, View } from "@react-pdf/renderer";
import { formatListingCharacteristicsSummary } from "@/lib/listing-pdf/format-listing-characteristics-summary";
import {
  adminListingsPdfPageSize,
  adminListingsPdfStyles as s,
} from "@/lib/listing-pdf/admin-listings-pdf-styles";
import type { ListingWindowValue } from "@/lib/listing-window-options";

export type AdminListingsPdfListing = {
  title: string;
  neighborhood: string;
  bedSize: "INDIVIDUAL" | "DOBLE";
  windowTypes: ListingWindowValue[];
  roomSizeSqm: number;
  furnished: boolean;
  apartmentRooms: number;
  apartmentBaths: number;
  apartmentSizeSqm: number;
  wifi: boolean;
};

export type AdminListingsPdfProps = {
  listings: AdminListingsPdfListing[];
  generatedAtLabel: string;
};

export function AdminListingsPdfDocument({
  listings,
  generatedAtLabel,
}: AdminListingsPdfProps) {
  const countLabel =
    listings.length === 1 ? "1 habitación" : `${listings.length} habitaciones`;

  return (
    <Document title="Todos los anuncios" subject="Listado de anuncios">
      <Page size={adminListingsPdfPageSize} style={s.page} wrap>
        <Text style={s.docTitle}>Todos los anuncios</Text>
        <Text style={s.docSubtitle}>
          {countLabel} · {generatedAtLabel}
        </Text>

        {listings.length === 0 ? (
          <Text style={s.characteristics}>No hay anuncios cargados.</Text>
        ) : (
          listings.map((listing, index) => (
            <View key={`${listing.neighborhood}-${listing.title}-${index}`} style={s.item}>
              <View style={s.badge}>
                <Text style={s.badgeText}>{listing.neighborhood}</Text>
              </View>
              <Text style={s.itemTitle}>{listing.title}</Text>
              <Text style={s.characteristics}>
                {formatListingCharacteristicsSummary({
                  bedSize: listing.bedSize,
                  windowTypes: listing.windowTypes,
                  roomSizeSqm: listing.roomSizeSqm,
                  furnished: listing.furnished,
                  apartmentRooms: listing.apartmentRooms,
                  apartmentBaths: listing.apartmentBaths,
                  apartmentSizeSqm: listing.apartmentSizeSqm,
                  wifi: listing.wifi,
                })}
              </Text>
              {index < listings.length - 1 ? <View style={s.separator} /> : null}
            </View>
          ))
        )}
      </Page>
    </Document>
  );
}
