/**
 * Plain chrome (`bg-background`) on public listing detail pages, public Señal
 * detail pages, and Panel (sidebar). `/listings` and `/signals` (entry/wizard)
 * keep the same rotating background as other non-home routes
 * (e.g. Cargá habitación).
 */
export function isPublicListingDetailPath(
  pathname: string | null | undefined,
): boolean {
  return Boolean(
    pathname &&
      (/^\/listings\/[^/]+/.test(pathname) ||
        /^\/signals\/[^/]+/.test(pathname) ||
        pathname.startsWith("/mis-cosas")),
  );
}
