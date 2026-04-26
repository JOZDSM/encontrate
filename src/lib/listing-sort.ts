import type { PublicListingSort } from "@/lib/listing-queries";

export function parseListingSort(raw: string | undefined): PublicListingSort {
  if (raw === "neighborhood" || raw === "title") return raw;
  return "recent";
}
