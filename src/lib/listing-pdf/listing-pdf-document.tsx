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
import {
  listingPdfPageSize,
  listingPdfStyles,
} from "@/lib/listing-pdf/listing-pdf-styles";
import type { ListingPdfProps } from "@/lib/listing-pdf/listing-pdf-types";

function ListingPdfPhotoPage({ src }: { src: string }) {
  return (
    <Page size={listingPdfPageSize} style={listingPdfStyles.photoPage}>
      {/* @react-pdf Image has no alt prop; decorative listing photos */}
      {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image */}
      <Image src={src} style={listingPdfStyles.photoImage} />
    </Page>
  );
}

function ListingPdfFooter({ url }: { url: string }) {
  return (
    <Text style={listingPdfStyles.footer} fixed>
      encontrate.es · {url}
    </Text>
  );
}

export function ListingPdfDocument({
  listing,
  host,
  unavailability,
  photoDataUris,
  showFullAddress,
  listingUrl,
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
  const hasContact = showWhatsapp || showEmail;

  return (
    <Document
      title={listing.title}
      author="encontrate"
      subject={`Anuncio: ${listing.title}`}
    >
      <Page size={listingPdfPageSize} style={listingPdfStyles.coverPage}>
        <Text style={listingPdfStyles.neighborhood}>{listing.neighborhood}</Text>
        <Text style={listingPdfStyles.title}>{listing.title}</Text>
        {priceLines.primary ? (
          <Text style={listingPdfStyles.pricePrimary}>{priceLines.primary}</Text>
        ) : null}
        {priceLines.secondary ? (
          <Text style={listingPdfStyles.priceSecondary}>
            {priceLines.secondary}
          </Text>
        ) : null}
        <Text style={listingPdfStyles.location}>
          {listing.neighborhood}, {listing.city}, {listing.country}
        </Text>
        <ListingPdfFooter url={listingUrl} />
      </Page>

      {photoDataUris.length > 0 ? (
        photoDataUris.map((src, i) => (
          <ListingPdfPhotoPage key={`photo-${i}`} src={src} />
        ))
      ) : (
        <Page size={listingPdfPageSize} style={listingPdfStyles.placeholderPage}>
          <Text style={listingPdfStyles.placeholderText}>
            Este anuncio no tiene fotos cargadas.
          </Text>
        </Page>
      )}

      <Page size={listingPdfPageSize} style={listingPdfStyles.textPage} wrap>
        {hasContact ? (
          <>
            <Text style={listingPdfStyles.sectionTitleFirst}>
              Información del anfitrión
            </Text>
            {showWhatsapp ? (
              <Text style={listingPdfStyles.contactLine}>
                <Text style={listingPdfStyles.contactLabel}>WhatsApp: </Text>
                {host.whatsappNumber}
              </Text>
            ) : null}
            {showEmail ? (
              <Text style={listingPdfStyles.contactLine}>
                <Text style={listingPdfStyles.contactLabel}>Email: </Text>
                {host.email}
              </Text>
            ) : null}
          </>
        ) : null}

        {description ? (
          <>
            <Text
              style={
                hasContact
                  ? listingPdfStyles.sectionTitle
                  : listingPdfStyles.sectionTitleFirst
              }
            >
              Descripción
            </Text>
            <Text style={listingPdfStyles.body}>{description}</Text>
          </>
        ) : null}

        <Text style={listingPdfStyles.sectionTitle}>Características</Text>
        <Text style={listingPdfStyles.specGroupTitle}>Habitación</Text>
        <Text style={listingPdfStyles.specLine}>
          {listingBedSizeLabel(listing.bedSize)}
        </Text>
        <Text style={listingPdfStyles.specLine}>
          {listing.roomSizeSqm} m² aprox.
        </Text>
        <Text style={listingPdfStyles.specLine}>
          {listingWindowTypesLabel(listing.windowTypes)}
        </Text>
        <Text style={listingPdfStyles.specLine}>
          {listing.furnished ? "Amueblada" : "Sin amueblar"}
        </Text>

        <Text style={listingPdfStyles.specGroupTitle}>Piso</Text>
        <Text style={listingPdfStyles.specLine}>
          {listing.apartmentRooms} habitaciones
        </Text>
        <Text style={listingPdfStyles.specLine}>
          {listing.apartmentBaths} baños
        </Text>
        <Text style={listingPdfStyles.specLine}>
          {listing.apartmentSizeSqm} m² aprox.
        </Text>
        <Text style={listingPdfStyles.specLine}>
          {listing.wifi ? "Con WIFI" : "Sin WIFI"}
        </Text>

        <Text style={listingPdfStyles.sectionTitle}>Disponibilidad</Text>
        {unavailability.length > 0 ? (
          <>
            <Text style={listingPdfStyles.body}>
              La habitación no está disponible:
            </Text>
            {unavailability.map((u) => (
              <Text key={u.key} style={listingPdfStyles.availabilityLine}>
                {formatDateLongES(u.startDate)} → {formatDateLongES(u.endDate)}
              </Text>
            ))}
          </>
        ) : (
          <Text style={listingPdfStyles.body}>
            Sin fechas bloqueadas próximamente.
          </Text>
        )}

        {showFullAddress && listing.addressDetail?.trim() ? (
          <>
            <Text style={listingPdfStyles.sectionTitle}>Dirección</Text>
            <Text style={listingPdfStyles.body}>{listing.addressDetail.trim()}</Text>
          </>
        ) : null}

        <View style={{ marginTop: 24 }}>
          <Text style={listingPdfStyles.body}>
            Ver anuncio en línea: {listingUrl}
          </Text>
        </View>

        <ListingPdfFooter url={listingUrl} />
      </Page>
    </Document>
  );
}
