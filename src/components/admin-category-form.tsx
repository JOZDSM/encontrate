"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  createCategoryAction,
  updateCategoryAction,
  type CategoryFormInput,
} from "@/app/actions/admin-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugifyProfessionalName } from "@/lib/service-slug";

export type AdminCategoryFormValues = {
  name: string;
  slug: string;
  synonymsText: string;
  sortOrder: number;
};

const emptyValues: AdminCategoryFormValues = {
  name: "",
  slug: "",
  synonymsText: "",
  sortOrder: 0,
};

export function AdminCategoryForm({
  categoryId,
  initial,
}: {
  categoryId?: string;
  initial?: Partial<AdminCategoryFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<AdminCategoryFormValues>({
    ...emptyValues,
    ...initial,
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const suggestedSlug = useMemo(
    () => slugifyProfessionalName(values.name),
    [values.name],
  );

  function setField<K extends keyof AdminCategoryFormValues>(
    key: K,
    value: AdminCategoryFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const payload: CategoryFormInput = {
      name: values.name,
      slug: slugTouched ? values.slug : suggestedSlug,
      synonymsText: values.synonymsText,
      sortOrder: values.sortOrder,
    };

    startTransition(async () => {
      const result = categoryId
        ? await updateCategoryAction(categoryId, payload)
        : await createCategoryAction(payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push("/admin/categories");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-xl space-y-8 px-4 py-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">
          {categoryId ? "Editar categoría" : "Nueva categoría"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Las categorías agrupan servicios en el catálogo y alimentan la
          búsqueda con sinónimos.
        </p>
      </div>

      <section className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={values.name}
            onChange={(e) => {
              setField("name", e.target.value);
              if (!slugTouched) {
                setField("slug", slugifyProfessionalName(e.target.value));
              }
            }}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slugTouched ? values.slug : suggestedSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setField("slug", e.target.value);
            }}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Orden</Label>
          <Input
            id="sortOrder"
            type="number"
            value={values.sortOrder}
            onChange={(e) => setField("sortOrder", Number(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="synonymsText">Sinónimos de búsqueda</Label>
          <Textarea
            id="synonymsText"
            rows={4}
            value={values.synonymsText}
            onChange={(e) => setField("synonymsText", e.target.value)}
            placeholder="gym, entrenador, personal trainer"
          />
          <p className="text-xs text-muted-foreground">
            Separá con comas o saltos de línea. Ej.: fitness, gym, entrenador.
          </p>
        </div>
      </section>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending} className="rounded-full">
          {pending ? "Guardando…" : "Guardar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={pending}
          onClick={() => router.push("/admin/categories")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
