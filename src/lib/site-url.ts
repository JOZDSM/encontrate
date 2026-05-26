/** Canonical origin for links in emails/PDFs (no trailing slash). */
export function getSiteOrigin(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "https://encontrate.es";
}

export function listingPublicUrl(listingId: string): string {
  return `${getSiteOrigin()}/listings/${listingId}`;
}
