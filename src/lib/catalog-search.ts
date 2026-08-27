import type { CuratedCollection, ServiceOffering } from "@/lib/mock-services-catalog";
import { slugifyProfessionalName } from "@/lib/service-slug";

export type CatalogSearchHit = {
  service: ServiceOffering;
  score: number;
  label: string;
};

export type CatalogSearchGroup = {
  category: string;
  items: CatalogSearchHit[];
};

/** Query token → related terms for smart matching (e.g. fitness → personal trainer). */
const SYNONYMS: Record<string, string[]> = {
  fitness: [
    "fitness",
    "personal trainer",
    "entrenador",
    "entrenamiento",
    "gym",
    "gimnasio",
    "ejercicio",
  ],
  gym: ["gym", "gimnasio", "fitness", "personal trainer", "entrenador"],
  wellness: ["wellness", "masaje", "masajista", "yoga", "bienestar", "salud"],
  belleza: ["belleza", "manicura", "peluqueria", "corte", "color", "estetica"],
  educacion: [
    "educacion",
    "clases",
    "profesor",
    "ingles",
    "italiano",
    "tutoria",
    "idiomas",
  ],
  ingles: ["ingles", "english", "clases", "profesor"],
  limpieza: ["limpieza", "limpiadora", "hogar", "ayuda en el hogar"],
  hogar: ["hogar", "limpieza", "limpiadora", "ayuda en el hogar"],
  mudanza: ["mudanza", "fletero", "mudanzas", "transporte"],
  reparaciones: ["reparaciones", "fontanero", "arreglar", "fix", "hogar"],
  mascotas: ["mascotas", "perro", "paseador", "veterinario"],
  extranjeria: ["extranjeria", "residencia", "gestora", "tramites", "nie", "papeleo"],
  gastronomia: ["gastronomia", "chef", "cocina", "comida"],
  eventos: ["eventos", "fotografo", "dj", "fiesta"],
};

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeSearchText(value)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 0);
}

function expandQueryTerms(query: string): string[] {
  const tokens = tokenize(query);
  const expanded = new Set<string>();
  for (const token of tokens) {
    expanded.add(token);
    const syns = SYNONYMS[token];
    if (syns) {
      for (const s of syns) {
        expanded.add(normalizeSearchText(s));
        for (const part of tokenize(s)) expanded.add(part);
      }
    }
  }
  // Also keep the full normalized query for phrase-ish matches
  const full = normalizeSearchText(query);
  if (full) expanded.add(full);
  return [...expanded];
}

/** Levenshtein distance capped for short strings (typo tolerance). */
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const rows = a.length + 1;
  const cols = b.length + 1;
  const prev = new Array<number>(cols);
  const curr = new Array<number>(cols);
  for (let j = 0; j < cols; j++) prev[j] = j;
  for (let i = 1; i < rows; i++) {
    curr[0] = i;
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        (prev[j] ?? 0) + 1,
        (curr[j - 1] ?? 0) + 1,
        (prev[j - 1] ?? 0) + cost,
      );
    }
    for (let j = 0; j < cols; j++) prev[j] = curr[j] ?? 0;
  }
  return prev[b.length] ?? 0;
}

function fieldScore(fieldNorm: string, terms: string[], weight: number): number {
  if (!fieldNorm || terms.length === 0) return 0;
  let best = 0;
  for (const term of terms) {
    if (!term) continue;
    if (fieldNorm === term) {
      best = Math.max(best, weight * 1);
      continue;
    }
    // Require a meaningful substring so 1–2 letter noise does not hit every field.
    if (term.length >= 3 && fieldNorm.includes(term)) {
      // Prefer matches closer to the start / covering more of the field
      const coverage = term.length / Math.max(fieldNorm.length, 1);
      best = Math.max(best, weight * (0.55 + 0.4 * coverage));
      continue;
    }
    const fieldTokens = fieldNorm.split(/[^a-z0-9]+/).filter(Boolean);
    for (const ft of fieldTokens) {
      if (ft === term) {
        best = Math.max(best, weight * 0.85);
        // Query is a prefix of a field token (typing "limp" → "limpieza").
      } else if (term.length >= 2 && ft.startsWith(term)) {
        best = Math.max(best, weight * 0.45);
        // Field token is a prefix of the query — only for tokens long enough
        // to avoid "María G." matching "gentrification" via "g".
      } else if (ft.length >= 3 && term.startsWith(ft)) {
        best = Math.max(best, weight * 0.45);
      } else if (
        term.length >= 3 &&
        ft.length >= 3 &&
        editDistance(term, ft) <= 1
      ) {
        best = Math.max(best, weight * 0.35);
      }
    }
  }
  return best;
}

export function scoreService(
  service: ServiceOffering,
  query: string,
): number {
  const terms = expandQueryTerms(query);
  if (terms.length === 0) return 0;

  const title = normalizeSearchText(service.title);
  const name = normalizeSearchText(service.professionalName);
  const category = normalizeSearchText(
    [service.category, ...(service.categorySynonyms ?? [])].join(" "),
  );
  const offerings = normalizeSearchText(
    (service.offeringItems ?? []).join(" "),
  );
  const haystack = normalizeSearchText(
    [
      service.title,
      service.professionalName,
      service.category,
      ...(service.categorySynonyms ?? []),
      ...(service.offeringItems ?? []),
    ].join(" "),
  );

  let score =
    fieldScore(title, terms, 1) +
    fieldScore(name, terms, 0.75) +
    fieldScore(category, terms, 0.9) +
    // Admin "Servicios" bullets — high weight so queries like "argentina" match.
    fieldScore(offerings, terms, 1);

  // Phrase / multi-token boost against combined haystack
  const full = normalizeSearchText(query);
  if (full.length >= 3 && haystack.includes(full)) {
    score += 0.5;
  }

  return score;
}

export function flattenCatalogOfferings(
  recent: ServiceOffering[],
  categories: CuratedCollection[],
): ServiceOffering[] {
  const byId = new Map<string, ServiceOffering>();
  const add = (item: ServiceOffering) => {
    if (item.id.includes("-pad-")) return;
    byId.set(item.id, {
      ...item,
      slug:
        item.slug ??
        (slugifyProfessionalName(item.professionalName) || item.id),
    });
  };
  for (const item of recent) add(item);
  for (const row of categories) {
    for (const item of row.items) add(item);
  }
  return [...byId.values()];
}

export function searchCatalog(
  services: ServiceOffering[],
  query: string,
): CatalogSearchGroup[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const hits: CatalogSearchHit[] = [];
  for (const service of services) {
    const score = scoreService(service, trimmed);
    if (score <= 0) continue;
    hits.push({
      service,
      score,
      label: `${service.title} - ${service.professionalName}`,
    });
  }

  hits.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label, "es"));

  const groupMap = new Map<string, CatalogSearchHit[]>();
  const groupBest = new Map<string, number>();
  for (const hit of hits) {
    const cat = hit.service.category;
    const list = groupMap.get(cat) ?? [];
    list.push(hit);
    groupMap.set(cat, list);
    groupBest.set(cat, Math.max(groupBest.get(cat) ?? 0, hit.score));
  }

  return [...groupMap.entries()]
    .sort(
      (a, b) =>
        (groupBest.get(b[0]) ?? 0) - (groupBest.get(a[0]) ?? 0) ||
        a[0].localeCompare(b[0], "es"),
    )
    .map(([category, items]) => ({ category, items }));
}
