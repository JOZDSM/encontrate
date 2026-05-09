/**
 * Countries we surface to users (Latin America + Northern America + Europe,
 * sorted alphabetically). Mirrored in `scripts/sync-users-sheet.ts`, which
 * prepends a sheet-only "Unknown" default for empty rows.
 */
export const COUNTRY_OPTIONS = [
  // Latin America
  "Argentina",
  "Belize",
  "Bolivia",
  "Brazil",
  "Chile",
  "Colombia",
  "Costa Rica",
  "Cuba",
  "Dominican Republic",
  "Ecuador",
  "El Salvador",
  "Guatemala",
  "Guyana",
  "Haiti",
  "Honduras",
  "Mexico",
  "Nicaragua",
  "Panama",
  "Paraguay",
  "Peru",
  "Suriname",
  "Uruguay",
  "Venezuela",
  // Northern America
  "Canada",
  "United States",
  // Europe
  "Albania",
  "Andorra",
  "Armenia",
  "Austria",
  "Azerbaijan",
  "Belarus",
  "Belgium",
  "Bosnia and Herzegovina",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Georgia",
  "Germany",
  "Greece",
  "Hungary",
  "Iceland",
  "Ireland",
  "Italy",
  "Kosovo",
  "Latvia",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Moldova",
  "Monaco",
  "Montenegro",
  "Netherlands",
  "North Macedonia",
  "Norway",
  "Poland",
  "Portugal",
  "Romania",
  "Russia",
  "San Marino",
  "Serbia",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
  "Switzerland",
  "Turkey",
  "Ukraine",
  "United Kingdom",
  "Vatican City",
] as const;

export type Country = (typeof COUNTRY_OPTIONS)[number];

const COUNTRY_CANONICAL_BY_LOWER = new Map<string, Country>(
  COUNTRY_OPTIONS.map((c) => [c.toLowerCase(), c]),
);

/** Returns the canonical country name (case-corrected) if `raw` matches one in the list. */
export function canonicalizeCountry(raw: string): Country | undefined {
  return COUNTRY_CANONICAL_BY_LOWER.get(raw.trim().toLowerCase());
}
