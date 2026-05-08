"use client";

import { CircleCheck } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { BarcelonaZoneSvg } from "@/components/barcelona-zone-svg";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  BARCELONA_ZONE_LABELS,
  BARCELONA_ZONE_ORDER,
} from "@/lib/barcelona-zones";

type Props = {
  name?: string;
  defaultZones?: string[];
  /** Controlled zones (preferred). */
  zones?: string[];
  /** Parent `<form id>` so "Confirmar" can submit the listings filter form. */
  formId: string;
  onChangeZones?: (zones: string[]) => void;
  /** If true, selection changes auto-submit the parent form. */
  autoSubmit?: boolean;
  /** When true, only one zone can be selected at a time. */
  singleSelect?: boolean;
  /** Override the default title/subtitle text. */
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** UI layout preset. */
  variant?: "filters" | "wizard";
};

export function BarcelonaZonePicker({
  name = "zones",
  defaultZones = [],
  zones,
  formId,
  onChangeZones,
  autoSubmit = true,
  singleSelect = false,
  title,
  subtitle,
  variant = "filters",
}: Props) {
  const titleId = useId();

  const [uncontrolledSelected, setUncontrolledSelected] = useState<Set<string>>(
    () => new Set(defaultZones.filter((z) => z in BARCELONA_ZONE_LABELS)),
  );

  const selected = useMemo(() => {
    if (zones) return new Set(zones.filter((z) => z in BARCELONA_ZONE_LABELS));
    return uncontrolledSelected;
  }, [zones, uncontrolledSelected]);

  const value = useMemo(() => [...selected].sort().join(","), [selected]);
  const didMount = useRef(false);
  const submitTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!autoSubmit) return;
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    if (submitTimer.current != null) window.clearTimeout(submitTimer.current);
    submitTimer.current = window.setTimeout(() => {
      const form = document.getElementById(formId) as HTMLFormElement | null;
      if (!form) return;
      // Prefer requestSubmit (respects validation), fallback to submit.
      if (typeof form.requestSubmit === "function") form.requestSubmit();
      else form.submit();
    }, 250);
  }, [value, formId, autoSubmit]);

  useEffect(() => {
    // Uncontrolled mode: notify parent when internal selection changes.
    if (zones) return;
    onChangeZones?.([...selected].sort());
  }, [onChangeZones, selected, zones]);

  const toggle = (zone: string) => {
    if (zones) {
      const next = new Set(selected);
      if (next.has(zone)) {
        next.delete(zone);
      } else {
        if (singleSelect) next.clear();
        next.add(zone);
      }
      onChangeZones?.([...next].sort());
      return;
    }
    setUncontrolledSelected((prev) => {
      const next = new Set(prev);
      if (next.has(zone)) {
        next.delete(zone);
      } else {
        if (singleSelect) next.clear();
        next.add(zone);
      }
      return next;
    });
  };

  const summary =
    selected.size === 0 ? (
      <span className="text-muted-foreground">
        Ningún barrio seleccionado — elegí en el mapa o en las etiquetas.
      </span>
    ) : (
      <>
        <span className="text-foreground font-medium">
          {selected.size} {selected.size === 1 ? "barrio" : "barrios"}:
        </span>{" "}
        <span className="text-muted-foreground">
          {[...selected]
            .sort(
              (a, b) =>
                BARCELONA_ZONE_ORDER.indexOf(a) -
                BARCELONA_ZONE_ORDER.indexOf(b),
            )
            .map((z) => BARCELONA_ZONE_LABELS[z])
            .join(", ")}
        </span>
      </>
    );

  const selectedZones = useMemo(
    () =>
      [...selected].sort(
        (a, b) =>
          BARCELONA_ZONE_ORDER.indexOf(a) - BARCELONA_ZONE_ORDER.indexOf(b),
      ),
    [selected],
  );

  return (
    <div className="flex flex-col gap-8">
      <input type="hidden" name={name} value={value} form={formId} readOnly />

      {variant === "filters" ? (
        <>
          <div className="flex flex-col gap-1">
            <p className="text-base leading-6 font-medium text-foreground">
              {title ?? "¿Dónde estás buscando?"}
            </p>
            <p className="text-sm leading-5 text-muted-foreground">
              {subtitle ?? "Elegí tus barrios de interés"}
            </p>
          </div>

          <div
            className="p-4 [&_svg]:max-h-none"
            role="group"
            aria-label="Mapa esquemático de barrios"
          >
            <BarcelonaZoneSvg
              selected={selected}
              toggle={toggle}
              titleId={titleId}
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-xs font-medium">
              Barrios seleccionados
            </p>
            <div className="flex flex-wrap gap-1">
              {BARCELONA_ZONE_ORDER.map((zone) => {
                const on = selected.has(zone);
                const label = BARCELONA_ZONE_LABELS[zone];
                return (
                  <button
                    key={zone}
                    type="button"
                    aria-pressed={on}
                    className={cn(
                      badgeVariants({ variant: "outline" }),
                      "h-auto min-h-8 cursor-pointer rounded-full px-2 py-1.5 text-xs font-medium shadow-xs",
                      on
                        ? "border-foreground bg-accent text-accent-foreground hover:bg-accent/90"
                        : "border-border bg-background text-foreground hover:bg-muted/60",
                    )}
                    onClick={() => toggle(zone)}
                  >
                    <span className="flex items-center gap-1.5">
                      {on ? (
                        <CircleCheck
                          className="size-4 shrink-0"
                          strokeWidth={2}
                          aria-hidden
                        />
                      ) : null}
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="border-t border-border pt-3 text-xs leading-snug">
            {summary}
          </p>
        </>
      ) : (
        <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
          <div
            className="mx-auto w-full max-w-[520px] p-4 [&_svg]:max-h-none"
            role="group"
            aria-label="Mapa esquemático de barrios"
          >
            <BarcelonaZoneSvg
              selected={selected}
              toggle={toggle}
              titleId={titleId}
            />
          </div>

          <div className="flex items-center justify-center md:justify-end">
            {selectedZones.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedZones.map((zone) => (
                  <button
                    key={zone}
                    type="button"
                    aria-label={`Quitar ${BARCELONA_ZONE_LABELS[zone]}`}
                    className={cn(
                      badgeVariants({ variant: "outline" }),
                      "h-auto min-h-8 cursor-pointer rounded-full px-3 py-2 text-xs font-medium shadow-xs border-foreground bg-accent text-accent-foreground hover:bg-accent/90",
                    )}
                    onClick={() => toggle(zone)}
                  >
                    <span className="flex items-center gap-1.5">
                      <CircleCheck
                        className="size-4 shrink-0"
                        strokeWidth={2}
                        aria-hidden
                      />
                      {BARCELONA_ZONE_LABELS[zone]}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">
                Elegí un barrio en el mapa
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
