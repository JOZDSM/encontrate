"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRY_OPTIONS } from "@/lib/countries";
import {
  saveBuscarHuespedFilter,
  type BuscarHuespedFilterInput,
} from "@/app/actions/buscar-huesped";
import {
  SIGNAL_FLEX_STAY_LABELS,
  SIGNAL_GENDER_LABELS,
  SIGNAL_LANGUAGE_LABELS,
  SIGNAL_MOVING_WITH_LABELS,
  SIGNAL_OCCUPATION_LABELS,
} from "@/lib/signal-labels";
import { cn } from "@/lib/utils";

const GENDER_VALUES = ["FEMALE", "MALE", "NON_BINARY", "OTHER"] as const;
const OCCUPATION_VALUES = [
  "STUDENT",
  "EMPLOYED",
  "FREELANCE",
  "ENTREPRENEUR",
  "REMOTE_WORKER",
  "OTHER",
] as const;
const LANGUAGE_VALUES = ["ES", "EN", "CA", "IT", "FR", "DE", "PT", "OTHER"] as const;
const MOVING_WITH_VALUES = ["SOLO", "COUPLE", "OTHER"] as const;
const FLEX_STAY_VALUES = ["WEEKEND", "WEEK", "MONTH"] as const;

export type BuscarHuespedFormProps = {
  initial: BuscarHuespedFilterInput;
};

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

function ChipToggleRow({
  values,
  selected,
  labels,
  onToggle,
  ariaLabel,
}: {
  values: readonly string[];
  selected: readonly string[];
  labels: Record<string, string>;
  onToggle: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {values.map((v) => {
        const active = selected.includes(v);
        return (
          <button
            key={v}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(v)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background hover:bg-foreground/10",
            )}
          >
            {labels[v] ?? v}
          </button>
        );
      })}
    </div>
  );
}

export function BuscarHuespedForm({ initial }: BuscarHuespedFormProps) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [notifyByEmail, setNotifyByEmail] = useState(initial.notifyByEmail);
  const [genders, setGenders] = useState<string[]>([...initial.genders]);
  const [ageMin, setAgeMin] = useState<string>(
    initial.ageMin !== null ? String(initial.ageMin) : "",
  );
  const [ageMax, setAgeMax] = useState<string>(
    initial.ageMax !== null ? String(initial.ageMax) : "",
  );
  const [countries, setCountries] = useState<string[]>([
    ...initial.countriesOfOrigin,
  ]);
  const [occupations, setOccupations] = useState<string[]>([
    ...initial.occupations,
  ]);
  const [languages, setLanguages] = useState<string[]>([...initial.languages]);
  const [movingWith, setMovingWith] = useState<string[]>([...initial.movingWith]);
  const [cleanlinessMin, setCleanlinessMin] = useState<string>(
    initial.cleanlinessMin !== null ? String(initial.cleanlinessMin) : "",
  );
  const [cleanlinessMax, setCleanlinessMax] = useState<string>(
    initial.cleanlinessMax !== null ? String(initial.cleanlinessMax) : "",
  );
  const [orderMin, setOrderMin] = useState<string>(
    initial.orderMin !== null ? String(initial.orderMin) : "",
  );
  const [orderMax, setOrderMax] = useState<string>(
    initial.orderMax !== null ? String(initial.orderMax) : "",
  );
  const [includeAsap, setIncludeAsap] = useState(initial.includeAsap);
  const [flexStayLengths, setFlexStayLengths] = useState<string[]>([
    ...initial.flexStayLengths,
  ]);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function nullableInt(s: string): number | null {
    if (s.trim() === "") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const payload: BuscarHuespedFilterInput = {
      enabled,
      notifyByEmail,
      genders: genders as BuscarHuespedFilterInput["genders"],
      ageMin: nullableInt(ageMin),
      ageMax: nullableInt(ageMax),
      countriesOfOrigin: countries,
      occupations: occupations as BuscarHuespedFilterInput["occupations"],
      languages: languages as BuscarHuespedFilterInput["languages"],
      movingWith: movingWith as BuscarHuespedFilterInput["movingWith"],
      cleanlinessMin: nullableInt(cleanlinessMin),
      cleanlinessMax: nullableInt(cleanlinessMax),
      orderMin: nullableInt(orderMin),
      orderMax: nullableInt(orderMax),
      // Date mode is intentionally omitted from v1 of the host filter UI; we
      // persist the existing values as-is so a future revision can surface them
      // without a migration.
      dateMode: initial.dateMode,
      exactCheckIn: initial.exactCheckIn,
      exactCheckOut: initial.exactCheckOut,
      exactFlexDays: initial.exactFlexDays,
      flexStayLengths: flexStayLengths as BuscarHuespedFilterInput["flexStayLengths"],
      flexMonths: initial.flexMonths,
      includeAsap,
    };

    startTransition(async () => {
      const res = await saveBuscarHuespedFilter(payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="space-y-3">
        <label className="flex cursor-pointer gap-3 rounded-2xl border border-border bg-muted/5 p-4 transition-colors hover:bg-muted/15">
          <Checkbox
            checked={enabled}
            onCheckedChange={(v) => setEnabled(v === true)}
            className="mt-1 shrink-0"
          />
          <div className="min-w-0 space-y-1">
            <span className="block text-sm font-semibold text-foreground">
              Buscar huéspedes activamente
            </span>
            <span className="block text-sm leading-5 text-muted-foreground">
              Cuando se publique una señal nueva que coincida, te aviso en el
              Panel.
            </span>
          </div>
        </label>

        <label className="flex cursor-pointer gap-3 rounded-2xl border border-border bg-muted/5 p-4 transition-colors hover:bg-muted/15">
          <Checkbox
            checked={notifyByEmail}
            onCheckedChange={(v) => setNotifyByEmail(v === true)}
            className="mt-1 shrink-0"
            disabled={!enabled}
          />
          <div className="min-w-0 space-y-1">
            <span className="block text-sm font-semibold text-foreground">
              Notificarme por email
            </span>
            <span className="block text-sm leading-5 text-muted-foreground">
              Además del aviso en el Panel, mandamos un email a tu casilla.
            </span>
          </div>
        </label>
      </div>

      <Separator />

      <section className="space-y-3">
        <Label>Género</Label>
        <ChipToggleRow
          values={GENDER_VALUES}
          selected={genders}
          labels={SIGNAL_GENDER_LABELS}
          onToggle={(v) => setGenders((prev) => toggle(prev, v))}
          ariaLabel="Género"
        />
      </section>

      <section className="space-y-3">
        <Label>Edad</Label>
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            inputMode="numeric"
            min={16}
            max={120}
            value={ageMin}
            onChange={(e) => setAgeMin(e.target.value)}
            placeholder="Min."
            aria-label="Edad mínima"
          />
          <Input
            type="number"
            inputMode="numeric"
            min={16}
            max={120}
            value={ageMax}
            onChange={(e) => setAgeMax(e.target.value)}
            placeholder="Max."
            aria-label="Edad máxima"
          />
        </div>
      </section>

      <section className="space-y-3">
        <Label>País de origen</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value=""
            onValueChange={(v) => {
              if (!v) return;
              if (countries.includes(v)) return;
              setCountries((prev) => [...prev, v]);
            }}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Sumar un país" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_OPTIONS.filter((c) => !countries.includes(c)).map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {countries.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {countries.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() =>
                  setCountries((prev) => prev.filter((p) => p !== c))
                }
                className="inline-flex items-center gap-1 rounded-full border border-foreground bg-foreground px-3 py-1.5 text-sm text-background"
                aria-label={`Quitar ${c}`}
              >
                {c}
                <span aria-hidden>×</span>
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <Label>Ocupación</Label>
        <ChipToggleRow
          values={OCCUPATION_VALUES}
          selected={occupations}
          labels={SIGNAL_OCCUPATION_LABELS}
          onToggle={(v) => setOccupations((prev) => toggle(prev, v))}
          ariaLabel="Ocupación"
        />
      </section>

      <section className="space-y-3">
        <Label>Idiomas</Label>
        <ChipToggleRow
          values={LANGUAGE_VALUES}
          selected={languages}
          labels={SIGNAL_LANGUAGE_LABELS}
          onToggle={(v) => setLanguages((prev) => toggle(prev, v))}
          ariaLabel="Idiomas"
        />
      </section>

      <section className="space-y-3">
        <Label>¿Quién se muda?</Label>
        <ChipToggleRow
          values={MOVING_WITH_VALUES}
          selected={movingWith}
          labels={SIGNAL_MOVING_WITH_LABELS}
          onToggle={(v) => setMovingWith((prev) => toggle(prev, v))}
          ariaLabel="¿Quién se muda?"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Limpieza (1-10)</Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              max={10}
              value={cleanlinessMin}
              onChange={(e) => setCleanlinessMin(e.target.value)}
              placeholder="Min."
              aria-label="Limpieza mínima"
            />
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              max={10}
              value={cleanlinessMax}
              onChange={(e) => setCleanlinessMax(e.target.value)}
              placeholder="Max."
              aria-label="Limpieza máxima"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Orden (1-10)</Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              max={10}
              value={orderMin}
              onChange={(e) => setOrderMin(e.target.value)}
              placeholder="Min."
              aria-label="Orden mínimo"
            />
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              max={10}
              value={orderMax}
              onChange={(e) => setOrderMax(e.target.value)}
              placeholder="Max."
              aria-label="Orden máximo"
            />
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <Label>Estancias</Label>
        <p className="text-xs text-muted-foreground">
          Cuando definimos el filtro de fechas, mostramos estos largos como
          aproximación.
        </p>
        <ChipToggleRow
          values={FLEX_STAY_VALUES}
          selected={flexStayLengths}
          labels={SIGNAL_FLEX_STAY_LABELS}
          onToggle={(v) => setFlexStayLengths((prev) => toggle(prev, v))}
          ariaLabel="Estancias preferidas"
        />
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={includeAsap}
            onCheckedChange={(v) => setIncludeAsap(v === true)}
          />
          <span>Incluir señales urgentes</span>
        </label>
      </section>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm font-medium text-foreground" role="status">
          Filtro guardado.
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
