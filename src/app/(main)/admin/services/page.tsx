import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteServiceAction } from "@/app/actions/admin-services";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isPlatformAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export default async function AdminServicesPage() {
  const session = await auth();
  if (!isPlatformAdmin(session)) redirect("/");

  const services = await prisma.service.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { reviews: true } } },
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="space-y-6 p-6 text-card-foreground">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">Servicios</h1>
              <p className="text-sm text-muted-foreground">
                Catálogo público de profesionales.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href="/admin">Volver al panel</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full">
                <Link href="/admin/services/new">Nuevo servicio</Link>
              </Button>
            </div>
          </div>

          {services.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no hay servicios. Creá el primero.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Reviews</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">
                      {service.professionalName}
                      <div className="text-xs text-muted-foreground">
                        {service.title}
                      </div>
                    </TableCell>
                    <TableCell>{service.category}</TableCell>
                    <TableCell className="font-mono text-xs">
                      /{service.slug}
                    </TableCell>
                    <TableCell>
                      {service.published ? "Publicado" : "Borrador"}
                      {service.featured ? " · Destacado" : ""}
                    </TableCell>
                    <TableCell>{service._count.reviews}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          asChild
                          size="sm"
                          variant="secondary"
                          className="rounded-full"
                        >
                          <Link href={`/admin/services/${service.id}/edit`}>
                            Editar
                          </Link>
                        </Button>
                        {service.published ? (
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                          >
                            <Link href={`/${service.slug}`} target="_blank">
                              Ver
                            </Link>
                          </Button>
                        ) : null}
                        <form
                          action={async () => {
                            "use server";
                            await deleteServiceAction(service.id);
                          }}
                        >
                          <Button
                            type="submit"
                            size="sm"
                            variant="destructive"
                            className="rounded-full"
                          >
                            Borrar
                          </Button>
                        </form>
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
