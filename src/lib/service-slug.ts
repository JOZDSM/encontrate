/**
 * Top-level path segments that must never be used as service slugs
 * (static App Router routes win, but we also block creation in admin).
 */
export const RESERVED_TOP_LEVEL_SEGMENTS = new Set([
  "admin",
  "api",
  "aviso",
  "confirmar-cambio-email",
  "contacto",
  "dashboard",
  "design",
  "fonts",
  "host",
  "listings",
  "login",
  "maps",
  "mis-cosas",
  "onboarding",
  "pending",
  "signals",
  "signup",
]);

export function slugifyProfessionalName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function isReservedServiceSlug(slug: string): boolean {
  return RESERVED_TOP_LEVEL_SEGMENTS.has(slug.toLowerCase());
}

export function isValidServiceSlug(slug: string): boolean {
  return (
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) &&
    slug.length >= 2 &&
    slug.length <= 80 &&
    !isReservedServiceSlug(slug)
  );
}

/**
 * Catalog chrome (HomeCatalogNavbar) for `/` and single-segment paths that
 * are not reserved static routes (service detail pages live at `/[slug]`).
 */
export function isServicesCatalogSurface(
  pathname: string | null | undefined,
): boolean {
  if (!pathname) return false;
  if (pathname === "/") return true;
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 1) return false;
  return !isReservedServiceSlug(segments[0]!);
}
