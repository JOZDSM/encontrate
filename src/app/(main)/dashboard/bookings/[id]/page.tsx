import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { CancelBookingButton } from "@/components/cancel-booking-button";
import { MessageForm } from "@/components/message-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookingStatus } from "@/generated/prisma/enums";
import { bookingStatusLabel } from "@/lib/booking-status-label";
import { isUserApproved } from "@/lib/approval";
import { formatDateLongES } from "@/lib/format";
import { canSeeFullAddress } from "@/lib/listing-visibility";
import { prisma } from "@/lib/db";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isUserApproved(session)) redirect("/pending");

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      listing: true,
      guest: { select: { id: true, email: true, name: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { name: true, email: true } } },
      },
    },
  });
  if (!booking) notFound();

  const isGuest = booking.guestId === session.user.id;
  const isHost = booking.listing.hostId === session.user.id;
  if (!isGuest && !isHost) notFound();

  const canMsg =
    booking.status === BookingStatus.PENDING ||
    booking.status === BookingStatus.CONFIRMED;

  const showAddress = await canSeeFullAddress(session, booking.listing);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="space-y-8 p-6 text-card-foreground">
          <div>
            <Link href="/dashboard" className="text-sm text-muted-foreground underline">
              ← Mis reservas
            </Link>
            <h1 className="mt-2 text-2xl font-semibold">{booking.listing.title}</h1>
            <p className="text-sm text-muted-foreground">
              {formatDateLongES(booking.startDate)} — {formatDateLongES(booking.endDate)}
            </p>
            <Badge className="mt-2">{bookingStatusLabel(booking.status)}</Badge>
          </div>

          {showAddress && booking.listing.addressDetail ? (
            <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm">
              <p className="font-medium">Dirección</p>
              <p>{booking.listing.addressDetail}</p>
            </div>
          ) : null}

          {isGuest &&
          (booking.status === BookingStatus.PENDING ||
            booking.status === BookingStatus.CONFIRMED) ? (
            <CancelBookingButton bookingId={booking.id} />
          ) : null}

          <section className="space-y-4">
            <h2 className="text-lg font-medium">Mensajes</h2>
            {!canMsg ? (
              <p className="text-sm text-muted-foreground">
                No hay mensajes para esta reserva en su estado actual.
              </p>
            ) : (
              <>
                <ul className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                  {booking.messages.length === 0 ? (
                    <li className="text-sm text-muted-foreground">
                      Aún no hay mensajes.
                    </li>
                  ) : (
                    booking.messages.map((m) => (
                      <li key={m.id} className="text-sm">
                        <p className="text-xs text-muted-foreground">
                          {(m.sender.name ?? m.sender.email) ?? "Usuario"} ·{" "}
                          {m.createdAt.toLocaleString("es-ES")}
                        </p>
                        <p className="whitespace-pre-wrap">{m.body}</p>
                      </li>
                    ))
                  )}
                </ul>
                <MessageForm listingId={booking.listingId} bookingId={booking.id} />
              </>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
