import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { after } from "next/server";
import { auth } from "@/auth";
import { BookingRequestForm } from "@/components/booking-request-form";
import { ExportListingPdfButton } from "@/components/export-listing-pdf-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/db";
import { isUserApproved } from "@/lib/approval";
import { isUserProfileComplete } from "@/lib/profile";
import { canEditListingAsOwnerOrAdmin } from "@/lib/listing-edit-permissions";
import { isPlatformAdmin } from "@/lib/admin";
import { ListingHostContact } from "@/components/listing-host-contact";
import { ListingPhotoGallery } from "@/components/listing-photo-gallery";
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
import type { ListingWindowValue } from "@/lib/listing-window-options";
import { listingDescriptionDisplayHtml } from "@/lib/listing-description-html";
import {
  listingBedSizeLabel,
  listingPriceDisplayLines,
  listingWindowTypesLabel,
} from "@/lib/listing-detail-format";
import {
  getListingDetailForViewer,
  listingDetailTodayUtc,
} from "@/lib/listing-detail-data";
import { formatDateLongES } from "@/lib/format";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isUserProfileComplete(session)) redirect("/onboarding");

  const detail = await getListingDetailForViewer(id, {
    todayUtc: listingDetailTodayUtc(),
  });
  if (!detail) notFound();

  const { listing, unavailability } = detail;

  if (!isUserApproved(session)) redirect("/pending");

  const isHost = session?.user?.id === listing.hostId;
  const canEdit = canEditListingAsOwnerOrAdmin(session, listing.hostId);
  const priceLines = listingPriceDisplayLines(
    listing.priceNote,
    listing.priceMonthlyEur,
  );

  const viewerId = session.user.id;
  if (viewerId && !isHost && !isPlatformAdmin(session)) {
    const listingId = listing.id;
    after(async () => {
      try {
        await prisma.listingVisit.upsert({
          where: { listingId_userId: { listingId, userId: viewerId } },
          create: { listingId, userId: viewerId },
          update: { lastVisitedAt: new Date() },
        });
      } catch (err) {
        console.error("listingVisit upsert failed", err);
      }
    });
  }
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
            {priceLines.primary ? (
              <span
                className={
                  priceLines.secondary ? "font-medium" : "font-medium"
                }
              >
                {priceLines.primary}
              </span>
            ) : null}
            {priceLines.secondary ? (
              <span
                className={
                  priceLines.primary
                    ? "text-muted-foreground"
                    : "font-medium"
                }
              >
                {priceLines.secondary}
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <ExportListingPdfButton
              listingId={listing.id}
              listingTitle={listing.title}
            />
            {canEdit ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/host/listings/${listing.id}/edit`}>
                    Editar anuncio
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/mis-cosas/buscar-huesped">Buscar huésped</Link>
                </Button>
              </>
            ) : null}
          </div>
        </header>

        <div className="mt-6">
          {listing.photos.length > 0 ? (
            <ListingPhotoGallery photos={listing.photos} />
          ) : (
            <section className="rounded-2xl border border-dashed border-border bg-muted/15 px-4 py-10 text-center text-sm text-muted-foreground">
              <p>Este anuncio no tiene fotos cargadas.</p>
              {canEdit ? (
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
        </div>

        <Separator className="my-8" />

        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Información del anfitrión
          </h2>
          <ListingHostContact
            listingId={listing.id}
            hostEmail={listing.host.email ?? null}
            hostWhatsappNumber={listing.host.whatsappNumber ?? null}
            showWhatsappOnListing={listing.showWhatsappOnListing}
            showEmailOnListing={listing.showEmailOnListing}
          />
        </section>

        <Separator className="my-8" />

        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Descripción</h2>
          <div
            className="listing-description-html max-w-none text-sm leading-relaxed text-muted-foreground [&_li]:my-0 [&_li]:pl-0 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_p]:first:mt-0 [&_p]:last:mb-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{
              __html: listingDescriptionDisplayHtml(listing.description),
            }}
          />
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
                    <p className="text-foreground">
                      {listingBedSizeLabel(listing.bedSize)}
                    </p>
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
                      {listingWindowTypesLabel(
                        listing.windowTypes as ListingWindowValue[],
                      )}
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

        <Separator className="my-8" />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Disponibilidad</h2>
          {unavailability.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                La habitación no está disponible:
              </p>
              <ul className="space-y-2 text-sm">
                {unavailability.map((u) => (
                  <li
                    key={u.key}
                    className="flex flex-wrap items-center justify-between gap-2 rounded border border-border bg-muted/20 px-3 py-2"
                  >
                    <span>
                      {formatDateLongES(u.startDate)} → {formatDateLongES(u.endDate)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sin fechas bloqueadas próximamente.
            </p>
          )}
        </section>

        <Separator className="my-8" />

        {session?.user ? (
          <section className="space-y-3">
            {isHost ? (
              <p className="text-sm text-muted-foreground">
                Vista de huésped: no podés enviar una solicitud de fechas en tu
                propio anuncio.
              </p>
            ) : null}
            <BookingRequestForm listingId={listing.id} disabled={isHost} />
          </section>
        ) : (
          <section className="rounded-2xl border border-border bg-muted/20 p-4 text-sm">
            <p className="mb-3">Inicia sesión para solicitar fechas en este anuncio.</p>
            <Button asChild>
              <Link href="/login">Entrar</Link>
            </Button>
          </section>
        )}
      </div>
    </div>
  );
}
