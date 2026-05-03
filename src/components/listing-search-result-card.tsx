"use client";

import { useState } from "react";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { stripHtmlForSnippet } from "@/lib/listing-description-html";
import { formatListingCardSpecLine } from "@/lib/listing-card-preview";
import type { ListingWindowValue } from "@/lib/listing-window-options";
import { ListingFavoriteButton } from "@/components/listing-favorite-button";
import { cn } from "@/lib/utils";

/** Minimal plain shape from the server — avoids RSC/flight dropping nested Prisma relations. */
export type ListingSearchResult = {
  id: string;
  title: string;
  description: string;
  neighborhood: string;
  city: string;
  priceNote: string | null;
  bedSize: "INDIVIDUAL" | "DOBLE";
  roomSizeSqm: number;
  windowTypes: ListingWindowValue[];
  photos: { url: string }[];
};

function ListingCoverThumb({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  const [loadFailed, setLoadFailed] = useState(false);
  const showImg = url.length > 0 && !loadFailed;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-muted",
        "aspect-[16/10] w-full md:aspect-auto md:h-[162px] md:w-[162px]",
        className,
      )}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="absolute inset-0 size-full object-cover"
          onError={() => setLoadFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <ImageIcon className="size-10 opacity-50" aria-hidden />
        </div>
      )}
    </div>
  );
}

export function ListingSearchResultCard({
  listing,
  initialFavorite = false,
  canSaveFavorite = false,
}: {
  listing: ListingSearchResult;
  initialFavorite?: boolean;
  canSaveFavorite?: boolean;
}) {
  const coverUrl = listing.photos[0]?.url?.trim() ?? "";
  const specLine = formatListingCardSpecLine(
    listing.bedSize,
    listing.roomSizeSqm,
    listing.windowTypes,
  );
  const locality = [
    listing.neighborhood,
    listing.city,
    listing.priceNote?.trim() || null,
  ].filter(Boolean);

  const plainDescription = stripHtmlForSnippet(listing.description);

  return (
    <Card className="relative flex flex-col gap-0 overflow-hidden py-0 transition-colors hover:bg-muted/15 md:flex-row md:items-stretch">
      <div className="relative flex min-w-0 flex-1 flex-col md:flex-row md:items-stretch">
        <Link
          href={`/listings/${listing.id}`}
          className="text-card-foreground flex min-w-0 flex-1 flex-col no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:flex-row md:items-stretch"
        >
          <ListingCoverThumb key={coverUrl || "none"} url={coverUrl} />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col px-4 pb-4 pt-3 md:min-h-[162px] md:px-0 md:py-4 md:pl-6 md:pr-6">
            <h3 className="text-pretty m-0 text-sm leading-snug font-semibold sm:text-base">
              {listing.title}
            </h3>
            <p className="m-0 text-xs leading-snug text-muted-foreground sm:text-sm">
              {specLine}
            </p>
            {locality.length > 0 ? (
              <p className="m-0 text-xs leading-snug text-muted-foreground sm:text-sm">
                {locality.join(" · ")}
              </p>
            ) : null}
            <p className="mt-3 line-clamp-3 text-xs leading-snug text-muted-foreground sm:mt-6 sm:text-sm">
              {plainDescription}
            </p>
          </div>
        </Link>

        <div className="pointer-events-none absolute left-0 top-0 z-10 flex w-full justify-end p-2 md:w-[162px] md:max-w-[162px] md:p-2">
          <div className="pointer-events-auto rounded-md bg-background/80 shadow-sm backdrop-blur-sm">
            <ListingFavoriteButton
              key={`${listing.id}-${initialFavorite}`}
              listingId={listing.id}
              initialFavorite={initialFavorite}
              canSave={canSaveFavorite}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
