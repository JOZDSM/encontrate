import type { PublicListingSort } from "@/lib/listing-queries";

export function parseListingSort(raw: string | undefined): PublicListingSort {
  if (raw === "none" || raw === "recent") return "none";
  if (
    raw === "neighborhood" ||
    raw === "price_asc" ||
    raw === "price_desc"
  ) {
    return raw;
  }
  return "none";
}
