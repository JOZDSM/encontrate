import { renderToBuffer } from "@react-pdf/renderer";
import {
  AdminListingsPdfDocument,
  type AdminListingsPdfListing,
} from "@/lib/listing-pdf/admin-listings-pdf-document";
import { ensureListingPdfFonts } from "@/lib/listing-pdf/register-listing-pdf-fonts";

function adminListingsPdfFilename(date: Date): string {
  const iso = date.toISOString().slice(0, 10);
  return `anuncios-${iso}.pdf`;
}

function formatGeneratedAtLabel(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export async function buildAdminListingsPdfBuffer(
  listings: AdminListingsPdfListing[],
  generatedAt: Date = new Date(),
): Promise<{ buffer: Buffer; filename: string }> {
  ensureListingPdfFonts();

  const buffer = await renderToBuffer(
    <AdminListingsPdfDocument
      listings={listings}
      generatedAtLabel={formatGeneratedAtLabel(generatedAt)}
    />,
  );

  return {
    buffer: Buffer.from(buffer),
    filename: adminListingsPdfFilename(generatedAt),
  };
}
