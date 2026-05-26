import sharp from "sharp";
import { listingPdfTokens } from "@/lib/listing-pdf/listing-pdf-tokens";

const FETCH_TIMEOUT_MS = 20_000;

/** 2× gallery frame (`aspect-[16/10]`) for sharp output on retina screens. */
const RENDER_WIDTH = listingPdfTokens.photoWidth * 2;
const RENDER_HEIGHT = listingPdfTokens.photoHeight * 2;

export type ListingPdfPhotoSource = {
  src: { data: Buffer; format: "jpg" };
};

/**
 * Fetch listing photos and normalize to JPEG for @react-pdf/renderer (JPG/PNG only;
 * WebP/HEIC from Vercel Blob are converted with sharp).
 */
export async function resolveListingPdfPhotos(
  urls: string[],
): Promise<ListingPdfPhotoSource[]> {
  const results = await Promise.all(urls.map((url) => preparePhotoForPdf(url)));
  return results.filter((r): r is ListingPdfPhotoSource => r !== null);
}

async function preparePhotoForPdf(
  url: string,
): Promise<ListingPdfPhotoSource | null> {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const res = await fetch(trimmed, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;

    const input = Buffer.from(await res.arrayBuffer());
    if (input.length === 0) return null;

    const data = await sharp(input)
      .rotate()
      .resize(RENDER_WIDTH, RENDER_HEIGHT, {
        fit: "cover",
        position: "centre",
      })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    if (data.length === 0) return null;

    return { src: { data, format: "jpg" } };
  } catch (err) {
    console.warn("[listing-pdf] photo prepare failed", trimmed, err);
    return null;
  }
}
