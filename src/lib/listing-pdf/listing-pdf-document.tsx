import {
  Document,
  Image,
  Page,
  Text,
  View,
} from "@react-pdf/renderer";
import { formatDateLongES } from "@/lib/format";
import {
  listingBedSizeLabel,
  listingPriceDisplayLines,
  listingWindowTypesLabel,
} from "@/lib/listing-detail-format";
import { listingDescriptionPlainText } from "@/lib/listing-pdf/listing-description-plain";
import type { ListingPdfPhotoSource } from "@/lib/listing-pdf/fetch-listing-photo-src";
import {
  listingPdfPageSize,
  listingPdfStyles as s,
} from "@/lib/listing-pdf/listing-pdf-styles";
import type { ListingPdfProps } from "@/lib/listing-pdf/listing-pdf-types";

function PdfSeparator() {
  return <View style={s.separator} />;
}

function ListingPdfPhotoFrame({ photo }: { photo: ListingPdfPhotoSource }) {
  return (
    <View style={s.photoFrame}>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image */}
      <Image src={photo.src} style={s.photoImage} />
    </View>
  );
}

function ListingPdfFooter() {
  return (
    <Text style={s.footer} fixed>
      encontrate.es
    </Text>
  );
}

export function ListingPdfDocument({
  listing,
  host,
  unavailability,
  photos,
  showFullAddress,
}: ListingPdfProps) {
  const priceLines = listingPriceDisplayLines(
    listing.priceNote,
    listing.priceMonthlyEur,
  );
  const description = listingDescriptionPlainText(listing.description);

  const showWhatsapp =
    listing.showWhatsappOnListing && Boolean(host.whatsappNumber?.trim());
  const showEmail =
    listing.showEmailOnListing && Boolean(host.email?.trim());

  return (
    <Document
      title={listing.title}
      author="encontrate"
      subject={`Anuncio: ${listing.title}`}
    >
      <Page size={listingPdfPageSize} style={s.page} wrap>
        <View style={s.badge}>
          <Text style={s.badgeText}>{listing.neighborhood}</Text>
        </View>
        <Text style={s.title}>{listing.title}</Text>
        {priceLines.primary ? (
          <Text style={s.pricePrimary}>{priceLines.primary}</Text>
        ) : null}
        {priceLines.secondary ? (
          <Text style={s.priceSecondary}>{priceLines.secondary}</Text>
        ) : null}

        <PdfSeparator />

        {photos.length > 0 ? (
          photos.map((photo, i) => (
            <ListingPdfPhotoFrame key={`photo-${i}`} photo={photo} />
          ))
        ) : (
          <View style={s.photoPlaceholderFrame}>
            <Text style={s.photoPlaceholderText}>
              Este anuncio no tiene fotos cargadas.
            </Text>
          </View>
        )}

        <PdfSeparator />

        <Text style={s.sectionHeading}>Información del anfitrión</Text>
        {showWhatsapp ? (
          <Text style={s.contactLine}>
            <Text style={s.contactLabel}>WhatsApp: </Text>
            {host.whatsappNumber}
          </Text>
        ) : null}
        {showEmail ? (
          <Text style={s.contactLine}>
            <Text style={s.contactLabel}>Email: </Text>
            {host.email}
          </Text>
        ) : null}
        {!showWhatsapp && !showEmail ? (
          <Text style={s.bodyMuted}>
            El anfitrión no compartió contacto directo en este anuncio.
          </Text>
        ) : null}

        <PdfSeparator />

        <Text style={s.sectionHeading}>Descripción</Text>
        {description ? (
          <Text style={s.bodyMuted}>{description}</Text>
        ) : (
          <Text style={s.bodyMuted}>Sin descripción.</Text>
        )}

        <PdfSeparator />

        <Text style={s.sectionHeading}>Características</Text>
        <View style={s.specRow}>
          <View style={s.specCard}>
            <Text style={s.specCardTitle}>Habitación</Text>
            <Text style={s.specValue}>{listingBedSizeLabel(listing.bedSize)}</Text>
            <Text style={s.specValue}>{listing.roomSizeSqm} m² aprox.</Text>
            <Text style={s.specValue}>
              {listingWindowTypesLabel(listing.windowTypes)}
            </Text>
            <Text style={s.specValue}>
              {listing.furnished ? "Amueblada" : "Sin amueblar"}
            </Text>
          </View>
          <View style={s.specCardLast}>
            <Text style={s.specCardTitle}>Piso</Text>
            <Text style={s.specValue}>
              {listing.apartmentRooms} habitaciones
            </Text>
            <Text style={s.specValue}>{listing.apartmentBaths} baños</Text>
            <Text style={s.specValue}>
              {listing.apartmentSizeSqm} m² aprox.
            </Text>
            <Text style={s.specValue}>
              {listing.wifi ? "Con WIFI" : "Sin WIFI"}
            </Text>
          </View>
        </View>

        <PdfSeparator />

        <Text style={s.sectionHeading}>Disponibilidad</Text>
        {unavailability.length > 0 ? (
          <>
            <Text style={s.availabilityHint}>
              La habitación no está disponible:
            </Text>
            {unavailability.map((u) => (
              <Text key={u.key} style={s.availabilityRow}>
                {formatDateLongES(u.startDate)} → {formatDateLongES(u.endDate)}
              </Text>
            ))}
          </>
        ) : (
          <Text style={s.bodyMuted}>Sin fechas bloqueadas próximamente.</Text>
        )}

        {showFullAddress && listing.addressDetail?.trim() ? (
          <>
            <PdfSeparator />
            <Text style={s.sectionHeading}>Dirección</Text>
            <Text style={s.bodyMuted}>{listing.addressDetail.trim()}</Text>
          </>
        ) : null}

        <ListingPdfFooter />
      </Page>
    </Document>
  );
}
