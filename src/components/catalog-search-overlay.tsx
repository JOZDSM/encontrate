"use client";

import Link from "next/link";
import {
  BookOpen,
  Dumbbell,
  HeartPulse,
  Home,
  PawPrint,
  Scissors,
  Sparkles,
  Truck,
  UtensilsCrossed,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { captureCatalogueSearchResultClicked } from "@/lib/catalogue-analytics";
import type { ServiceOffering } from "@/lib/mock-services-catalog";
import { HOME_PAGE_GUTTER_CLASS } from "@/lib/home-catalog-layout";
import { searchCatalog } from "@/lib/catalog-search";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  wellness: HeartPulse,
  fitness: Dumbbell,
  educación: BookOpen,
  educacion: BookOpen,
  belleza: Scissors,
  "ayuda en el hogar": Home,
  mudanza: Truck,
  reparaciones: Wrench,
  mascotas: PawPrint,
  gastronomía: UtensilsCrossed,
  gastronomia: UtensilsCrossed,
  eventos: Sparkles,
  extranjería: BookOpen,
  extranjeria: BookOpen,
};

function categoryIcon(category: string): LucideIcon {
  const key = category
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return CATEGORY_ICONS[key] ?? Sparkles;
}

export function CatalogSearchOverlay({
  open,
  onClose,
  services,
}: {
  open: boolean;
  onClose: () => void;
  services: ServiceOffering[];
}) {
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const id = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const groups = useMemo(
    () => searchCatalog(services, query),
    [services, query],
  );
  const hasQuery = query.trim().length > 0;

  if (!mounted || !open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[200] flex flex-col bg-black text-white"
    >
      <h2 id={titleId} className="sr-only">
        Buscar en el catálogo
      </h2>

      <div
        className={cn(
          "flex shrink-0 items-center pt-8 md:pt-10",
          HOME_PAGE_GUTTER_CLASS,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
        >
          <X className="size-4" strokeWidth={2} aria-hidden />
          Cerrar
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 pt-10 md:pt-14">
        <div className="mx-auto w-full max-w-2xl">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder=""
            autoComplete="off"
            aria-label="Buscar servicios"
            className={cn(
              "h-14 w-full rounded-full border-0 bg-white/10 px-6 text-base text-white outline-none",
              "shadow-[0_0_0_2px_color-mix(in_oklab,var(--brand-background)_55%,transparent),0_0_28px_color-mix(in_oklab,var(--brand-background)_35%,transparent)]",
              "focus:catalog-search-glow",
            )}
          />
        </div>

        <div className="mx-auto mt-8 w-full max-w-2xl flex-1 overflow-y-auto pb-24">
          {!hasQuery ? (
            <p className="text-center text-sm text-white/50">
              Escribe para ver resultados.
            </p>
          ) : groups.length === 0 ? (
            <p className="text-center text-sm text-white/50">
              No hay resultados para “{query.trim()}”.
            </p>
          ) : (
            <div className="space-y-8">
              {groups.map((group) => {
                const Icon = categoryIcon(group.category);
                return (
                  <section key={group.category} className="space-y-3">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                      <Icon className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                      {group.category}
                    </h3>
                    <ul className="space-y-2 pl-6">
                      {group.items.map((hit) => {
                        const href = hit.service.slug
                          ? `/${hit.service.slug}`
                          : null;
                        if (!href) {
                          return (
                            <li
                              key={hit.service.id}
                              className="text-base text-white/70"
                            >
                              {hit.label}
                            </li>
                          );
                        }
                        return (
                          <li key={hit.service.id}>
                            <Link
                              href={href}
                              onClick={() => {
                                captureCatalogueSearchResultClicked({
                                  serviceId: hit.service.id,
                                  slug: hit.service.slug!,
                                  title: hit.service.title,
                                  professionalName: hit.service.professionalName,
                                });
                                onClose();
                              }}
                              className="text-base text-white/90 transition-colors hover:text-white"
                            >
                              {hit.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <p className="shrink-0 px-4 py-6 text-center text-sm text-white/50">
        Encontrate solamente genera encuentros entre personas.{" "}
        <Link
          href="/aviso"
          onClick={onClose}
          className="underline underline-offset-2 hover:text-white/80"
        >
          Aviso legal
        </Link>
      </p>
    </div>,
    document.body,
  );
}
