import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { HostBookingActions } from "@/components/host-booking-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookingStatus } from "@/generated/prisma/enums";
import { bookingStatusLabel } from "@/lib/booking-status-label";
import { isUserApproved } from "@/lib/approval";
import { isUserProfileComplete } from "@/lib/profile";
import { formatDateLongES } from "@/lib/format";
import { prisma } from "@/lib/db";

export default async function HostBookingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isUserProfileComplete(session)) redirect("/onboarding");
  if (!isUserApproved(session)) redirect("/pending");

  const bookings = await prisma.booking.findMany({
    where: { listing: { hostId: session.user.id } },
    orderBy: { createdAt: "desc" },
    include: {
      listing: { select: { title: true, id: true } },
      guest: { select: { email: true, name: true } },
    },
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="space-y-6 p-6 text-card-foreground">
          <h1 className="text-2xl font-semibold">Solicitudes y reservas</h1>
          {bookings.length === 0 ? (
            <p className="text-muted-foreground">No hay solicitudes todavía.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Anuncio</TableHead>
                  <TableHead>Huésped</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <Link href={`/listings/${b.listing.id}`} className="underline">
                        {b.listing.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">
                      {b.guest.name ?? b.guest.email ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDateLongES(b.startDate)} — {formatDateLongES(b.endDate)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          b.status === BookingStatus.CONFIRMED
                            ? "default"
                            : b.status === BookingStatus.PENDING
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {bookingStatusLabel(b.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-2">
                        {b.status === BookingStatus.PENDING ? (
                          <HostBookingActions bookingId={b.id} />
                        ) : null}
                        <Link
                          href={`/dashboard/bookings/${b.id}`}
                          className="text-sm underline"
                        >
                          Mensajes
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
