import Link from "next/link";
import type { Listing, ListingPhoto } from "@/generated/prisma/client";

type ListingWithPhotos = Listing & { photos: ListingPhoto[] };

export function ListingCard({ listing }: { listing: ListingWithPhotos }) {
  const cover = listing.photos[0]?.url;
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-xl border bg-card shadow-sm transition hover:border-primary/30"
    >
      <div className="aspect-[16/10] bg-muted">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : null}
      </div>
      <div className="space-y-1 p-4">
        <h2 className="font-semibold leading-tight group-hover:underline">
          {listing.title}
        </h2>
        <p className="text-sm text-muted-foreground">
          {listing.neighborhood}, {listing.city}
        </p>
        {listing.priceNote ? (
          <p className="text-sm font-medium">{listing.priceNote}</p>
        ) : null}
      </div>
    </Link>
  );
}
