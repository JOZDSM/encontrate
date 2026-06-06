import { redirect } from "next/navigation";
import { auth } from "@/auth";
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
import { isPlatformAdmin } from "@/lib/admin";
import { bookingStatusLabel } from "@/lib/booking-status-label";
import { formatDateLongES, formatDateUTC } from "@/lib/format";
import { prisma } from "@/lib/db";
import { approveUserAction } from "@/app/actions/admin-users";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AdminUserActions } from "@/components/admin-user-actions";
import { ListingDeleteButton } from "@/components/listing-delete-button";
import { ExportAdminListingsPdfButton } from "@/components/export-admin-listings-pdf-button";

export default async function AdminPage() {
  const session = await auth();
  if (!isPlatformAdmin(session)) redirect("/");

  const [pendingUsers, approvedUsers, listings, bookings] = await Promise.all([
    prisma.user.findMany({
      where: { isApproved: false },
      orderBy: { email: "asc" },
      select: { id: true, email: true, name: true, whatsappNumber: true, isAdmin: true },
    }),
    prisma.user.findMany({
      where: { isApproved: true },
      orderBy: { email: "asc" },
      take: 200,
      select: { id: true, email: true, name: true, whatsappNumber: true, isAdmin: true },
    }),
    prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      include: { host: { select: { email: true, name: true } } },
    }),
    prisma.booking.findMany({
      where: {
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
      },
      orderBy: { startDate: "asc" },
      include: {
        listing: { select: { title: true, city: true } },
        guest: { select: { email: true } },
      },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="space-y-12 p-6 text-card-foreground">
          <div>
            <h1 className="text-2xl font-semibold">Vista operador</h1>
            <p className="text-sm text-muted-foreground">
              Todos los anuncios y reservas activas (pendiente o confirmada).
            </p>
            <div className="pt-3">
              <Button asChild size="sm" variant="secondary" className="rounded-full">
                <Link href="/admin/calendar">Ver calendario</Link>
              </Button>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Usuarios pendientes</h2>
            {pendingUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay usuarios pendientes de aprobación.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.email ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm">{u.name ?? "—"}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {u.whatsappNumber ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <form
                            action={async () => {
                              "use server";
                              await approveUserAction(u.id);
                            }}
                          >
                            <Button type="submit" size="sm">
                              Aprobar
                            </Button>
                          </form>
                          {u.isAdmin ? null : (
                            <AdminUserActions userId={u.id} mode="deny" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Usuarios aprobados</h2>
            {approvedUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay usuarios aprobados.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.email ?? "—"}
                        {u.isAdmin ? (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (admin)
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-sm">{u.name ?? "—"}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {u.whatsappNumber ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {u.isAdmin ? null : (
                          <div className="flex justify-end">
                            <AdminUserActions userId={u.id} mode="delete" />
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-medium">Anuncios</h2>
              <ExportAdminListingsPdfButton />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Anfitrión</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.title}</TableCell>
                    <TableCell>{l.city}</TableCell>
                    <TableCell className="text-sm">
                      {l.host.email ?? l.host.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDateUTC(l.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/host/listings/${l.id}/edit`}>
                            Editar
                          </Link>
                        </Button>
                        <ListingDeleteButton listingId={l.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Reservas (pendiente / confirmada)</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Anuncio</TableHead>
                  <TableHead>Huésped</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <span className="font-medium">{b.listing.title}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        · {b.listing.city}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{b.guest.email ?? "—"}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDateLongES(b.startDate)} — {formatDateLongES(b.endDate)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {bookingStatusLabel(b.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
