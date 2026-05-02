"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bold,
  Italic,
  List,
  Minus,
  MoreHorizontal,
  Plus,
  Upload,
  ImagePlus,
  Trash2,
  RefreshCcw,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
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
import {
  LISTING_WINDOW_OPTIONS,
  type ListingWindowValue,
} from "@/lib/listing-window-options";

const TOTAL_STEPS = 6;

const ROOM_SIZE_STEPS = [5, 10, 15, 20, 21] as const;

function roomStepIndex(sqm: number): number {
  const i = ROOM_SIZE_STEPS.indexOf(
    sqm as (typeof ROOM_SIZE_STEPS)[number],
  );
  return i === -1 ? 0 : i;
}

function formatRoomSizeDisplay(sqm: number): string {
  if (sqm === 21) return "+20";
  return String(sqm);
}

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
  variant,
  index,
  total,
  onDelete,
  onReplace,
  onMoveEarlier,
  onMoveLater,
}: {
  photo: UploadedPhoto;
  variant: "hero" | "tile";
  index: number;
  total: number;
  onDelete: () => void;
  onReplace: (file: File) => void;
  onMoveEarlier: () => void;
  onMoveLater: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: photo.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
  };

  const stopMenuDrag = (e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-muted/20",
        variant === "hero"
          ? "w-full min-h-[220px] sm:min-h-[280px]"
          : "min-h-0 w-full",
      )}
    >
      <div
        className={cn(
          "relative w-full cursor-grab select-none active:cursor-grabbing",
          variant === "hero" ? "aspect-[16/10] sm:aspect-[2/1]" : "aspect-square",
        )}
        {...attributes}
        {...listeners}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt=""
          className="pointer-events-none h-full w-full object-cover"
          draggable={false}
        />
      </div>

      <div
        className="absolute top-2 right-2 z-10"
        onPointerDown={stopMenuDrag}
        onMouseDown={stopMenuDrag}
      >
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
            <DropdownMenuItem
              disabled={index >= total - 1}
              onSelect={(e) => {
                e.preventDefault();
                onMoveLater();
              }}
            >
              <ChevronDown className="mr-2 size-4" aria-hidden />
              Un lugar hacia adelante
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={index <= 0}
              onSelect={(e) => {
                e.preventDefault();
                onMoveEarlier();
              }}
            >
              <ChevronUp className="mr-2 size-4" aria-hidden />
              Un lugar hacia atrás
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
      </div>
    </div>
  );
}

export function HostListingWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Step 1: listing title only for now.
  const [title, setTitle] = useState("");
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const [neighborhoodZone, setNeighborhoodZone] = useState<string>("");
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [photoUploadingCount, setPhotoUploadingCount] = useState(0);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);

  const [bedSize, setBedSize] = useState<"INDIVIDUAL" | "DOBLE">("DOBLE");
  const [windowTypes, setWindowTypes] = useState<ListingWindowValue[]>([]);
  const [roomSizeSqm, setRoomSizeSqm] =
    useState<(typeof ROOM_SIZE_STEPS)[number]>(5);
  const [furnished, setFurnished] = useState(true);

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
    if (stepIndex === 3) return true;
    if (stepIndex === 4) return windowTypes.length > 0;
    return true;
  }, [stepIndex, title, descriptionText, neighborhoodZone, windowTypes]);
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

  function movePhotoInList(photoId: string, direction: "earlier" | "later") {
    setPhotos((prev) => {
      const i = prev.findIndex((p) => p.id === photoId);
      if (i === -1) return prev;
      if (direction === "earlier" && i === 0) return prev;
      if (direction === "later" && i === prev.length - 1) return prev;
      const j = direction === "earlier" ? i - 1 : i + 1;
      return arrayMove(prev, i, j);
    });
  }

  function removePhoto(photoId: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  }

  return (
    <div className="mx-auto flex h-full max-h-full min-h-0 w-full max-w-[1440px] flex-1 flex-col overflow-hidden px-4 pt-4 pb-2 md:pt-6 md:pb-3">
      <Card className="mx-auto flex h-full max-h-full min-h-0 w-full max-w-[1220px] flex-1 flex-col overflow-hidden border border-border bg-card pt-6 pb-3 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="flex min-h-0 flex-1 flex-col gap-8 overflow-hidden px-6 pt-6 pb-0 text-card-foreground">
          <div
            className={cn(
              "mx-auto flex min-h-0 w-full flex-1 flex-col overflow-hidden",
              stepIndex === 3 ? "max-w-full" : "max-w-[730px]",
            )}
          >
            {stepIndex === 0 ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto overscroll-y-contain">
                  <div className="space-y-6">
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
                </div>
              </div>
            ) : stepIndex === 1 ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto overscroll-y-contain">
                  <div className="space-y-6">
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
                </div>
              </div>
            ) : stepIndex === 2 ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto overscroll-y-contain">
                  <div className="space-y-10">
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
                </div>
              </div>
            ) : stepIndex === 3 ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="shrink-0 space-y-2">
                  {photos.length === 0 ? (
                    <>
                      <h1 className="text-[36px] leading-[40px] font-extrabold">
                        Agregá fotos
                      </h1>
                      <p className="text-sm leading-5 text-muted-foreground">
                        Por ahora este paso es opcional. Podés agregar hasta 5 fotos.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <h1 className="text-[36px] leading-[40px] font-extrabold">
                            Ta-da! ¿Cómo se ve?
                          </h1>
                          <p className="text-sm leading-5 text-muted-foreground">
                            Podés cambiar el orden de tus fotos arrastrándolas a donde
                            prefieras.
                          </p>
                        </div>
                        {photos.length < 5 ? (
                          <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 self-start rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-foreground shadow-xs hover:bg-muted/30 sm:mt-1">
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
                        ) : null}
                      </div>
                    </>
                  )}
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

                <div className="mt-6 min-h-0 flex-1 overflow-y-auto overscroll-y-contain pr-1">
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
                    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-2">
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
                          {photos[0] ? (
                            <SortablePhoto
                              key={photos[0].id}
                              photo={photos[0]}
                              variant="hero"
                              index={0}
                              total={photos.length}
                              onDelete={() => removePhoto(photos[0].id)}
                              onReplace={(file) => void replacePhoto(photos[0].id, file)}
                              onMoveEarlier={() =>
                                movePhotoInList(photos[0].id, "earlier")
                              }
                              onMoveLater={() =>
                                movePhotoInList(photos[0].id, "later")
                              }
                            />
                          ) : null}

                          {photos.length > 1 ? (
                            <div className="grid grid-cols-2 gap-2">
                              {photos.slice(1).map((p, sliceIdx) => {
                                const index = sliceIdx + 1;
                                return (
                                  <SortablePhoto
                                    key={p.id}
                                    photo={p}
                                    variant="tile"
                                    index={index}
                                    total={photos.length}
                                    onDelete={() => removePhoto(p.id)}
                                    onReplace={(file) => void replacePhoto(p.id, file)}
                                    onMoveEarlier={() =>
                                      movePhotoInList(p.id, "earlier")
                                    }
                                    onMoveLater={() =>
                                      movePhotoInList(p.id, "later")
                                    }
                                  />
                                );
                              })}
                            </div>
                          ) : null}
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
            ) : stepIndex === 4 ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="shrink-0 space-y-2">
                  <h1 className="text-[36px] leading-[40px] font-extrabold">
                    Características de la habitación
                  </h1>
                  <p className="text-sm leading-5 text-muted-foreground">
                    Knowledge is power 💪 Seleccioná lo más que puedas; al menos una opción
                    de ventana…
                  </p>
                </div>

                <div className="mt-6 min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-y-contain pr-1">
                  <section className="space-y-3">
                    <p className="text-sm font-medium">Tamaño de cama</p>
                    <RadioGroup
                      value={bedSize}
                      onValueChange={(v) =>
                        setBedSize(v as "INDIVIDUAL" | "DOBLE")
                      }
                      className="gap-3"
                    >
                      <label className="flex cursor-pointer items-center gap-3">
                        <RadioGroupItem value="DOBLE" id="wizard-bed-doble" />
                        <Label
                          htmlFor="wizard-bed-doble"
                          className="cursor-pointer font-normal"
                        >
                          Doble
                        </Label>
                      </label>
                      <label className="flex cursor-pointer items-center gap-3">
                        <RadioGroupItem
                          value="INDIVIDUAL"
                          id="wizard-bed-individual"
                        />
                        <Label
                          htmlFor="wizard-bed-individual"
                          className="cursor-pointer font-normal"
                        >
                          Individual
                        </Label>
                      </label>
                    </RadioGroup>
                  </section>

                  <Separator />

                  <section className="space-y-3">
                    <p className="text-sm font-medium">Ventana</p>
                    <p className="text-xs text-muted-foreground">
                      Podés marcar más de una si aplica.
                    </p>
                    <div className="space-y-3">
                      {LISTING_WINDOW_OPTIONS.map((opt) => {
                        const checked = windowTypes.includes(opt.value);
                        return (
                          <label
                            key={opt.value}
                            className={cn(
                              "flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors",
                              checked
                                ? "border-foreground/70 bg-muted/25"
                                : "border-border bg-muted/5 hover:bg-muted/15",
                            )}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => {
                                const on = v === true;
                                setWindowTypes((prev) => {
                                  if (on) {
                                    return prev.includes(opt.value)
                                      ? prev
                                      : [...prev, opt.value];
                                  }
                                  return prev.filter((x) => x !== opt.value);
                                });
                              }}
                              className="mt-1 shrink-0"
                              aria-labelledby={`wizard-win-${opt.value}-title`}
                            />
                            <div className="min-w-0 flex-1 space-y-1">
                              <span
                                id={`wizard-win-${opt.value}-title`}
                                className="block text-sm font-semibold text-foreground"
                              >
                                {opt.title}
                              </span>
                              <span className="block text-sm leading-5 text-muted-foreground">
                                {opt.description}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </section>

                  <Separator />

                  <section className="space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Tamaño aproximado de la habitación (m2)
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Puede ser a ojo 👁️
                        </p>
                      </div>
                      <div className="inline-flex shrink-0 items-stretch overflow-hidden rounded-xl border border-input bg-input/30">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-10 rounded-none border-r border-border px-3"
                          aria-label="Medida anterior"
                          disabled={roomStepIndex(roomSizeSqm) <= 0}
                          onClick={() =>
                            setRoomSizeSqm((prev) => {
                              const i = roomStepIndex(prev);
                              return ROOM_SIZE_STEPS[Math.max(0, i - 1)];
                            })
                          }
                        >
                          <Minus className="size-4" aria-hidden />
                        </Button>
                        <span className="flex min-w-[3rem] items-center justify-center px-3 text-sm font-medium tabular-nums">
                          {formatRoomSizeDisplay(roomSizeSqm)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-10 rounded-none border-l border-border px-3"
                          aria-label="Medida siguiente"
                          disabled={
                            roomStepIndex(roomSizeSqm) >=
                            ROOM_SIZE_STEPS.length - 1
                          }
                          onClick={() =>
                            setRoomSizeSqm((prev) => {
                              const i = roomStepIndex(prev);
                              return ROOM_SIZE_STEPS[
                                Math.min(ROOM_SIZE_STEPS.length - 1, i + 1)
                              ];
                            })
                          }
                        >
                          <Plus className="size-4" aria-hidden />
                        </Button>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  <section className="space-y-3">
                    <p className="text-sm font-medium">Habitación amueblada</p>
                    <RadioGroup
                      value={furnished ? "si" : "no"}
                      onValueChange={(v) => setFurnished(v === "si")}
                      className="gap-3"
                    >
                      <label className="flex cursor-pointer items-center gap-3">
                        <RadioGroupItem value="si" id="wizard-furn-yes" />
                        <Label
                          htmlFor="wizard-furn-yes"
                          className="cursor-pointer font-normal"
                        >
                          Sí
                        </Label>
                      </label>
                      <label className="flex cursor-pointer items-center gap-3">
                        <RadioGroupItem value="no" id="wizard-furn-no" />
                        <Label
                          htmlFor="wizard-furn-no"
                          className="cursor-pointer font-normal"
                        >
                          No
                        </Label>
                      </label>
                    </RadioGroup>
                  </section>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Paso {stepIndex + 1} de {TOTAL_STEPS} (pendiente de diseño).
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-border pt-4">
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
                  if (stepIndex === 0) setCancelDialogOpen(true);
                  else setStepIndex((s) => Math.max(0, s - 1));
                }}
                aria-label={
                  stepIndex === 0
                    ? "Cancelar carga del anuncio"
                    : "Paso anterior"
                }
              >
                {stepIndex === 0 ? "Cancelar" : "Atrás"}
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

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="gap-4 border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Salir de cargar tu habitación?</DialogTitle>
            <DialogDescription>
              Si salís, se perderá lo que hayas cargado en este formulario.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setCancelDialogOpen(false)}
            >
              Seguir editando
            </Button>
            <Button
              type="button"
              className="rounded-full"
              onClick={() => {
                setCancelDialogOpen(false);
                router.back();
              }}
            >
              Salir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

