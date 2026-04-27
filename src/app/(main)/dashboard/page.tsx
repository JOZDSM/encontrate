import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
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
import { formatDateLongES } from "@/lib/format";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isUserApproved(session)) redirect("/pending");

  const bookings = await prisma.booking.findMany({
    where: { guestId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { listing: { select: { title: true, id: true, neighborhood: true } } },
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="space-y-6 p-6 text-card-foreground">
          <h1 className="text-2xl font-semibold">Mis reservas</h1>
          {bookings.length === 0 ? (
            <p className="text-muted-foreground">
              Aún no tienes solicitudes.{" "}
              <Link href="/listings" className="underline">
                Explorar anuncios
              </Link>
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Anuncio</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <Link
                        href={`/listings/${b.listing.id}`}
                        className="font-medium underline"
                      >
                        {b.listing.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {b.listing.neighborhood}
                      </p>
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
                      <Link
                        href={`/dashboard/bookings/${b.id}`}
                        className="text-sm underline"
                      >
                        Detalle
                      </Link>
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
