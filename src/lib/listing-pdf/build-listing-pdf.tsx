import { renderToBuffer } from "@react-pdf/renderer";
import type { ListingDetailForViewer } from "@/lib/listing-detail-data";
import type { ListingWindowValue } from "@/lib/listing-window-options";
import { listingPublicUrl } from "@/lib/site-url";
import { resolveListingPhotoSources } from "@/lib/listing-pdf/fetch-listing-photo-src";
import { ListingPdfDocument } from "@/lib/listing-pdf/listing-pdf-document";
import { listingPdfFilename } from "@/lib/listing-pdf/listing-pdf-filename";

export async function buildListingPdfBuffer(
  detail: ListingDetailForViewer,
  opts: { showFullAddress: boolean },
): Promise<{ buffer: Buffer; filename: string }> {
  const { listing, unavailability } = detail;
  const photoUrls = listing.photos.map((p) => p.url);
  const photoDataUris = await resolveListingPhotoSources(photoUrls);
  const listingUrl = listingPublicUrl(listing.id);

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
      photoDataUris={photoDataUris}
      showFullAddress={opts.showFullAddress}
      listingUrl={listingUrl}
    />,
  );

  return {
    buffer: Buffer.from(buffer),
    filename: listingPdfFilename(listing.neighborhood, listing.title),
  };
}
