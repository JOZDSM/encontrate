import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export default async function HostListingsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const listings = await prisma.listing.findMany({
    where: { hostId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { photos: { take: 1 } },
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="space-y-6 p-6 text-card-foreground">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold">Mis anuncios</h1>
            <Button asChild>
              <Link href="/host/listings/new">Nuevo</Link>
            </Button>
          </div>
          {listings.length === 0 ? (
            <p className="text-muted-foreground">
              Aún no tienes anuncios.{" "}
              <Link href="/host/listings/new" className="underline">
                Publica uno
              </Link>
              .
            </p>
          ) : (
            <ul className="space-y-3">
              {listings.map((l) => (
                <li
                  key={l.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 p-3"
                >
                  <div>
                    <p className="font-medium">{l.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {l.neighborhood}, {l.city}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/listings/${l.id}`}>Ver</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/host/listings/${l.id}/edit`}>Editar</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
