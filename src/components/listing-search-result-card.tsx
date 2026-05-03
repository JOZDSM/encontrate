"use client";

import { useState } from "react";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { stripHtmlForSnippet } from "@/lib/listing-description-html";
import { formatListingCardSpecLine } from "@/lib/listing-card-preview";
import type { ListingWindowValue } from "@/lib/listing-window-options";
import { ListingFavoriteButton } from "@/components/listing-favorite-button";

const THUMB_PX = 162;

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

function ListingCoverThumb({ url }: { url: string }) {
  const [loadFailed, setLoadFailed] = useState(false);
  const showImg = url.length > 0 && !loadFailed;

  return (
    <div
      className="relative shrink-0 overflow-hidden bg-muted"
      style={{ width: THUMB_PX, height: THUMB_PX }}
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
    <Card className="relative flex flex-row items-stretch gap-0 overflow-hidden py-0 transition-colors hover:bg-muted/15">
      <div className="flex min-h-[162px] min-w-0 flex-1 flex-row items-stretch gap-6">
        <Link
          href={`/listings/${listing.id}`}
          className="text-card-foreground flex min-w-0 flex-1 flex-row items-stretch no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ListingCoverThumb key={coverUrl || "none"} url={coverUrl} />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col py-4 pl-6">
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
            <p className="mt-6 line-clamp-3 text-xs leading-snug text-muted-foreground sm:text-sm">
              {plainDescription}
            </p>
          </div>
        </Link>

        <div className="flex shrink-0 flex-col items-start pr-6 pt-4">
          <ListingFavoriteButton
            key={`${listing.id}-${initialFavorite}`}
            listingId={listing.id}
            initialFavorite={initialFavorite}
            canSave={canSaveFavorite}
          />
        </div>
      </div>
    </Card>
  );
}
