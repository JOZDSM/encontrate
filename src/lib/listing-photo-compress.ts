"use client";

import { MAX_LISTING_PHOTO_BYTES } from "@/lib/listing-photo-upload";

const TARGET_MAX_BYTES = MAX_LISTING_PHOTO_BYTES;
const TARGET_MIME = "image/jpeg";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

async function decodeImage(file: File): Promise<ImageBitmap> {
  // Prefer createImageBitmap (fast, correct orientation for most browsers).
  try {
    return await createImageBitmap(file);
  } catch {
    // Fallback to <img> decode (needed on some Safari versions / formats).
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.decoding = "async";
      img.src = url;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No canvas context");
      ctx.drawImage(img, 0, 0);
      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
      });
      return await createImageBitmap(blob);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

async function canvasToJpegBytes(
  bitmap: ImageBitmap,
  maxWidthOrHeight: number,
  quality: number,
): Promise<Blob> {
  const w = bitmap.width;
  const h = bitmap.height;
  const scale =
    Math.min(1, maxWidthOrHeight / Math.max(1, Math.max(w, h)));
  const outW = Math.max(1, Math.round(w * scale));
  const outH = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas context");
  ctx.drawImage(bitmap, 0, 0, outW, outH);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      TARGET_MIME,
      quality,
    );
  });
}

/**
 * Compress a listing photo to stay under 4MB so it can pass through the Vercel
 * upload route limits. Returns the original file when already small enough.
 */
export async function compressListingPhotoIfNeeded(file: File): Promise<File> {
  if (file.size <= TARGET_MAX_BYTES) return file;

  const bitmap = await decodeImage(file);
  try {
    // Start relatively large and dial down.
    let maxDim = 2200;
    let quality = 0.86;

    for (let attempt = 0; attempt < 10; attempt++) {
      const blob = await canvasToJpegBytes(bitmap, maxDim, quality);
      if (blob.size <= TARGET_MAX_BYTES) {
        return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
          type: TARGET_MIME,
        });
      }

      // If still too big, reduce quality first, then dimensions.
      if (quality > 0.6) {
        quality = clamp(quality - 0.08, 0.5, 0.95);
      } else {
        maxDim = Math.max(900, Math.round(maxDim * 0.85));
      }
    }
  } finally {
    bitmap.close?.();
  }

  throw new Error(
    "No pudimos comprimir la imagen lo suficiente. Probá con otra foto o reducí el tamaño desde tu teléfono.",
  );
}

