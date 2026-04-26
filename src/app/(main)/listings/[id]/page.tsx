import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { BookingRequestForm } from "@/components/booking-request-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { canSeeFullAddress } from "@/lib/listing-visibility";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
      host: { select: { id: true, name: true } },
    },
  });
  if (!listing) notFound();

  const showAddress = await canSeeFullAddress(session, listing);
  const isHost = session?.user?.id === listing.hostId;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{listing.neighborhood}</Badge>
          <span className="text-sm text-muted-foreground">
            {listing.city}, {listing.country}
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{listing.title}</h1>
        {listing.priceNote ? (
          <p className="text-lg font-medium">{listing.priceNote}</p>
        ) : null}
      </div>

      {listing.photos.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {listing.photos.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.id}
              src={p.url}
              alt=""
              className="aspect-video w-full rounded-lg object-cover"
            />
          ))}
        </div>
      ) : null}

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="whitespace-pre-wrap">{listing.description}</p>
      </div>

      <div className="rounded-xl border bg-muted/40 p-4 text-sm">
        <p className="font-medium">Ubicación aproximada</p>
        <p className="text-muted-foreground">
          {listing.neighborhood}, {listing.city}
        </p>
        {showAddress && listing.addressDetail ? (
          <p className="mt-2">
            <span className="font-medium">Dirección: </span>
            {listing.addressDetail}
          </p>
        ) : !showAddress && listing.addressDetail ? (
          <p className="mt-2 text-muted-foreground">
            La dirección completa se muestra al huésped cuando la reserva está
            confirmada.
          </p>
        ) : null}
      </div>

      {isHost ? (
        <Button variant="outline" asChild>
          <Link href={`/host/listings/${listing.id}/edit`}>Editar anuncio</Link>
        </Button>
      ) : session?.user ? (
        <BookingRequestForm listingId={listing.id} />
      ) : (
        <div className="rounded-xl border bg-card p-4 text-sm">
          <p className="mb-3">
            Inicia sesión para solicitar fechas en este anuncio.
          </p>
          <Button asChild>
            <Link href="/login">Entrar</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
