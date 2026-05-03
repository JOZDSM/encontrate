import {
  LISTING_WINDOW_OPTIONS,
  type ListingWindowValue,
} from "@/lib/listing-window-options";

function windowPreviewParts(types: ListingWindowValue[]): string[] {
  const titles = types
    .map((w) => LISTING_WINDOW_OPTIONS.find((o) => o.value === w)?.title)
    .filter((t): t is string => Boolean(t?.trim()));
  return titles.map((t) => {
    const s = t.trim();
    return s.charAt(0).toLowerCase() + s.slice(1);
  });
}

/** One line for search cards: bed, room m², windows (Spanish). */
export function formatListingCardSpecLine(
  bedSize: "INDIVIDUAL" | "DOBLE",
  roomSizeSqm: number,
  windowTypes: ListingWindowValue[],
): string {
  const bed = bedSize === "DOBLE" ? "doble" : "individual";
  const parts = windowPreviewParts(windowTypes);
  const ventana =
    parts.length === 0
      ? "Ventana sin especificar"
      : `Ventana ${parts.join(" · ")}`;
  return `Habitación ${bed} (~${roomSizeSqm} m²) | ${ventana}`;
}
