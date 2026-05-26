import {
  LISTING_WINDOW_OPTIONS,
  type ListingWindowValue,
} from "@/lib/listing-window-options";

export function formatMonthlyPriceEur(priceMonthlyEur: number | null): string | null {
  if (typeof priceMonthlyEur !== "number") return null;
  if (!Number.isFinite(priceMonthlyEur)) return null;
  if (priceMonthlyEur <= 0) return null;
  const formatted = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(priceMonthlyEur);
  return `${formatted} / mes`;
}

export function listingBedSizeLabel(v: "INDIVIDUAL" | "DOBLE"): string {
  return v === "INDIVIDUAL" ? "Cama individual" : "Cama doble";
}

export function listingWindowTypesLabel(values: ListingWindowValue[]): string {
  const dict = new Map(LISTING_WINDOW_OPTIONS.map((o) => [o.value, o.title]));
  const labels = values.map((v) => dict.get(v) ?? v);
  return labels.join(" · ");
}

export function listingPriceDisplayLines(
  priceNote: string | null,
  priceMonthlyEur: number | null,
): { primary: string | null; secondary: string | null } {
  const monthlyPrice = formatMonthlyPriceEur(priceMonthlyEur);
  if (priceNote && monthlyPrice) {
    return { primary: priceNote, secondary: monthlyPrice };
  }
  if (priceNote) return { primary: priceNote, secondary: null };
  if (monthlyPrice) return { primary: monthlyPrice, secondary: null };
  return { primary: null, secondary: null };
}
