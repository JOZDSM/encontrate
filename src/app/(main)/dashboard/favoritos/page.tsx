import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ListingSearchResultCard } from "@/components/listing-search-result-card";
import type { ListingSearchResult } from "@/components/listing-search-result-card";
import { Card, CardContent } from "@/components/ui/card";
import { isUserApproved } from "@/lib/approval";
import { isUserProfileComplete } from "@/lib/profile";
import type { ListingWindowValue } from "@/lib/listing-window-options";
import { listFavoriteRowsWithListings } from "@/lib/favorite-listings-db";

export default async function MisFavoritosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isUserProfileComplete(session)) redirect("/onboarding");
  if (!isUserApproved(session)) redirect("/pending");

  const favorites = await listFavoriteRowsWithListings(session.user.id);

  const listingCards: ListingSearchResult[] = favorites.map((f) => {
    const l = f.listing;
    return {
      id: l.id,
      title: l.title,
      description: l.description,
      neighborhood: l.neighborhood,
      city: l.city,
      priceNote: l.priceNote ?? null,
      bedSize: l.bedSize,
      roomSizeSqm: l.roomSizeSqm,
      windowTypes: l.windowTypes as ListingWindowValue[],
      photos: l.photos.map((p) => ({ url: p.url })),
    };
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="space-y-6 p-6 text-card-foreground">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-2xl font-semibold">Mis favoritos</h1>
            <Link href="/listings" className="text-sm text-muted-foreground underline">
              Buscá habitación
            </Link>
          </div>
          {listingCards.length === 0 ? (
            <p className="text-muted-foreground">
              Todavía no guardaste ningún anuncio.{" "}
              <Link href="/listings" className="underline">
                Explorar habitaciones
              </Link>
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {listingCards.map((l) => (
                <li key={l.id}>
                  <ListingSearchResultCard
                    listing={l}
                    initialFavorite
                    canSaveFavorite
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
