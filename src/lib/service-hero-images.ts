/**
 * Resolve the mobile hero image URL.
 * Prefer an explicit stored mobile URL; otherwise derive `{base}-mobile.{ext}`
 * from the desktop path (legacy convention for files under public/).
 */
export function serviceMobileHeroImageUrl(
  desktopUrl: string,
  storedMobileUrl?: string | null,
): string {
  const stored = storedMobileUrl?.trim();
  if (stored) return stored;

  const dot = desktopUrl.lastIndexOf(".");
  if (dot <= 0) return desktopUrl;
  return `${desktopUrl.slice(0, dot)}-mobile${desktopUrl.slice(dot)}`;
}
