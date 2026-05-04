"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ImagePlus,
  MoreHorizontal,
  RefreshCcw,
  Trash2,
  Upload,
} from "lucide-react";
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
  LISTING_PHOTO_SIZE_HELPER_ES,
  LISTING_PHOTO_TOO_LARGE_MESSAGE,
  MAX_LISTING_PHOTO_BYTES,
} from "@/lib/listing-photo-upload";

const MAX_PHOTOS = 12;

type PhotoItem = { id: string; url: string };

function makeId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function looksLikeImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp|heic|heif|avif|bmp)$/i.test(file.name);
}

function urlsToItems(urls: string[]): PhotoItem[] {
  return urls.map((url) => ({ id: makeId(), url }));
}

function SortablePhotoTile({
  photo,
  variant,
  index,
  total,
  onDelete,
  onReplace,
  onMoveEarlier,
  onMoveLater,
}: {
  photo: PhotoItem;
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
          ? "w-full min-h-[180px] sm:min-h-[220px]"
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

export function HostListingPhotoEditor({
  initialUrls,
  onChange,
}: {
  initialUrls: string[];
  onChange: (urls: string[]) => void;
}) {
  const [photos, setPhotos] = useState<PhotoItem[]>(() => urlsToItems(initialUrls));
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const urlsFingerprint = useMemo(() => initialUrls.join("\0"), [initialUrls]);

  useEffect(() => {
    const next = urlsToItems(initialUrls);
    setPhotos(next);
    onChange(next.map((p) => p.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when URLs from server change
  }, [urlsFingerprint]);

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
        else if (res.status === 413) message = LISTING_PHOTO_TOO_LARGE_MESSAGE;
      }
      throw new Error(message);
    }
    if (!body?.url) throw new Error("No se pudo subir la imagen.");
    return body.url;
  }

  async function addFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setError(null);
    const remaining = Math.max(0, MAX_PHOTOS - photosRef.current.length);
    const picked = arr.slice(0, remaining).filter(looksLikeImageFile);
    if (picked.length === 0) {
      setError(
        "No encontramos imágenes válidas (JPEG, PNG, WebP, GIF…).",
      );
      return;
    }
    const oversize = picked.filter((f) => f.size > MAX_LISTING_PHOTO_BYTES);
    if (oversize.length > 0) {
      setError(
        oversize.length === 1
          ? LISTING_PHOTO_TOO_LARGE_MESSAGE
          : `${oversize.length} fotos superan el máximo de 4 MB cada una.`,
      );
      return;
    }
    setUploading((n) => n + picked.length);
    try {
      const urls = await Promise.all(picked.map((f) => uploadOne(f)));
      setPhotos((prev) => {
        const next = [
          ...prev,
          ...urls.map((url) => ({ id: makeId(), url })),
        ];
        onChange(next.map((p) => p.url));
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la imagen.");
    } finally {
      setUploading((n) => Math.max(0, n - picked.length));
    }
  }

  async function replacePhoto(photoId: string, file: File) {
    if (!looksLikeImageFile(file)) {
      setError("Elegí un archivo de imagen (JPEG, PNG, WebP, GIF…).");
      return;
    }
    if (file.size > MAX_LISTING_PHOTO_BYTES) {
      setError(LISTING_PHOTO_TOO_LARGE_MESSAGE);
      return;
    }
    setError(null);
    setUploading((n) => n + 1);
    try {
      const url = await uploadOne(file);
      setPhotos((prev) => {
        const next = prev.map((p) => (p.id === photoId ? { ...p, url } : p));
        onChange(next.map((p) => p.url));
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la imagen.");
    } finally {
      setUploading((n) => Math.max(0, n - 1));
    }
  }

  function movePhoto(photoId: string, direction: "earlier" | "later") {
    setPhotos((prev) => {
      const i = prev.findIndex((p) => p.id === photoId);
      if (i === -1) return prev;
      if (direction === "earlier" && i === 0) return prev;
      if (direction === "later" && i === prev.length - 1) return prev;
      const j = direction === "earlier" ? i - 1 : i + 1;
      const next = arrayMove(prev, i, j);
      onChange(next.map((p) => p.url));
      return next;
    });
  }

  function removePhoto(photoId: string) {
    setPhotos((prev) => {
      const next = prev.filter((p) => p.id !== photoId);
      onChange(next.map((p) => p.url));
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">Fotos</p>
        <p className="text-xs text-muted-foreground">
          Igual que al publicar: subí imágenes, reordená y reemplazá. {LISTING_PHOTO_SIZE_HELPER_ES}{" "}
          Máximo {MAX_PHOTOS} fotos.
        </p>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {uploading > 0 ? (
        <p className="text-xs text-muted-foreground">
          Subiendo {uploading} {uploading === 1 ? "foto" : "fotos"}…
        </p>
      ) : null}

      {photos.length === 0 ? (
        <label
          className={cn(
            "flex w-full cursor-pointer items-center justify-center rounded-xl border border-border bg-muted/10 px-4 py-10 text-sm text-muted-foreground transition-colors hover:bg-muted/20",
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
          </div>
        </label>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {photos.length < MAX_PHOTOS ? (
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
            ) : null}
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
                const next = arrayMove(prev, oldIndex, newIndex);
                onChange(next.map((p) => p.url));
                return next;
              });
            }}
          >
            <SortableContext
              items={photos.map((p) => p.id)}
              strategy={rectSortingStrategy}
            >
              {photos[0] ? (
                <SortablePhotoTile
                  key={photos[0].id}
                  photo={photos[0]}
                  variant="hero"
                  index={0}
                  total={photos.length}
                  onDelete={() => removePhoto(photos[0].id)}
                  onReplace={(file) => void replacePhoto(photos[0].id, file)}
                  onMoveEarlier={() => movePhoto(photos[0].id, "earlier")}
                  onMoveLater={() => movePhoto(photos[0].id, "later")}
                />
              ) : null}
              {photos.length > 1 ? (
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {photos.slice(1).map((p, sliceIdx) => {
                    const index = sliceIdx + 1;
                    return (
                      <SortablePhotoTile
                        key={p.id}
                        photo={p}
                        variant="tile"
                        index={index}
                        total={photos.length}
                        onDelete={() => removePhoto(p.id)}
                        onReplace={(file) => void replacePhoto(p.id, file)}
                        onMoveEarlier={() => movePhoto(p.id, "earlier")}
                        onMoveLater={() => movePhoto(p.id, "later")}
                      />
                    );
                  })}
                </div>
              ) : null}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
