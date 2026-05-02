/**
 * Plain chrome (`bg-background`) only on public listing detail pages.
 * `/listings` (search) keeps the same rotating background as other non-home routes (e.g. Cargá habitación).
 */
export function isPublicListingDetailPath(
  pathname: string | null | undefined,
): boolean {
  return Boolean(pathname && /^\/listings\/[^/]+/.test(pathname));
}
