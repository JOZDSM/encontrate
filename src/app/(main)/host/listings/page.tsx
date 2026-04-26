import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
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
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
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
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
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
    </div>
  );
}
