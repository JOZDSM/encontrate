/** Derive mobile hero path from desktop `Service.imageUrl` (`{base}-mobile.{ext}`). */
export function serviceMobileHeroImageUrl(desktopUrl: string): string {
  const dot = desktopUrl.lastIndexOf(".");
  if (dot <= 0) return desktopUrl;
  return `${desktopUrl.slice(0, dot)}-mobile${desktopUrl.slice(dot)}`;
}
