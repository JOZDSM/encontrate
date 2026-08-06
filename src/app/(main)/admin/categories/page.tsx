import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteCategoryAction } from "@/app/actions/admin-categories";
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

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!isPlatformAdmin(session)) redirect("/");

  const categories = await prisma.serviceCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { services: true } } },
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="space-y-6 p-6 text-card-foreground">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">Categorías</h1>
              <p className="text-sm text-muted-foreground">
                Agrupan servicios en el catálogo y definen sinónimos de búsqueda.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href="/admin">Volver al panel</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full">
                <Link href="/admin/categories/new">Nueva categoría</Link>
              </Button>
            </div>
          </div>

          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no hay categorías. Creá la primera.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead>Sinónimos</TableHead>
                  <TableHead>Servicios</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {category.slug}
                    </TableCell>
                    <TableCell>{category.sortOrder}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {category.synonyms.length}
                    </TableCell>
                    <TableCell>{category._count.services}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          asChild
                          size="sm"
                          variant="secondary"
                          className="rounded-full"
                        >
                          <Link href={`/admin/categories/${category.id}/edit`}>
                            Editar
                          </Link>
                        </Button>
                        <form
                          action={async () => {
                            "use server";
                            await deleteCategoryAction(category.id);
                          }}
                        >
                          <Button
                            type="submit"
                            size="sm"
                            variant="destructive"
                            className="rounded-full"
                            disabled={category._count.services > 0}
                            title={
                              category._count.services > 0
                                ? "Reasigná los servicios antes de borrar"
                                : undefined
                            }
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
