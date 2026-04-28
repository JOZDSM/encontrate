import { redirect } from "next/navigation";
import { addDays } from "date-fns";
import { auth } from "@/auth";
import { Card, CardContent } from "@/components/ui/card";
import { isPlatformAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { formatDateUTC } from "@/lib/format";
import { BookingStatus } from "@/generated/prisma/enums";

function toUTCNoonDateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0));
}

function dayInRange(day: Date, start: Date, end: Date): boolean {
  const x = toUTCNoonDateOnly(day);
  return start.getTime() <= x.getTime() && x.getTime() < end.getTime();
}

export default async function AdminCalendarPage() {
  const session = await auth();
  if (!isPlatformAdmin(session)) redirect("/");

  const start = toUTCNoonDateOnly(new Date());
  const days = 35; // 5 weeks
  const end = addDays(start, days);

  const listings = await prisma.listing.findMany({
    orderBy: { neighborhood: "asc" },
    select: {
      id: true,
      title: true,
      neighborhood: true,
      host: { select: { email: true, name: true } },
      blocks: {
        where: { startDate: { lt: end }, endDate: { gt: start } },
        orderBy: { startDate: "asc" },
        select: { startDate: true, endDate: true },
      },
      bookings: {
        where: {
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
          startDate: { lt: end },
          endDate: { gt: start },
        },
        orderBy: { startDate: "asc" },
        select: { startDate: true, endDate: true, status: true },
      },
    },
  });

  const dayColumns = Array.from({ length: days }, (_, i) => addDays(start, i));

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-10">
      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="space-y-6 p-6 text-card-foreground">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Calendario (operador)</h1>
            <p className="text-sm text-muted-foreground">
              Vista de 5 semanas. Confirmadas bloquean disponibilidad; pendientes se muestran como tentativas.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-primary" /> Confirmada
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-amber-500/25 ring-1 ring-amber-500/30" /> Pendiente
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-brand-background ring-1 ring-border" /> Cierre
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-transparent ring-1 ring-border/50" /> Libre
            </span>
          </div>

          <div className="overflow-auto rounded-lg border border-border">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-muted/30">
                <tr>
                  <th className="sticky left-0 z-10 w-[18rem] min-w-[18rem] border-b border-border bg-muted/30 px-3 py-2 text-left">
                    Anuncio
                  </th>
                  {dayColumns.map((d) => (
                    <th
                      key={d.toISOString()}
                      className="min-w-10 border-b border-border px-2 py-2 text-center font-medium text-muted-foreground"
                      title={formatDateUTC(d)}
                    >
                      {d.getUTCDate()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l.id} className="border-b border-border/60 last:border-b-0">
                    <td className="sticky left-0 z-10 border-r border-border bg-card px-3 py-2 align-middle">
                      <div className="space-y-0.5">
                        <div className="font-medium">{l.title}</div>
                        <div className="text-muted-foreground">
                          {l.neighborhood} · {l.host.email ?? l.host.name ?? "—"}
                        </div>
                      </div>
                    </td>
                    {dayColumns.map((d) => {
                      const isBlocked = l.blocks.some((b) => dayInRange(d, b.startDate, b.endDate));
                      const confirmed = l.bookings.some(
                        (b) => b.status === BookingStatus.CONFIRMED && dayInRange(d, b.startDate, b.endDate),
                      );
                      const pending = !confirmed && l.bookings.some(
                        (b) => b.status === BookingStatus.PENDING && dayInRange(d, b.startDate, b.endDate),
                      );

                      const cls = confirmed
                        ? "bg-primary"
                        : isBlocked
                          ? "bg-brand-background"
                          : pending
                            ? "bg-amber-500/25"
                            : "bg-transparent";

                      return (
                        <td
                          key={d.toISOString()}
                          className="h-10 border-r border-border/50 p-0 last:border-r-0"
                        >
                          <div className={cls + " h-full w-full"} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

