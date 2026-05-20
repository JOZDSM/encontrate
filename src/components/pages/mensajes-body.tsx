import Link from "next/link";
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
import { formatDateLongES } from "@/lib/format";
import {
  loadBookingRowsForMensajes,
  loadInquiryThreads,
  loadSignalInquiryThreads,
  loadSignalSystemMessages,
} from "@/lib/mensajes-overview";

function formatShortDateTime(d: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(d);
}

export async function MensajesBody({ userId }: { userId: string }) {
  const [bookings, inquiries, signalInquiries, systemMessages] =
    await Promise.all([
      loadBookingRowsForMensajes(userId),
      loadInquiryThreads(userId),
      loadSignalInquiryThreads(userId),
      loadSignalSystemMessages(userId),
    ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="space-y-4 p-6 text-card-foreground">
          <div>
            <h1 className="text-2xl font-semibold">Mensajes</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Reservas con fechas, solicitudes y conversaciones con otros usuarios.
            </p>
          </div>

          <section className="space-y-3" id="reservas">
            <h2 className="text-lg font-semibold">Reservas y solicitudes</h2>
            {bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tenés reservas ni solicitudes con fechas todavía.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Anuncio</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Con quién</TableHead>
                    <TableHead>Fechas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b) => (
                    <TableRow key={b.bookingId}>
                      <TableCell>
                        <Link
                          href={`/listings/${b.listingId}`}
                          className="font-medium underline"
                        >
                          {b.listingTitle}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm capitalize">
                        {b.role === "guest" ? "Huésped" : "Anfitrión"}
                      </TableCell>
                      <TableCell className="text-sm">{b.counterpartyLabel}</TableCell>
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
                          {b.role === "host" && b.status === BookingStatus.PENDING ? (
                            <HostBookingActions bookingId={b.bookingId} />
                          ) : null}
                          <Link
                            href={`/dashboard/bookings/${b.bookingId}`}
                            className="text-sm underline"
                          >
                            Abrir conversación
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="text-lg font-semibold">Mensajes sin reserva</h2>
            <p className="text-sm text-muted-foreground">
              Incluye el botón &quot;Enviar solicitud&quot; del anuncio (antes de elegir fechas).
            </p>
            {inquiries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay conversaciones de este tipo.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {inquiries.map((t) => (
                  <li key={`${t.listingId}-${t.peerUserId}`}>
                    <Link
                      href={`/mis-cosas/mensajes/inquiry/${t.listingId}/${t.peerUserId}`}
                      className="block rounded-lg border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{t.listingTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.neighborhood} · con {t.peerLabel}
                          </p>
                        </div>
                        <time
                          className="text-xs text-muted-foreground whitespace-nowrap"
                          dateTime={t.lastAt.toISOString()}
                        >
                          {formatShortDateTime(t.lastAt)}
                        </time>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {t.lastBody}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="text-lg font-semibold">Mensajes sobre señales</h2>
            <p className="text-sm text-muted-foreground">
              Conversaciones iniciadas desde el botón &quot;Contactar&quot; en una señal de
              «estoy buscando habitación».
            </p>
            {signalInquiries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay conversaciones de este tipo.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {signalInquiries.map((t) => (
                  <li key={`${t.signalId}-${t.peerUserId}`}>
                    <Link
                      href={`/mis-cosas/mensajes/signal/${t.signalId}/${t.peerUserId}`}
                      className="block rounded-lg border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{t.signalTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            con {t.peerLabel}
                          </p>
                        </div>
                        <time
                          className="text-xs text-muted-foreground whitespace-nowrap"
                          dateTime={t.lastAt.toISOString()}
                        >
                          {formatShortDateTime(t.lastAt)}
                        </time>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {t.lastBody}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="text-lg font-semibold">Notificaciones</h2>
            <p className="text-sm text-muted-foreground">
              Coincidencias automáticas: &quot;Buscar huésped&quot; (anfitrión) y alertas
              de anuncios para tu señal (huésped).
            </p>
            {systemMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay notificaciones todavía.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {systemMessages.map((m) => {
                  const isHostSide = m.direction === "host-saw-signal";
                  const href = isHostSide
                    ? `/signals/${m.signalId}`
                    : `/listings/${m.listingId}`;
                  const title = isHostSide
                    ? `Coincide con tu Buscar huésped: ${m.signalTitle ?? "señal"}`
                    : `Nuevo anuncio para tu señal: ${m.listingTitle ?? "anuncio"}`;
                  const subtitle = isHostSide
                    ? "Mirá el perfil de la persona y respondé."
                    : "Mirá el anuncio y, si te interesa, escribí al anfitrión.";
                  return (
                    <li key={m.id}>
                      <Link
                        href={href}
                        className="block rounded-lg border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {subtitle}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <time
                              className="text-xs text-muted-foreground whitespace-nowrap"
                              dateTime={m.notifiedAt.toISOString()}
                            >
                              {formatShortDateTime(m.notifiedAt)}
                            </time>
                            {m.viewedAt ? null : (
                              <Badge variant="default" className="text-[10px]">
                                Nuevo
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
