"use client";

import { CircleCheck } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  BARCELONA_ZONE_LABELS,
  BARCELONA_ZONE_ORDER,
} from "@/lib/barcelona-zones";

type Props = {
  name?: string;
  defaultZones?: string[];
  /** Parent `<form id>` so "Confirmar" can submit the listings filter form. */
  formId: string;
  onChangeZones?: (zones: string[]) => void;
};

const ZONE_PATH_CLASS =
  "barcelona-zone-polygon cursor-pointer transition-[fill,stroke] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function ZoneSvg({
  selected,
  toggle,
}: {
  selected: Set<string>;
  toggle: (id: string) => void;
}) {
  const mapId = useId();

  const poly = (id: string, points: string, lx: number, ly: number, label: string) => {
    const isOn = selected.has(id);
    return (
      <g key={id}>
        <polygon
          role="button"
          tabIndex={0}
          aria-pressed={isOn}
          aria-label={label}
          data-selected={isOn ? "true" : undefined}
          points={points}
          className={ZONE_PATH_CLASS}
          onClick={() => toggle(id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggle(id);
            }
          }}
        />
        <text
          x={lx}
          y={ly}
          textAnchor="middle"
          className="barcelona-zone-label"
          data-selected={isOn ? "true" : undefined}
          style={{ fontFamily: "inherit" }}
        >
          {label}
        </text>
      </g>
    );
  };

  return (
    <svg
      viewBox="52 48 270 222"
      className="text-foreground block h-auto w-full max-w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-labelledby={`${mapId}-title`}
    >
      <title id={`${mapId}-title`}>
        Mapa esquemático de distritos de Barcelona
      </title>
      {poly(
        "ciutatvella",
        "170,180 185,170 200,168 210,175 205,192 188,198 172,194",
        188,
        176,
        BARCELONA_ZONE_LABELS.ciutatvella,
      )}
      {poly(
        "eixample",
        "130,140 210,130 220,170 210,175 200,168 185,170 170,180 172,194 140,190 128,165",
        172,
        158,
        BARCELONA_ZONE_LABELS.eixample,
      )}
      {poly(
        "gracia",
        "170,100 220,95 225,130 210,130 130,140 128,120",
        178,
        120,
        BARCELONA_ZONE_LABELS.gracia,
      )}
      {poly(
        "sarriasantgervasi",
        "100,60 170,55 175,100 170,100 128,120 105,115 95,90",
        133,
        88,
        "Sarrià-St.G.",
      )}
      {poly(
        "lescorts",
        "60,100 105,115 128,120 130,140 128,165 90,170 65,150 55,125",
        90,
        138,
        BARCELONA_ZONE_LABELS.lescorts,
      )}
      {poly(
        "sants",
        "90,170 128,165 140,190 135,215 100,220 75,205 80,185",
        107,
        197,
        "Sants",
      )}
      {poly(
        "horta",
        "170,55 255,50 260,95 225,100 225,95 220,95 170,100 175,100",
        213,
        78,
        "Horta",
      )}
      {poly(
        "noubarris",
        "255,50 310,55 315,100 270,105 260,95",
        284,
        80,
        BARCELONA_ZONE_LABELS.noubarris,
      )}
      {poly(
        "santandreu",
        "260,95 315,100 320,150 275,155 265,130 225,130 225,100",
        280,
        127,
        BARCELONA_ZONE_LABELS.santandreu,
      )}
      {poly(
        "santmarti",
        "210,130 265,130 275,155 280,200 240,210 215,200 210,175",
        247,
        172,
        BARCELONA_ZONE_LABELS.santmarti,
      )}
      {poly(
        "poblesec",
        "130,190 170,180 188,198 185,220 155,230 128,215 128,200",
        158,
        202,
        BARCELONA_ZONE_LABELS.poblesec,
      )}
      {poly(
        "montjuic",
        "75,205 100,220 135,215 155,230 145,260 100,265 70,240",
        108,
        238,
        BARCELONA_ZONE_LABELS.montjuic,
      )}
    </svg>
  );
}

export function BarcelonaZonePicker({
  name = "zones",
  defaultZones = [],
  formId,
  onChangeZones,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(defaultZones.filter((z) => z in BARCELONA_ZONE_LABELS)),
  );

  const value = useMemo(() => [...selected].sort().join(","), [selected]);
  const didMount = useRef(false);
  const submitTimer = useRef<number | null>(null);

  useEffect(() => {
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
  }, [value, formId]);

  useEffect(() => {
    onChangeZones?.([...selected].sort());
  }, [onChangeZones, selected]);

  const toggle = (zone: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(zone)) next.delete(zone);
      else next.add(zone);
      return next;
    });
  };

  const summary =
    selected.size === 0 ? (
      <span className="text-muted-foreground">
        Ningún distrito seleccionado — elegí en el mapa o en las etiquetas.
      </span>
    ) : (
      <>
        <span className="text-foreground font-medium">
          {selected.size} {selected.size === 1 ? "distrito" : "distritos"}:
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <p className="text-base leading-6 font-medium text-foreground">
          ¿Dónde estás buscando?
        </p>
        <p className="text-sm leading-5 text-muted-foreground">
          Elegí tus zonas de interés
        </p>
      </div>

      <input type="hidden" name={name} value={value} form={formId} readOnly />

      <div
        className="-mx-4 w-[calc(100%+2rem)] max-w-none rounded-md bg-muted/35 px-1 py-1 [&_svg]:max-h-none"
        role="group"
        aria-label="Mapa esquemático de distritos"
      >
        <ZoneSvg selected={selected} toggle={toggle} />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs font-medium">
          Distritos seleccionados
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

      <p className="border-t border-border pt-3 text-xs leading-snug">{summary}</p>
    </div>
  );
}
