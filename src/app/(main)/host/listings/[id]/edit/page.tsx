import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { AvailabilityBlockForm } from "@/components/availability-block-form";
import { designPreviewAllowsEditAnyListing } from "@/lib/design-preview";
import { DeleteBlockButton } from "@/components/delete-block-button";
import { HostListingForm } from "@/components/host-listing-form";
import { ListingAvailabilityCalendar } from "@/components/listing-availability-calendar";
import { Card, CardContent } from "@/components/ui/card";
import { isUserApproved } from "@/lib/approval";
import { isUserProfileComplete } from "@/lib/profile";
import { formatDateUTC } from "@/lib/format";
import { prisma } from "@/lib/db";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isUserProfileComplete(session)) redirect("/onboarding");
  if (!isUserApproved(session)) redirect("/pending");

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
      blocks: { orderBy: { startDate: "asc" } },
      bookings: {
        orderBy: { startDate: "asc" },
        where: { status: { in: ["PENDING", "CONFIRMED"] } },
        select: { id: true, startDate: true, endDate: true, status: true },
      },
    },
  });
  const allowAnyPreview =
    Boolean(session.user.designPreview) && designPreviewAllowsEditAnyListing();
  if (!listing || (!allowAnyPreview && listing.hostId !== session.user.id)) {
    notFound();
  }

  const photoUrlsText = listing.photos.map((p) => p.url).join("\n");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="space-y-10 p-6 text-card-foreground">
          <div>
            <h1 className="text-2xl font-semibold">Editar anuncio</h1>
            <Link
              href={`/listings/${listing.id}`}
              className="text-sm text-muted-foreground underline"
            >
              Ver página pública
            </Link>
          </div>
          <HostListingForm
            listingId={listing.id}
            defaults={{
              title: listing.title,
              description: listing.description,
              city: listing.city,
              country: listing.country,
              neighborhood: listing.neighborhood,
              addressDetail: listing.addressDetail ?? "",
              priceNote: listing.priceNote ?? "",
              priceMonthlyEur: listing.priceMonthlyEur ?? null,
              timeZone: listing.timeZone,
              photoUrlsText,

              bedSize: listing.bedSize,
              windowType: listing.windowType,
              roomSizeSqm: listing.roomSizeSqm,
              furnished: listing.furnished,
              apartmentRooms: listing.apartmentRooms,
              apartmentBaths: listing.apartmentBaths,
              apartmentSizeSqm: listing.apartmentSizeSqm,
              wifi: listing.wifi,
            }}
          />

          <section className="space-y-3">
            <h2 className="text-lg font-medium">
              Cierres (mantenimiento / uso propio)
            </h2>
            <p className="text-sm text-muted-foreground">
              Intervalo en fechas tipo hotel: desde la primera noche bloqueada hasta
              el día de salida (exclusivo).
            </p>

            <ListingAvailabilityCalendar
              listingId={listing.id}
              blocks={listing.blocks}
              bookings={listing.bookings}
            />

            <AvailabilityBlockForm listingId={listing.id} />
            <ul className="space-y-2 text-sm">
              {listing.blocks.map((b) => (
                <li
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-border bg-muted/20 px-3 py-2"
                >
                  <span>
                    {formatDateUTC(b.startDate)} → {formatDateUTC(b.endDate)}
                    {b.reason ? ` · ${b.reason}` : ""}
                  </span>
                  <DeleteBlockButton blockId={b.id} />
                </li>
              ))}
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
