"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bold,
  Italic,
  List,
  MoreHorizontal,
  Upload,
  ImagePlus,
  Trash2,
  RefreshCcw,
} from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { BarcelonaZonePicker } from "@/components/barcelona-zone-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const TOTAL_STEPS = 6;

type UploadedPhoto = { id: string; url: string };

function makeId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

/** Some browsers/OS combos omit `file.type`; fall back on extension. */
function looksLikeImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp|heic|heif|avif|bmp)$/i.test(file.name);
}

function SortablePhoto({
  photo,
  onDelete,
  onReplace,
}: {
  photo: UploadedPhoto;
  onDelete: () => void;
  onReplace: (file: File) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: photo.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative overflow-hidden rounded-2xl border border-border bg-muted/20"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt=""
        className="h-full w-full object-cover"
        draggable={false}
      />

      <div className="absolute top-2 right-2 flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/55"
              aria-label="Opciones de foto"
            >
              <MoreHorizontal className="size-4" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = () => {
                  const f = input.files?.[0];
                  if (f) onReplace(f);
                };
                input.click();
              }}
            >
              <RefreshCcw className="mr-2 size-4" aria-hidden />
              Reemplazar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(e) => {
                e.preventDefault();
                onDelete();
              }}
            >
              <Trash2 className="mr-2 size-4" aria-hidden />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          className="inline-flex size-8 cursor-grab items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/55 active:cursor-grabbing"
          aria-label="Reordenar"
          {...attributes}
          {...listeners}
        >
          <span className="sr-only">Arrastrar</span>
          <MoreHorizontal className="size-4 opacity-0" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function HostListingWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);

  // Step 1: listing title only for now.
  const [title, setTitle] = useState("");
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const [neighborhoodZone, setNeighborhoodZone] = useState<string>("");
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [photoUploadingCount, setPhotoUploadingCount] = useState(0);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        orderedList: false,
      }),
      Placeholder.configure({
        placeholder:
          "Ej. Si estás buscando una habitación grande, con baño privado, amueblada, con cama doble…",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "max-w-none focus:outline-none text-sm leading-5 text-foreground [&_p]:m-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1",
      },
    },
    onUpdate: ({ editor }) => {
      setDescriptionHtml(editor.getHTML());
      setDescriptionText(editor.getText());
    },
  });

  const canGoNext = useMemo(() => {
    if (stepIndex === 0) return title.trim().length > 0;
    if (stepIndex === 1) return descriptionText.trim().length > 0;
    if (stepIndex === 2) return neighborhoodZone.trim().length > 0;
    return true;
  }, [stepIndex, title, descriptionText, neighborhoodZone]);
  const progressValue = Math.min(1, Math.max(0, (stepIndex + 1) / TOTAL_STEPS));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  async function uploadOne(file: File): Promise<string> {
    const fd = new FormData();
    fd.set("file", file);
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
        else if (res.status === 413)
          message = "La imagen es demasiado grande (máx. 4 MB).";
      }
      throw new Error(message);
    }
    if (!body?.url) throw new Error("No se pudo subir la imagen.");
    return body.url;
  }

  async function addFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setPhotoUploadError(null);
    const remaining = Math.max(0, 5 - photos.length);
    const picked = arr.slice(0, remaining).filter(looksLikeImageFile);
    if (picked.length === 0) {
      setPhotoUploadError(
        "No encontramos imágenes válidas (JPEG, PNG, WebP, GIF…).",
      );
      return;
    }

    setPhotoUploadingCount((n) => n + picked.length);
    try {
      const urls = await Promise.all(picked.map((f) => uploadOne(f)));
      setPhotos((prev) => [
        ...prev,
        ...urls.map((url) => ({ id: makeId(), url })),
      ]);
    } catch (e) {
      setPhotoUploadError(e instanceof Error ? e.message : messageFallback());
    } finally {
      setPhotoUploadingCount((n) => Math.max(0, n - picked.length));
    }
  }

  async function replacePhoto(photoId: string, file: File) {
    if (!looksLikeImageFile(file)) {
      setPhotoUploadError(
        "Elegí un archivo de imagen (JPEG, PNG, WebP, GIF…).",
      );
      return;
    }
    setPhotoUploadError(null);
    setPhotoUploadingCount((n) => n + 1);
    try {
      const url = await uploadOne(file);
      setPhotos((prev) =>
        prev.map((p) => (p.id === photoId ? { ...p, url } : p)),
      );
    } catch (e) {
      setPhotoUploadError(e instanceof Error ? e.message : messageFallback());
    } finally {
      setPhotoUploadingCount((n) => Math.max(0, n - 1));
    }
  }

  function messageFallback() {
    return "No se pudo subir la imagen.";
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-1 items-center justify-center px-4 py-10">
      <Card className="flex w-full max-w-[1220px] flex-col border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="flex min-h-[560px] flex-1 flex-col p-6 text-card-foreground">
          <div className="mx-auto flex w-full max-w-[730px] flex-1 flex-col">
            {stepIndex === 0 ? (
              <div className="my-auto space-y-6">
                <div className="space-y-2">
                  <h1 className="text-[36px] leading-[40px] font-extrabold">
                    Dale un nombre a tu habitación
                  </h1>
                  <p className="text-sm leading-5 text-muted-foreground">
                    Los títulos cortos que resaltan dónde está el piso (y qué lo
                    destaca) funcionan mejor.
                  </p>
                </div>

                <div className="w-full">
                  <Textarea
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    rows={2}
                    className="min-h-20"
                    placeholder="Ej. Habitación doble con balcón a 3 minutos de la Sagrada Familia."
                    aria-label="Título del anuncio"
                  />
                </div>
              </div>
            ) : stepIndex === 1 ? (
              <div className="my-auto space-y-6">
                <div className="space-y-2">
                  <h1 className="text-[36px] leading-[40px] font-extrabold">
                    Dale una descripción a tu habitación
                  </h1>
                  <p className="text-sm leading-5 text-muted-foreground">
                    Incluí toda la información necesaria, especialmente precios — si querés
                    contarlos por acá — ya que por ahora no habilitamos un filtro por precio
                    como lo hacemos con otras características en los pasos siguientes.
                    <br />
                    (Siempre podés volver a este paso a editar tu descripción)
                  </p>
                </div>

                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-input bg-input/30 px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className={cn(
                          "rounded-lg",
                          editor?.isActive("bold") ? "bg-muted" : "",
                        )}
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        aria-label="Negrita"
                      >
                        <Bold className="size-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className={cn(
                          "rounded-lg",
                          editor?.isActive("italic") ? "bg-muted" : "",
                        )}
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        aria-label="Cursiva"
                      >
                        <Italic className="size-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className={cn(
                          "rounded-lg",
                          editor?.isActive("bulletList") ? "bg-muted" : "",
                        )}
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        aria-label="Lista con viñetas"
                      >
                        <List className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </div>

                  <div
                    className="min-h-[140px] w-full cursor-text rounded-xl border border-input bg-input/30 px-3 py-3 outline-none transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 [&_.ProseMirror]:min-h-[140px]"
                    onMouseDown={(e) => {
                      // Make the whole surface focus the editor.
                      if (!editor) return;
                      e.preventDefault();
                      editor.chain().focus().run();
                    }}
                  >
                    <EditorContent editor={editor} />
                  </div>
                </div>
              </div>
            ) : stepIndex === 2 ? (
              <div className="my-auto space-y-10">
                <div className="text-center">
                  <h1 className="text-[36px] leading-[40px] font-extrabold">
                    Seleccioná el barrio de tu habitación
                  </h1>
                  <p className="text-xs leading-4 text-muted-foreground">
                    There can only be one!
                  </p>
                </div>

                <div className="mx-auto w-full max-w-[560px]">
                  <BarcelonaZonePicker
                    formId="host-listing-wizard"
                    autoSubmit={false}
                    singleSelect
                    variant="wizard"
                    zones={neighborhoodZone ? [neighborhoodZone] : []}
                    onChangeZones={(z) => setNeighborhoodZone(z[0] ?? "")}
                  />
                </div>
              </div>
            ) : stepIndex === 3 ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="space-y-2">
                  <h1 className="text-[36px] leading-[40px] font-extrabold">
                    Agregá fotos
                  </h1>
                  <p className="text-sm leading-5 text-muted-foreground">
                    Por ahora este paso es opcional. Podés agregar hasta 5 fotos.
                  </p>
                  {photoUploadError ? (
                    <p className="text-sm text-destructive" role="alert">
                      {photoUploadError}
                    </p>
                  ) : null}
                  {photoUploadingCount > 0 && photos.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Subiendo {photoUploadingCount}…
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
                  {photos.length === 0 ? (
                    <label
                      className={cn(
                        "flex w-full cursor-pointer items-center justify-center rounded-xl border border-border bg-muted/10 px-4 py-12 text-sm text-muted-foreground transition-colors hover:bg-muted/20",
                      )}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        void addFiles(e.dataTransfer.files);
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files) void addFiles(files);
                          e.currentTarget.value = "";
                        }}
                      />
                      <div className="flex flex-col items-center gap-3">
                        <ImagePlus className="size-6" aria-hidden />
                        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground shadow-xs">
                          <Upload className="size-4" aria-hidden />
                          Cargar imágenes
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Podés arrastrar y soltar
                        </span>
                      </div>
                    </label>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Ta-da! ¿Cómo se ve?
                        </p>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-foreground shadow-xs hover:bg-muted/30">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files) void addFiles(files);
                              e.currentTarget.value = "";
                            }}
                          />
                          <Upload className="size-4" aria-hidden />
                          Agregar más
                        </label>
                      </div>

                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={({ active, over }) => {
                          if (!over || active.id === over.id) return;
                          setPhotos((prev) => {
                            const oldIndex = prev.findIndex((p) => p.id === active.id);
                            const newIndex = prev.findIndex((p) => p.id === over.id);
                            if (oldIndex === -1 || newIndex === -1) return prev;
                            return arrayMove(prev, oldIndex, newIndex);
                          });
                        }}
                      >
                        <SortableContext
                          items={photos.map((p) => p.id)}
                          strategy={rectSortingStrategy}
                        >
                          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                            {photos.map((p) => (
                              <SortablePhoto
                                key={p.id}
                                photo={p}
                                onDelete={() =>
                                  setPhotos((prev) => prev.filter((x) => x.id !== p.id))
                                }
                                onReplace={(file) => void replacePhoto(p.id, file)}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>

                      {photoUploadingCount > 0 ? (
                        <p className="text-xs text-muted-foreground">
                          Subiendo {photoUploadingCount}…
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Paso {stepIndex + 1} de {TOTAL_STEPS} (pendiente de diseño).
              </div>
            )}
          </div>

          <div className="mt-auto h-[92px] border-t border-border pt-4">
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground transition-[width] duration-300 ease-out"
                style={{ width: `${Math.round(progressValue * 100)}%` }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className={cn("rounded-full")}
                onClick={() => {
                  if (stepIndex === 0) router.back();
                  else setStepIndex((s) => Math.max(0, s - 1));
                }}
              >
                Atrás
              </Button>

              <Button
                type="button"
                size="sm"
                className="rounded-full"
                disabled={!canGoNext}
                onClick={() =>
                  setStepIndex((s) => Math.min(TOTAL_STEPS - 1, s + 1))
                }
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

