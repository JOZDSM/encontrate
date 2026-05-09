import Link from "next/link";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SignalCreateButton } from "@/components/signal-create-button";
import { SignalDeleteButton } from "@/components/signal-delete-button";
import { SignalListingAlertsToggles } from "@/components/signal-listing-alerts-toggles";
import { SignalStatusControls } from "@/components/signal-status-controls";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Mis señales",
};

const STATUS_LABEL: Record<"DRAFT" | "ACTIVE" | "INACTIVE", string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activa",
  INACTIVE: "Inactiva",
};

const STATUS_VARIANT: Record<
  "DRAFT" | "ACTIVE" | "INACTIVE",
  "default" | "secondary" | "outline"
> = {
  DRAFT: "outline",
  ACTIVE: "default",
  INACTIVE: "secondary",
};

export default async function MisCosasSignalsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const signals = await prisma.signal.findMany({
    where: { userId: session.user.id },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: { photos: { take: 1, orderBy: { sortOrder: "asc" } } },
  });

  return (
    <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
      <CardContent className="space-y-6 p-6 text-card-foreground">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Mis señales</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Cada señal es una versión de «estoy buscando habitación». Solo
              una puede estar activa a la vez.
            </p>
          </div>
          <SignalCreateButton />
        </div>

        {signals.length === 0 ? (
          <p className="text-muted-foreground">
            Todavía no tenés señales.{" "}
            <Link href="/signals" className="underline">
              Creá tu primera señal
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-3">
            {signals.map((s) => (
              <li
                key={s.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  {s.photos[0] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={s.photos[0].url}
                      alt=""
                      className="size-16 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="size-16 shrink-0 rounded-lg border border-dashed border-border bg-muted/40" />
                  )}
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">
                        {s.fullName.trim() || "Señal sin nombre"}
                      </p>
                      <Badge variant={STATUS_VARIANT[s.status]}>
                        {STATUS_LABEL[s.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Actualizada{" "}
                      {s.updatedAt.toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <SignalListingAlertsToggles
                      signalId={s.id}
                      initialInApp={s.listingAlertInApp}
                      initialEmail={s.listingAlertEmail}
                      enabled={s.status === "ACTIVE"}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:shrink-0 sm:justify-end">
                  {s.status !== "DRAFT" ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/signals/${s.id}`}>Ver</Link>
                    </Button>
                  ) : null}
                  <Button size="sm" asChild>
                    <Link href={`/signals/${s.id}/editar`}>
                      {s.status === "DRAFT" ? "Continuar" : "Editar"}
                    </Link>
                  </Button>
                  <SignalStatusControls signalId={s.id} status={s.status} />
                  <SignalDeleteButton signalId={s.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
