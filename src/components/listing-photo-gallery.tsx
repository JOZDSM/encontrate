"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type Photo = { id?: string; url: string };

export function ListingPhotoGallery({ photos }: { photos: Photo[] }) {
  const urls = useMemo(
    () => photos.map((p) => p.url).filter(Boolean),
    [photos],
  );
  const hasPhotos = urls.length > 0;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openAt = useCallback(
    (idx: number) => {
      if (!hasPhotos) return;
      setActiveIndex(Math.max(0, Math.min(urls.length - 1, idx)));
      setOpen(true);
    },
    [hasPhotos, urls.length],
  );

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + urls.length) % urls.length);
  }, [urls.length]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % urls.length);
  }, [urls.length]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, goPrev, goNext]);

  if (!hasPhotos) return null;

  const cover = urls[0]!;

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-border bg-muted/10">
        {/* Mobile: cover only + CTA */}
        <div className="relative md:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt=""
            className="aspect-[16/10] w-full object-cover"
            onClick={() => openAt(0)}
          />
          {urls.length > 1 ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="absolute bottom-3 right-3 rounded-full"
              onClick={() => openAt(0)}
            >
              Ver más fotos
            </Button>
          ) : null}
        </div>

        {/* Desktop: constrained hero + 2x2 grid */}
        <div className="hidden gap-2 p-2 md:grid md:grid-cols-4 md:grid-rows-2">
          <button
            type="button"
            className="group relative overflow-hidden rounded-xl md:col-span-2 md:row-span-2"
            onClick={() => openAt(0)}
            aria-label="Ver fotos"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt=""
              className="aspect-square h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]"
            />
          </button>

          {urls.slice(1, 5).map((url, idx) => {
            const gridIndex = idx + 1;
            return (
              <button
                key={url}
                type="button"
                className="group relative overflow-hidden rounded-xl"
                onClick={() => openAt(gridIndex)}
                aria-label={`Ver foto ${gridIndex + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="aspect-square h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]"
                />
                {gridIndex === 4 && urls.length > 5 ? (
                  <div className="absolute inset-0 grid place-content-center bg-black/45">
                    <span className="rounded-full bg-black/55 px-4 py-2 text-sm font-semibold text-white">
                      +{urls.length - 5}
                    </span>
                  </div>
                ) : null}
              </button>
            );
          })}

          {/* Fill missing cells if fewer than 5 photos */}
          {urls.length < 5
            ? Array.from({ length: 5 - urls.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="rounded-xl border border-dashed border-border bg-muted/10"
                />
              ))
            : null}
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={cn(
            "max-w-[calc(100%-1.5rem)] p-0 sm:max-w-5xl",
            "bg-black text-white ring-0",
          )}
          showCloseButton={false}
        >
          <div className="relative">
            <div className="absolute left-3 top-3 z-10">
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="rounded-full"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
              >
                <X className="size-4" aria-hidden />
              </Button>
            </div>

            {urls.length > 1 ? (
              <>
                <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    className="rounded-full"
                    onClick={goPrev}
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                  </Button>
                </div>
                <div className="absolute right-3 top-1/2 z-10 -translate-y-1/2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    className="rounded-full"
                    onClick={goNext}
                    aria-label="Siguiente"
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </Button>
                </div>
              </>
            ) : null}

            <div className="flex max-h-[80svh] items-center justify-center bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urls[activeIndex] ?? cover}
                alt=""
                className="max-h-[80svh] w-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between px-4 py-3 text-xs text-white/80">
              <span>
                Foto {activeIndex + 1} de {urls.length}
              </span>
              {urls.length > 1 ? (
                <span className="hidden sm:inline">
                  Usá ← → para navegar
                </span>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

