/** Must stay under Vercel server upload limits (~4.5 MB); see API route. */
export const MAX_LISTING_PHOTO_BYTES = 4 * 1024 * 1024;

export const LISTING_PHOTO_TOO_LARGE_MESSAGE =
  "La imagen es demasiado grande (máx. 4 MB por archivo).";

export const LISTING_PHOTO_SIZE_HELPER_ES =
  "Cada foto puede pesar como máximo 4 MB. Si una imagen pesa más, la vamos a comprimir automáticamente al subirla.";
