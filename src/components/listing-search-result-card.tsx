"use client";

import Link from "next/link";
import { Heart, ImageIcon, Mail, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Listing, ListingPhoto } from "@/generated/prisma/client";

export type ListingSearchResult = Listing & {
  photos: ListingPhoto[];
};

function snippet(text: string, max: number) {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, max).trimEnd()}…`;
}

export function ListingSearchResultCard({
  listing,
}: {
  listing: ListingSearchResult;
}) {
  const cover = listing.photos[0]?.url;
  const metaParts = [
    listing.neighborhood,
    listing.city,
    listing.priceNote?.trim() || null,
  ].filter(Boolean);

  return (
    <Card className="relative flex flex-row gap-0 overflow-hidden py-0 transition-colors hover:bg-muted/15">
      <Link
        href={`/listings/${listing.id}`}
        className="text-card-foreground flex min-w-0 flex-1 flex-row gap-4 no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="relative aspect-square w-24 shrink-0 overflow-hidden bg-muted sm:w-28">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ImageIcon className="size-10 opacity-50" aria-hidden />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 px-4 py-4 pr-10">
          <h3 className="text-sm leading-snug font-semibold sm:text-base">
            {listing.title}
          </h3>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {metaParts.join(" · ")}
          </p>
          <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">
            {snippet(listing.description, 220)}
          </p>
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="size-3.5 shrink-0 sm:size-4" aria-hidden />
              Teléfono
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="size-3.5 shrink-0 sm:size-4" aria-hidden />
              Email
            </span>
          </div>
        </div>
      </Link>

      <button
        type="button"
        className="text-muted-foreground hover:text-card-foreground absolute right-3 bottom-3 rounded-md p-1 transition-colors"
        aria-label="Guardar anuncio (próximamente)"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Heart className="size-5" strokeWidth={1.75} />
      </button>
    </Card>
  );
}
