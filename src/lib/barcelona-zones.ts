/** URL / form slug → display label (chips + UI). */
export const BARCELONA_ZONE_LABELS: Record<string, string> = {
  ciutatvella: "Ciutat Vella",
  eixample: "Eixample",
  gracia: "Gràcia",
  sarriasantgervasi: "Sarrià–Sant Gervasi",
  lescorts: "Les Corts",
  sants: "Sants-Montjuïc",
  horta: "Horta-Guinardó",
  noubarris: "Nou Barris",
  santandreu: "Sant Andreu",
  santmarti: "Sant Martí",
  poblesec: "Poble Sec",
  montjuic: "Montjuïc",
};

/** Chip order: Figma-style list plus micro-zones from HTML map. */
export const BARCELONA_ZONE_ORDER: string[] = [
  "lescorts",
  "sarriasantgervasi",
  "gracia",
  "horta",
  "noubarris",
  "santandreu",
  "sants",
  "ciutatvella",
  "eixample",
  "santmarti",
  "poblesec",
  "montjuic",
];

/**
 * Substrings matched against `Listing.neighborhood` (case-insensitive).
 * A listing matches a zone if any keyword for that zone matches.
 */
export const BARCELONA_ZONE_NEIGHBORHOOD_KEYWORDS: Record<string, string[]> = {
  ciutatvella: [
    "Ciutat Vella",
    "El Raval",
    "Raval",
    "Gòtic",
    "Gotic",
    "Barceloneta",
    "La Barceloneta",
  ],
  eixample: ["Eixample", "Esquerra de l'Eixample", "Dreta de l'Eixample"],
  gracia: ["Gràcia", "Gracia", "Vila de Gràcia"],
  sarriasantgervasi: [
    "Sarrià",
    "Sarria",
    "Sant Gervasi",
    "Sarrià-Sant Gervasi",
    "Les Tres Torres",
    "Vallvidrera",
  ],
  lescorts: ["Les Corts", "Pedralbes"],
  sants: [
    "Sants",
    "Sants-Montjuïc",
    "Hostafrancs",
    "La Bordeta",
    "Zona Franca",
  ],
  horta: ["Horta", "Guinardó", "Guinardo", "Horta-Guinardó", "El Carmel"],
  noubarris: ["Nou Barris", "Torre Baró", "Trinitat", "Ciutat Meridiana"],
  santandreu: ["Sant Andreu", "La Sagrera", "Bon Pastor"],
  santmarti: [
    "Sant Martí",
    "Sant Marti",
    "Poblenou",
    "Diagonal Mar",
    "El Clot",
    "Verneda",
  ],
  poblesec: ["Poble Sec", "Poblesec"],
  montjuic: ["Montjuïc", "Montjuic"],
};

export function parseBarcelonaZonesParam(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => Boolean(s) && s in BARCELONA_ZONE_LABELS);
}
