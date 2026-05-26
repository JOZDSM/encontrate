import { renderToBuffer } from "@react-pdf/renderer";
import { ensureListingPdfFonts } from "@/lib/listing-pdf/register-listing-pdf-fonts";
import type { ListingDetailForViewer } from "@/lib/listing-detail-data";
import type { ListingWindowValue } from "@/lib/listing-window-options";
import { listingPublicUrl } from "@/lib/site-url";
import { resolveListingPdfPhotos } from "@/lib/listing-pdf/fetch-listing-photo-src";
import { ListingPdfDocument } from "@/lib/listing-pdf/listing-pdf-document";
import { listingPdfFilename } from "@/lib/listing-pdf/listing-pdf-filename";

export async function buildListingPdfBuffer(
  detail: ListingDetailForViewer,
  opts: { showFullAddress: boolean },
): Promise<{ buffer: Buffer; filename: string }> {
  const { listing, unavailability } = detail;
  const photoUrls = listing.photos.map((p) => p.url);
  const photos = await resolveListingPdfPhotos(photoUrls);
  if (photoUrls.length > 0 && photos.length === 0) {
    console.warn(
      "[listing-pdf] no photos embedded",
      listing.id,
      "urls:",
      photoUrls.length,
    );
  }
  const listingUrl = listingPublicUrl(listing.id);

  ensureListingPdfFonts();

  const buffer = await renderToBuffer(
    <ListingPdfDocument
      listing={{
        id: listing.id,
        title: listing.title,
        neighborhood: listing.neighborhood,
        city: listing.city,
        country: listing.country,
        description: listing.description,
        priceNote: listing.priceNote,
        priceMonthlyEur: listing.priceMonthlyEur,
        bedSize: listing.bedSize,
        windowTypes: listing.windowTypes as ListingWindowValue[],
        roomSizeSqm: listing.roomSizeSqm,
        furnished: listing.furnished,
        apartmentRooms: listing.apartmentRooms,
        apartmentBaths: listing.apartmentBaths,
        apartmentSizeSqm: listing.apartmentSizeSqm,
        wifi: listing.wifi,
        showWhatsappOnListing: listing.showWhatsappOnListing,
        showEmailOnListing: listing.showEmailOnListing,
        addressDetail: listing.addressDetail,
      }}
      host={{
        email: listing.host.email,
        whatsappNumber: listing.host.whatsappNumber,
      }}
      unavailability={unavailability}
      photos={photos}
      showFullAddress={opts.showFullAddress}
      listingUrl={listingUrl}
    />,
  );

  return {
    buffer: Buffer.from(buffer),
    filename: listingPdfFilename(listing.neighborhood, listing.title),
  };
}
