export function listingPdfFilename(
  neighborhood: string,
  title: string,
): string {
  const slug = (s: string) =>
    s
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);

  const parts = ["encontrate", slug(neighborhood), slug(title)].filter(Boolean);
  return `${parts.join("-") || "anuncio"}.pdf`;
}
