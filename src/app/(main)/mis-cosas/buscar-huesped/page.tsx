import Link from "next/link";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BuscarHuespedForm } from "@/components/buscar-huesped-form";
import type { BuscarHuespedFilterInput } from "@/app/actions/buscar-huesped";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Buscar huésped",
};

const EMPTY_FILTER: BuscarHuespedFilterInput = {
  enabled: false,
  notifyByEmail: false,
  genders: [],
  ageMin: null,
  ageMax: null,
  countriesOfOrigin: [],
  occupations: [],
  languages: [],
  movingWith: [],
  cleanlinessMin: null,
  cleanlinessMax: null,
  orderMin: null,
  orderMax: null,
  dateMode: null,
  exactCheckIn: null,
  exactCheckOut: null,
  exactFlexDays: null,
  flexStayLengths: [],
  flexMonths: [],
  includeAsap: true,
};

export default async function MisCosasBuscarHuespedPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const [filter, matches, hasListings] = await Promise.all([
    prisma.buscarHuespedFilter.findUnique({ where: { userId } }),
    prisma.signalMatch.findMany({
      where: { hostId: userId, dismissedAt: null },
      orderBy: { notifiedAt: "desc" },
      take: 50,
      include: {
        signal: {
          select: {
            id: true,
            fullName: true,
            countryOfOrigin: true,
            age: true,
            asapUrgent: true,
            status: true,
          },
        },
      },
    }),
    prisma.listing.count({ where: { hostId: userId } }),
  ]);

  const isDateMode = (v: string | null): v is "exact" | "flex" | "asap" =>
    v === "exact" || v === "flex" || v === "asap";

  const initial: BuscarHuespedFilterInput = filter
    ? {
        enabled: filter.enabled,
        notifyByEmail: filter.notifyByEmail,
        genders: filter.genders,
        ageMin: filter.ageMin,
        ageMax: filter.ageMax,
        countriesOfOrigin: filter.countriesOfOrigin,
        occupations: filter.occupations,
        languages: filter.languages,
        movingWith: filter.movingWith,
        cleanlinessMin: filter.cleanlinessMin,
        cleanlinessMax: filter.cleanlinessMax,
        orderMin: filter.orderMin,
        orderMax: filter.orderMax,
        dateMode: isDateMode(filter.dateMode) ? filter.dateMode : null,
        exactCheckIn: filter.exactCheckIn
          ? filter.exactCheckIn.toISOString().slice(0, 10)
          : null,
        exactCheckOut: filter.exactCheckOut
          ? filter.exactCheckOut.toISOString().slice(0, 10)
          : null,
        exactFlexDays: filter.exactFlexDays,
        flexStayLengths: filter.flexStayLengths,
        flexMonths: filter.flexMonths,
        includeAsap: filter.includeAsap,
      }
    : EMPTY_FILTER;

  return (
    <div className="space-y-6">
      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="space-y-6 p-6 text-card-foreground">
          <div>
            <h1 className="text-2xl font-semibold">Buscar huésped</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Definí qué tipo de huésped estás buscando. Cuando publiquen una
              señal nueva que coincida, te avisamos en{" "}
              <Link href="/mis-cosas/mensajes" className="underline">
                Mensajes
              </Link>
              {" "}— y por email si lo activás.
            </p>
            {!hasListings ? (
              <p className="mt-3 rounded-xl border border-dashed border-border bg-muted/15 px-3 py-2 text-xs text-muted-foreground">
                Esta función está pensada para anfitriones. Para que tenga
                sentido, ¿no querés{" "}
                <Link href="/host/listings/new" className="underline">
                  cargar tu primera habitación
                </Link>
                ?
              </p>
            ) : null}
          </div>
          <BuscarHuespedForm initial={initial} />
        </CardContent>
      </Card>

      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="space-y-4 p-6 text-card-foreground">
          <div>
            <h2 className="text-lg font-semibold">Coincidencias</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Las señales nuevas que coincidan con tu filtro aparecen acá.
            </p>
          </div>
          {matches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no hay coincidencias. Activá &quot;Buscar huéspedes
              activamente&quot;, guardá el filtro, y las señales que ya estén
              publicadas y coincidan aparecen acá al instante.
            </p>
          ) : (
            <ul className="space-y-3">
              {matches.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 p-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{m.signal.fullName}</p>
                      {m.signal.asapUrgent ? (
                        <Badge variant="default">Urgente</Badge>
                      ) : null}
                      {m.signal.status !== "ACTIVE" ? (
                        <Badge variant="outline">Inactiva</Badge>
                      ) : null}
                      {m.viewedAt ? null : (
                        <Badge variant="secondary">Nueva</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {[m.signal.countryOfOrigin, m.signal.age ? `${m.signal.age}` : null]
                        .filter(Boolean)
                        .join(" · ") || "Sin detalles"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/signals/${m.signal.id}`}>Ver señal</Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
