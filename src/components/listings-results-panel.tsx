import { Suspense } from "react";
import { ListingSearchResultCard } from "@/components/listing-search-result-card";
import { ListingsSortSelect } from "@/components/listings-sort-select";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import type { ListingSearchResult } from "@/components/listing-search-result-card";
import type { PublicListingSort } from "@/lib/listing-queries";

function SortFallback() {
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-muted size-6 shrink-0 rounded-sm" />
      <div className="space-y-2">
        <div className="bg-muted h-4 w-28 rounded" />
        <div className="bg-muted h-10 w-full max-w-md rounded-4xl" />
      </div>
    </div>
  );
}

export function ListingsResultsPanel({
  listings,
  sort,
  favoriteListingIds = [],
  canSaveFavorite = false,
}: {
  listings: ListingSearchResult[];
  sort: PublicListingSort;
  /** Listing ids the current user has saved (for heart state). */
  favoriteListingIds?: string[];
  /** Logged-in guest: allow toggling favorites (listings page sets true). */
  canSaveFavorite?: boolean;
}) {
  return (
    <Card className="bg-card text-card-foreground flex min-h-0 flex-1 flex-col gap-0 overflow-hidden rounded-md py-0">
      <CardHeader className="border-border rounded-t-md shrink-0 border-b px-6 pt-6 pb-4">
        <Suspense fallback={<SortFallback />}>
          <ListingsSortSelect defaultSort={sort} />
        </Suspense>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col px-6 py-5 md:overflow-y-auto">
        {listings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay habitaciones con esos criterios.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {listings.map((l) => (
              <li key={l.id}>
                <ListingSearchResultCard
                  listing={l}
                  initialFavorite={favoriteListingIds.includes(l.id)}
                  canSaveFavorite={canSaveFavorite}
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
