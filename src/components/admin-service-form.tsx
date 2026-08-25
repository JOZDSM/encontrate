"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState, useTransition } from "react";
import {
  createServiceAction,
  updateServiceAction,
  type ServiceFormInput,
} from "@/app/actions/admin-services";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { compressListingPhotoIfNeeded } from "@/lib/listing-photo-compress";
import {
  LISTING_PHOTO_SIZE_HELPER_ES,
  LISTING_PHOTO_TOO_LARGE_MESSAGE,
} from "@/lib/listing-photo-upload";
import { slugifyProfessionalName } from "@/lib/service-slug";
import { cn } from "@/lib/utils";

export type AdminServiceFormReview = {
  id?: string;
  authorName: string;
  body: string;
  rating: number;
  avatarUrl?: string;
  sortOrder?: number;
};

export type AdminServiceFormValues = {
  professionalName: string;
  slug: string;
  title: string;
  categoryId: string;
  description: string;
  imageUrl: string;
  imageMobileUrl: string;
  websiteUrl: string;
  instagramUrl: string;
  instagramHandle: string;
  whatsapp: string;
  email: string;
  showWhatsapp: boolean;
  showEmail: boolean;
  offeringItemsText: string;
  neighborhood: string;
  priceNote: string;
  published: boolean;
  featured: boolean;
  sortOrder: number;
  reviews: AdminServiceFormReview[];
};

const emptyValues: AdminServiceFormValues = {
  professionalName: "",
  slug: "",
  title: "",
  categoryId: "",
  description: "",
  imageUrl: "",
  imageMobileUrl: "",
  websiteUrl: "",
  instagramUrl: "",
  instagramHandle: "",
  whatsapp: "",
  email: "",
  showWhatsapp: true,
  showEmail: true,
  offeringItemsText: "",
  neighborhood: "",
  priceNote: "",
  published: false,
  featured: false,
  sortOrder: 0,
  reviews: [],
};

async function uploadServiceImage(file: File): Promise<string> {
  const next = await compressListingPhotoIfNeeded(file);
  const fd = new FormData();
  fd.set("file", next);
  const res = await fetch("/api/uploads/photos", {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  let body: { error?: string; url?: string } | null = null;
  try {
    body = (await res.json()) as { error?: string; url?: string };
  } catch {
    body = null;
  }
  if (!res.ok) {
    let message = body?.error ?? "No se pudo subir la imagen.";
    if (!body?.error) {
      if (res.status === 401) message = "Tenés que iniciar sesión.";
      else if (res.status === 403)
        message = "Tu cuenta está pendiente de aprobación.";
      else if (res.status === 413) message = LISTING_PHOTO_TOO_LARGE_MESSAGE;
    }
    throw new Error(message);
  }
  if (!body?.url) throw new Error("No se pudo subir la imagen.");
  return body.url;
}

function ServiceImageUploadField({
  label,
  hint,
  value,
  required,
  previewAspect,
  onChange,
  onError,
}: {
  label: string;
  hint: string;
  value: string;
  required?: boolean;
  previewAspect: "landscape" | "portrait";
  onChange: (url: string) => void;
  onError: (message: string | null) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onFileChange(file: File | null) {
    if (!file) return;
    onError(null);
    setUploading(true);
    try {
      const url = await uploadServiceImage(file);
      onChange(url);
    } catch (err) {
      onError(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <div
        className={cn(
          "overflow-hidden rounded-md border border-border bg-muted/30",
          previewAspect === "landscape" ? "aspect-video" : "aspect-[3/4] max-w-xs",
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center px-3 text-center text-xs text-muted-foreground">
            Sin imagen
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          disabled={uploading}
          required={required && !value}
          onChange={(e) => void onFileChange(e.target.files?.[0] ?? null)}
          className="block w-full max-w-md cursor-pointer text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground"
        />
        {value ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={uploading}
            onClick={() => onChange("")}
          >
            Quitar
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        {uploading ? "Subiendo…" : hint}
      </p>
    </div>
  );
}

export function AdminServiceForm({
  serviceId,
  initial,
  categories,
}: {
  serviceId?: string;
  initial?: Partial<AdminServiceFormValues>;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<AdminServiceFormValues>({
    ...emptyValues,
    ...initial,
    reviews: initial?.reviews ?? [],
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const suggestedSlug = useMemo(
    () => slugifyProfessionalName(values.professionalName),
    [values.professionalName],
  );

  function setField<K extends keyof AdminServiceFormValues>(
    key: K,
    value: AdminServiceFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!values.imageUrl.trim()) {
      setError("Subí la imagen de escritorio (horizontal).");
      return;
    }

    const payload: ServiceFormInput = {
      ...values,
      slug: slugTouched ? values.slug : suggestedSlug,
      reviews: values.reviews,
    };

    startTransition(async () => {
      const result = serviceId
        ? await updateServiceAction(serviceId, payload)
        : await createServiceAction(payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push("/admin/services");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">
          {serviceId ? "Editar servicio" : "Nuevo servicio"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Perfiles del catálogo público. El slug define la URL (por ejemplo
          /florencia-gambini).
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="professionalName">Nombre</Label>
          <Input
            id="professionalName"
            value={values.professionalName}
            onChange={(e) => {
              setField("professionalName", e.target.value);
              if (!slugTouched) setField("slug", slugifyProfessionalName(e.target.value));
            }}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL)</Label>
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
          <Label htmlFor="title">Tipo de servicio</Label>
          <Input
            id="title"
            value={values.title}
            onChange={(e) => setField("title", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Categoría</Label>
          <select
            id="categoryId"
            value={values.categoryId}
            onChange={(e) => setField("categoryId", e.target.value)}
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            <option value="" disabled>
              Elegí una categoría
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {categories.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No hay categorías. Creá una en{" "}
              <Link href="/admin/categories" className="underline">
                Categorías
              </Link>
              .
            </p>
          ) : null}
        </div>
        <div className="space-y-6 sm:col-span-2">
          <ServiceImageUploadField
            label="Imagen de escritorio (horizontal)"
            hint={`Hero y tarjetas en desktop. ${LISTING_PHOTO_SIZE_HELPER_ES}`}
            value={values.imageUrl}
            required
            previewAspect="landscape"
            onChange={(url) => setField("imageUrl", url)}
            onError={setError}
          />
          <ServiceImageUploadField
            label="Imagen de móvil (vertical)"
            hint="Hero en móvil. Si no subís una, se usa la de escritorio."
            value={values.imageMobileUrl}
            previewAspect="portrait"
            onChange={(url) => setField("imageMobileUrl", url)}
            onError={setError}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            rows={6}
            value={values.description}
            onChange={(e) => setField("description", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="offeringItemsText">Servicios (una línea por ítem)</Label>
          <Textarea
            id="offeringItemsText"
            rows={5}
            value={values.offeringItemsText}
            onChange={(e) => setField("offeringItemsText", e.target.value)}
          />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <h2 className="text-lg font-medium sm:col-span-2">Contacto y redes</h2>
        <div className="space-y-2">
          <Label htmlFor="websiteUrl">Sitio web</Label>
          <Input
            id="websiteUrl"
            value={values.websiteUrl}
            onChange={(e) => setField("websiteUrl", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagramUrl">Instagram URL</Label>
          <Input
            id="instagramUrl"
            value={values.instagramUrl}
            onChange={(e) => setField("instagramUrl", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagramHandle">Instagram handle</Label>
          <Input
            id="instagramHandle"
            value={values.instagramHandle}
            onChange={(e) => setField("instagramHandle", e.target.value)}
            placeholder="@usuario"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            value={values.whatsapp}
            onChange={(e) => setField("whatsapp", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <Checkbox
            id="showWhatsapp"
            checked={values.showWhatsapp}
            onCheckedChange={(v) => setField("showWhatsapp", v === true)}
          />
          <Label htmlFor="showWhatsapp">Mostrar WhatsApp</Label>
        </div>
        <div className="flex items-center gap-2 pt-6">
          <Checkbox
            id="showEmail"
            checked={values.showEmail}
            onCheckedChange={(v) => setField("showEmail", v === true)}
          />
          <Label htmlFor="showEmail">Mostrar email</Label>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <h2 className="text-lg font-medium sm:col-span-2">Catálogo</h2>
        <div className="space-y-2">
          <Label htmlFor="neighborhood">Barrio</Label>
          <Input
            id="neighborhood"
            value={values.neighborhood}
            onChange={(e) => setField("neighborhood", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priceNote">Nota de precio</Label>
          <Input
            id="priceNote"
            value={values.priceNote}
            onChange={(e) => setField("priceNote", e.target.value)}
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
        <div className="flex flex-col gap-3 pt-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="published"
              checked={values.published}
              onCheckedChange={(v) => setField("published", v === true)}
            />
            <Label htmlFor="published">Publicado</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="featured"
              checked={values.featured}
              onCheckedChange={(v) => setField("featured", v === true)}
            />
            <Label htmlFor="featured">Destacado (Recientes)</Label>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-medium">Valoraciones</h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() =>
              setField("reviews", [
                ...values.reviews,
                { authorName: "", body: "", rating: 5, avatarUrl: "" },
              ])
            }
          >
            Agregar
          </Button>
        </div>
        {values.reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin valoraciones todavía.</p>
        ) : (
          values.reviews.map((review, index) => (
            <div
              key={review.id ?? `new-${index}`}
              className="space-y-3 rounded-lg border border-border p-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={review.authorName}
                    onChange={(e) => {
                      const next = [...values.reviews];
                      next[index] = { ...review, authorName: e.target.value };
                      setField("reviews", next);
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rating (1–5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={review.rating}
                    onChange={(e) => {
                      const next = [...values.reviews];
                      next[index] = {
                        ...review,
                        rating: Number(e.target.value) || 5,
                      };
                      setField("reviews", next);
                    }}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Texto</Label>
                <Textarea
                  rows={3}
                  value={review.body}
                  onChange={(e) => {
                    const next = [...values.reviews];
                    next[index] = { ...review, body: e.target.value };
                    setField("reviews", next);
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Avatar URL (opcional)</Label>
                <Input
                  value={review.avatarUrl ?? ""}
                  onChange={(e) => {
                    const next = [...values.reviews];
                    next[index] = { ...review, avatarUrl: e.target.value };
                    setField("reviews", next);
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() =>
                  setField(
                    "reviews",
                    values.reviews.filter((_, i) => i !== index),
                  )
                }
              >
                Quitar
              </Button>
            </div>
          ))
        )}
      </section>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="rounded-full" disabled={pending}>
          {pending ? "Guardando…" : "Guardar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => router.push("/admin/services")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
