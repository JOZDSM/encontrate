import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { BookingRequestForm } from "@/components/booking-request-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/db";
import { isUserApproved } from "@/lib/approval";
import { isUserProfileComplete } from "@/lib/profile";
import { canSeeFullAddress } from "@/lib/listing-visibility";
import { ListingHostContact } from "@/components/listing-host-contact";
import {
  Bath,
  BedDouble,
  DoorOpen,
  Grid2X2,
  Home,
  Ruler,
  Sofa,
  Wifi,
} from "lucide-react";
import {
  LISTING_WINDOW_OPTIONS,
  type ListingWindowValue,
} from "@/lib/listing-window-options";

function formatMonthlyPriceEur(priceMonthlyEur: number | null): string | null {
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

function bedSizeLabel(v: "INDIVIDUAL" | "DOBLE"): string {
  return v === "INDIVIDUAL" ? "Cama individual" : "Cama doble";
}

function windowTypesLabel(values: ListingWindowValue[]): string {
  const dict = new Map(LISTING_WINDOW_OPTIONS.map((o) => [o.value, o.title]));
  const labels = values.map((v) => dict.get(v) ?? v);
  return labels.join(" · ");
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isUserProfileComplete(session)) redirect("/onboarding");

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
      host: { select: { id: true, name: true, email: true, whatsappNumber: true } },
    },
  });
  if (!listing) notFound();

  // Unapproved users can't browse/search listings yet.
  if (!isUserApproved(session)) redirect("/pending");

  const showAddress = await canSeeFullAddress(session, listing);
  const isHost = session?.user?.id === listing.hostId;
  const monthlyPrice = formatMonthlyPriceEur(listing.priceMonthlyEur);
  const hostName = listing.host.name?.trim() || "Anfitrión";

  return (
    <div className="bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 pt-8 pb-12 text-foreground">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{listing.neighborhood}</Badge>
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {listing.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            {listing.priceNote ? (
              <span className="font-medium">
                {listing.priceNote}
              </span>
            ) : null}
            {!listing.priceNote && monthlyPrice ? (
              <span className="font-medium">
                {monthlyPrice}
              </span>
            ) : null}
            {listing.priceNote && monthlyPrice ? (
              <span className="text-muted-foreground">{monthlyPrice}</span>
            ) : null}
          </div>
          {isHost ? (
            <div className="pt-1">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/host/listings/${listing.id}/edit`}>Editar anuncio</Link>
              </Button>
            </div>
          ) : null}
        </header>

        {listing.photos.length > 0 ? (
          <section className="overflow-hidden rounded-2xl border border-border bg-muted/10">
            {listing.photos.length === 1 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.photos[0]?.url}
                alt=""
                className="aspect-[16/10] w-full object-cover sm:aspect-[2/1]"
              />
            ) : (
              <div className="grid gap-1 sm:gap-2 md:grid-cols-4 md:grid-rows-2">
                {/* Hero */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={listing.photos[0]?.url}
                  alt=""
                  className="aspect-[16/10] w-full object-cover md:col-span-2 md:row-span-2 md:aspect-auto"
                />
                {listing.photos.slice(1, 5).map((p, idx) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={p.id}
                    src={p.url}
                    alt=""
                    className="hidden aspect-[16/10] w-full object-cover md:block"
                    style={{
                      gridColumnStart: 3 + (idx % 2),
                      gridRowStart: 1 + Math.floor(idx / 2),
                    }}
                  />
                ))}
                {/* Mobile strip */}
                <div className="flex gap-2 overflow-x-auto px-3 py-3 md:hidden">
                  {listing.photos.map((p) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={p.id}
                      src={p.url}
                      alt=""
                      className="h-20 w-28 shrink-0 rounded-lg object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-border bg-muted/15 px-4 py-10 text-center text-sm text-muted-foreground">
            <p>Este anuncio no tiene fotos cargadas.</p>
            {isHost ? (
              <p className="mt-2">
                <Button
                  variant="link"
                  className="h-auto p-0"
                  asChild
                >
                  <Link href={`/host/listings/${listing.id}/edit`}>
                    Subí fotos desde editar anuncio
                  </Link>
                </Button>{" "}
                para que aparezcan acá y en los resultados de búsqueda.
              </p>
            ) : null}
          </section>
        )}

        <Separator className="my-8" />

        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Información del anfitrión
          </h2>
          <ListingHostContact
            listingId={listing.id}
            hostName={hostName}
            hostEmail={listing.host.email ?? null}
            hostWhatsappNumber={listing.host.whatsappNumber ?? null}
          />
        </section>

        <Separator className="my-8" />

        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Descripción</h2>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{listing.description}</p>
          </div>
        </section>

        <Separator className="my-8" />

        <section className="space-y-5">
          <h2 className="text-lg font-semibold tracking-tight">Características</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card/40 p-4">
              <p className="text-sm font-medium">Habitación</p>
              <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <BedDouble className="mt-0.5 size-4 text-foreground" aria-hidden />
                  <div>
                    <p className="text-foreground">{bedSizeLabel(listing.bedSize)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Ruler className="mt-0.5 size-4 text-foreground" aria-hidden />
                  <div>
                    <p className="text-foreground">
                      {listing.roomSizeSqm} m² aprox.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Grid2X2 className="mt-0.5 size-4 text-foreground" aria-hidden />
                  <div>
                    <p className="text-foreground">
                      {windowTypesLabel(listing.windowTypes as ListingWindowValue[])}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sofa className="mt-0.5 size-4 text-foreground" aria-hidden />
                  <div>
                    <p className="text-foreground">
                      {listing.furnished ? "Amueblada" : "Sin amueblar"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card/40 p-4">
              <p className="text-sm font-medium">Piso</p>
              <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <DoorOpen className="mt-0.5 size-4 text-foreground" aria-hidden />
                  <p className="text-foreground">
                    {listing.apartmentRooms} habitaciones
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Bath className="mt-0.5 size-4 text-foreground" aria-hidden />
                  <p className="text-foreground">{listing.apartmentBaths} baños</p>
                </div>
                <div className="flex items-start gap-3">
                  <Home className="mt-0.5 size-4 text-foreground" aria-hidden />
                  <p className="text-foreground">
                    {listing.apartmentSizeSqm} m² aprox.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Wifi className="mt-0.5 size-4 text-foreground" aria-hidden />
                  <p className="text-foreground">
                    {listing.wifi ? "Con WIFI" : "Sin WIFI"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
          <h2 className="text-sm font-medium">Ubicación</h2>
          <p className="text-sm text-muted-foreground">
            {listing.neighborhood}, {listing.city}
          </p>
          {showAddress && listing.addressDetail ? (
            <p className="text-sm">
              <span className="font-medium">Dirección: </span>
              {listing.addressDetail}
            </p>
          ) : !showAddress && listing.addressDetail ? (
            <p className="text-sm text-muted-foreground">
              La dirección completa se muestra al huésped cuando la reserva está confirmada.
            </p>
          ) : null}
        </section>

        <Separator className="my-8" />

        {!isHost ? (
          session?.user ? (
            <section>
              <BookingRequestForm listingId={listing.id} />
            </section>
          ) : (
            <section className="rounded-2xl border border-border bg-muted/20 p-4 text-sm">
              <p className="mb-3">Inicia sesión para solicitar fechas en este anuncio.</p>
              <Button asChild>
                <Link href="/login">Entrar</Link>
              </Button>
            </section>
          )
        ) : null}
      </div>
    </div>
  );
}
