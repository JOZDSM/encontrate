import Link from "next/link";
import { auth } from "@/auth";
import { Card, CardContent } from "@/components/ui/card";
import { SignalCard } from "@/components/signal-card";
import { SignalCreateButton } from "@/components/signal-create-button";
import { SignalNotificationsButton } from "@/components/signal-notifications-button";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Mis señales",
};

export default async function MisCosasSignalsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const signals = await prisma.signal.findMany({
    where: { userId: session.user.id },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      status: true,
      fullName: true,
      age: true,
      countryOfOrigin: true,
      instagramHandle: true,
      description: true,
      listingAlertInApp: true,
      listingAlertEmail: true,
      photos: {
        take: 1,
        orderBy: { sortOrder: "asc" },
        select: { url: true },
      },
    },
  });

  const activeSignal = signals.find((s) => s.status === "ACTIVE") ?? null;

  return (
    <Card className="shrink-0 border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
      <CardContent className="space-y-6 p-6 text-card-foreground">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Mis señales</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Aquí viven las señales que estás emitiendo dentro de encontrate.
              Por ahora solo son de búsqueda de habitación, pero en un futuro
              podrás emitir señales de otro tipo.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Solo una señal puede estar activa a la vez.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SignalCreateButton />
            <SignalNotificationsButton
              activeSignal={
                activeSignal
                  ? {
                      id: activeSignal.id,
                      listingAlertInApp: activeSignal.listingAlertInApp,
                      listingAlertEmail: activeSignal.listingAlertEmail,
                    }
                  : null
              }
            />
          </div>
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
          <ul className="space-y-4">
            {signals.map((s) => (
              <li key={s.id}>
                <SignalCard
                  signal={{
                    id: s.id,
                    status: s.status,
                    fullName: s.fullName,
                    age: s.age,
                    countryOfOrigin: s.countryOfOrigin,
                    instagramHandle: s.instagramHandle,
                    description: s.description,
                    coverUrl: s.photos[0]?.url ?? null,
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
