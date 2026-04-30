"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { BarcelonaZonePicker } from "@/components/barcelona-zone-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseDateOnly } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { PublicListingSort } from "@/lib/listing-queries";
import { addMonths } from "date-fns";

type PanelProps = {
  defaultCity: string;
  defaultCountry: string;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultFlexDays?: string;
  defaultZones?: string[];
  defaultBedSize?: string;
  defaultWindowType?: string;
  defaultRoomSizeSqm?: string;
  defaultFurnished?: string;
  defaultApartmentRooms?: string;
  defaultApartmentBaths?: string;
  defaultApartmentSizeSqm?: string;
  defaultWifi?: string;
  sort: PublicListingSort;
};

type DateMode = "exact" | "flex";
type FlexStay = "weekend" | "week" | "month";

function formatDateOnlyUTC(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function filterTriggerTitle(base: string, meta?: string): React.ReactNode {
  if (!meta) return base;
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      <span>{base}</span>
      <span className="text-muted-foreground font-normal">{meta}</span>
    </span>
  );
}

function toUTCNoonDateOnly(d: Date): Date {
  // react-day-picker returns local Date objects; normalize to date-only at noon UTC.
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0));
}

function startOfUTCMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 12, 0, 0));
}

function getMonthLabel(d: Date) {
  return d.toLocaleString("es-ES", { month: "short", timeZone: "UTC" });
}

function getYearLabel(d: Date) {
  return String(d.getUTCFullYear());
}

function setUTCMonthYear(base: Date, monthIndex: number, year: number) {
  return new Date(Date.UTC(year, monthIndex, 1, 12, 0, 0));
}

function CalendarHeader({
  month,
  onPrev,
  onNext,
  onMonthSelect,
  onYearSelect,
}: {
  month: Date;
  onPrev: () => void;
  onNext: () => void;
  onMonthSelect: (monthIndex: number) => void;
  onYearSelect: (year: number) => void;
}) {
  const monthIndex = month.getUTCMonth();
  const year = month.getUTCFullYear();
  const years = [year - 1, year, year + 1, year + 2];

  return (
    <div className="flex items-center justify-between px-3 pt-3">
      <Button variant="ghost" size="icon-xs" type="button" onClick={onPrev}>
        <ChevronLeft className="size-4 text-foreground" aria-hidden />
      </Button>

      <div className="flex items-center gap-2">
        <Select
          value={String(monthIndex)}
          onValueChange={(v) => onMonthSelect(Number(v))}
        >
          <SelectTrigger className="h-8 w-[4.5rem] justify-between rounded-md border border-border bg-background px-2 text-sm shadow-xs">
            <span className="flex flex-1 text-left">{getMonthLabel(month)}</span>
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }).map((_, i) => (
              <SelectItem key={i} value={String(i)}>
                {new Date(Date.UTC(2026, i, 1, 12, 0, 0)).toLocaleString("es-ES", {
                  month: "short",
                  timeZone: "UTC",
                })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(year)} onValueChange={(v) => onYearSelect(Number(v))}>
          <SelectTrigger className="h-8 w-[5.25rem] justify-between rounded-md border border-border bg-background px-2 text-sm shadow-xs">
            <SelectValue placeholder={getYearLabel(month)} />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="ghost" size="icon-xs" type="button" onClick={onNext}>
        <ChevronRight className="size-4 text-foreground" aria-hidden />
      </Button>
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Collapsible className="bg-card overflow-hidden rounded-lg border border-foreground">
      <CollapsibleTrigger className="bg-card hover:bg-muted/40 flex h-[68px] w-full items-center gap-4 p-4 text-left text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
        <span className="flex-1">{title}</span>
        <span
          className="bg-card flex size-9 shrink-0 items-center justify-center rounded-full ring-1 ring-border"
          aria-hidden
        >
          <Pencil className="size-4" />
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-3 border-t border-border px-4 py-4">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ListingsFilterPanel({
  defaultCity,
  defaultCountry,
  defaultCheckIn,
  defaultCheckOut,
  defaultFlexDays,
  defaultZones = [],
  defaultBedSize,
  defaultWindowType,
  defaultRoomSizeSqm,
  defaultFurnished,
  defaultApartmentRooms,
  defaultApartmentBaths,
  defaultApartmentSizeSqm,
  defaultWifi,
  sort,
}: PanelProps) {
  const [zones, setZones] = useState<string[]>(() => defaultZones);
  const [dateMode, setDateMode] = useState<DateMode>("exact");
  const [exactCheckIn, setExactCheckIn] = useState<Date | undefined>(() =>
    defaultCheckIn ? parseDateOnly(defaultCheckIn) : undefined,
  );
  const [exactCheckOut, setExactCheckOut] = useState<Date | undefined>(() =>
    defaultCheckOut ? parseDateOnly(defaultCheckOut) : undefined,
  );
  const [exactFlexDays, setExactFlexDays] = useState<string>(() => {
    const raw = defaultFlexDays?.trim();
    if (!raw) return "0";
    const allowed = new Set(["0", "1", "2", "3", "7", "14"]);
    return allowed.has(raw) ? raw : "0";
  });

  const [checkInMonth, setCheckInMonth] = useState<Date>(() => {
    const base = defaultCheckIn ? parseDateOnly(defaultCheckIn) : new Date();
    return startOfUTCMonth(base);
  });
  const [checkOutMonth, setCheckOutMonth] = useState<Date>(() => {
    const base = defaultCheckOut
      ? parseDateOnly(defaultCheckOut)
      : defaultCheckIn
        ? addMonths(parseDateOnly(defaultCheckIn), 1)
        : addMonths(new Date(), 1);
    return startOfUTCMonth(base);
  });

  const [flexStays, setFlexStays] = useState<FlexStay[]>(["weekend"]);
  const [flexMonthLimit, setFlexMonthLimit] = useState(4);
  const [flexMonths, setFlexMonths] = useState<string[]>(() => {
    // Preselect the next 2 months if the user already had a check-in month.
    if (!defaultCheckIn) return [];
    const d = parseDateOnly(defaultCheckIn);
    const ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    return [ym];
  });

  const [bedSize, setBedSize] = useState(defaultBedSize ?? "");
  const [windowType, setWindowType] = useState(defaultWindowType ?? "");
  const [roomSizeSqm, setRoomSizeSqm] = useState(defaultRoomSizeSqm ?? "");
  const [furnished, setFurnished] = useState(defaultFurnished ?? "");
  const [apartmentRooms, setApartmentRooms] = useState(defaultApartmentRooms ?? "");
  const [apartmentBaths, setApartmentBaths] = useState(defaultApartmentBaths ?? "");
  const [apartmentSizeSqm, setApartmentSizeSqm] = useState(
    defaultApartmentSizeSqm ?? "",
  );
  const [wifi, setWifi] = useState(defaultWifi ?? "");

  function formatMonthDay(d: Date) {
    const month = d
      .toLocaleString("es-ES", { month: "short", timeZone: "UTC" })
      .replace(".", "");
    const capMonth = month ? month[0]!.toUpperCase() + month.slice(1) : month;
    return `${capMonth} ${d.getUTCDate()}`;
  }

  const whereTitle = filterTriggerTitle(
    "Dónde",
    zones.length > 0
      ? `(${zones.length} ${zones.length === 1 ? "barrio" : "barrios"})`
      : undefined,
  );

  const whenTitle: React.ReactNode = (() => {
    if (dateMode === "exact") {
      if (exactCheckIn && exactCheckOut && exactCheckIn < exactCheckOut) {
        const flexLabel =
          exactFlexDays && exactFlexDays !== "0"
            ? `± ${exactFlexDays} días`
            : "fechas exactas";
        return filterTriggerTitle(
          "Cuándo",
          `(${formatMonthDay(exactCheckIn)} - ${formatMonthDay(exactCheckOut)}, ${flexLabel})`,
        );
      }
      return "Cuándo";
    }

    const stayLabels = [
      flexStays.includes("weekend") ? "fin de semana" : null,
      flexStays.includes("week") ? "semana" : null,
      flexStays.includes("month") ? "mes" : null,
    ].filter(Boolean) as string[];

    const parts: string[] = [];
    if (stayLabels.length) parts.push(stayLabels.join(" / "));
    if (flexMonths.length) {
      parts.push(`${flexMonths.length} ${flexMonths.length === 1 ? "mes" : "meses"}`);
    }
    return parts.length
      ? filterTriggerTitle("Cuándo", `(${parts.join(", ")}, flexible)`)
      : "Cuándo";
  })();

  const characteristicsSelectedCount =
    (bedSize ? 1 : 0) +
    (windowType ? 1 : 0) +
    (roomSizeSqm ? 1 : 0) +
    (furnished ? 1 : 0) +
    (apartmentRooms ? 1 : 0) +
    (apartmentBaths ? 1 : 0) +
    (apartmentSizeSqm ? 1 : 0) +
    (wifi ? 1 : 0);
  const characteristicsTitle = filterTriggerTitle(
    "Características",
    characteristicsSelectedCount > 0
      ? `(${characteristicsSelectedCount} seleccionadas)`
      : undefined,
  );

  const rangeModifiers = useMemo(() => {
    const start = exactCheckIn;
    const end = exactCheckOut;
    if (!start || !end || !(start < end)) return undefined;

    return {
      range_middle: (day: Date) => day > start && day < end,
    };
  }, [exactCheckIn, exactCheckOut]);

  const rangeModifierClassNames = useMemo(() => {
    return {
      range_middle: "bg-muted/60 text-foreground",
    };
  }, []);

  const monthOptions = useMemo(() => {
    const base = new Date();
    const total = Math.max(12, flexMonthLimit);
    const items: { ym: string; label: string; year: string; month: string }[] =
      [];

    for (let i = 0; i < total; i++) {
      const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + i, 1, 12));
      const y = String(d.getUTCFullYear());
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const ym = `${y}-${m}`;
      const monthShort = d.toLocaleString("es-ES", { month: "short", timeZone: "UTC" });
      items.push({
        ym,
        label: `${monthShort} ${y}`,
        year: y,
        month: monthShort,
      });
    }
    return items;
  }, [flexMonthLimit]);

  function toggleFlexStay(value: FlexStay) {
    setFlexStays((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function toggleFlexMonth(ym: string) {
    setFlexMonths((prev) =>
      prev.includes(ym) ? prev.filter((v) => v !== ym) : [...prev, ym],
    );
  }

  const didMount = useRef(false);
  const previewTimer = useRef<number | null>(null);
  const flexStaysKey = useMemo(() => flexStays.join(","), [flexStays]);
  const flexMonthsKey = useMemo(() => flexMonths.join(","), [flexMonths]);

  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const zonesKey = useMemo(() => zones.join(","), [zones]);

  const previewQueryString = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("sort", sort);
    sp.set("city", defaultCity);
    sp.set("country", defaultCountry);
    sp.set("dateMode", dateMode);

    if (zonesKey) sp.set("zones", zonesKey);

    if (dateMode === "exact") {
      if (exactCheckIn) sp.set("checkIn", formatDateOnlyUTC(exactCheckIn));
      if (exactCheckOut) sp.set("checkOut", formatDateOnlyUTC(exactCheckOut));
      if (exactFlexDays && exactFlexDays !== "0") sp.set("flexDays", exactFlexDays);
    } else {
      if (flexStays.length) sp.set("flexStay", flexStays.join(","));
      if (flexMonths.length) sp.set("flexMonths", flexMonths.join(","));
    }

    if (bedSize) sp.set("bedSize", bedSize);
    if (windowType) sp.set("windowType", windowType);
    if (roomSizeSqm) sp.set("roomSizeSqm", roomSizeSqm);
    if (furnished) sp.set("furnished", furnished);
    if (apartmentRooms) sp.set("apartmentRooms", apartmentRooms);
    if (apartmentBaths) sp.set("apartmentBaths", apartmentBaths);
    if (apartmentSizeSqm) sp.set("apartmentSizeSqm", apartmentSizeSqm);
    if (wifi) sp.set("wifi", wifi);

    return sp.toString();
  }, [
    sort,
    defaultCity,
    defaultCountry,
    dateMode,
    zonesKey,
    exactCheckIn,
    exactCheckOut,
    exactFlexDays,
    bedSize,
    windowType,
    roomSizeSqm,
    furnished,
    apartmentRooms,
    apartmentBaths,
    apartmentSizeSqm,
    wifi,
    flexStays,
    flexMonths,
  ]);

  const resetAllFilters = () => {
    setZones([]);
    setDateMode("exact");
    setExactCheckIn(undefined);
    setExactCheckOut(undefined);
    setExactFlexDays("0");
    setFlexStays(["weekend"]);
    setFlexMonthLimit(4);
    setFlexMonths([]);
    setBedSize("");
    setWindowType("");
    setRoomSizeSqm("");
    setFurnished("");
    setApartmentRooms("");
    setApartmentBaths("");
    setApartmentSizeSqm("");
    setWifi("");
  };

  const resetAndApplyFilters = () => {
    resetAllFilters();
    // Submit after state updates propagate to hidden inputs.
    window.setTimeout(() => applyFilters(), 0);
  };

  const applyFilters = () => {
    const form = document.getElementById("listings-filter-form") as
      | HTMLFormElement
      | null;
    if (!form) return;
    if (typeof form.requestSubmit === "function") form.requestSubmit();
    else form.submit();
  };

  useEffect(() => {
    // First render: run a preview fetch too.
    if (!didMount.current) didMount.current = true;

    // Avoid preview fetch while user is still picking a range (exact mode).
    if (
      dateMode === "exact" &&
      ((exactCheckIn && !exactCheckOut) || (!exactCheckIn && exactCheckOut))
    ) {
      return;
    }

    if (previewTimer.current != null) window.clearTimeout(previewTimer.current);
    previewTimer.current = window.setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const res = await fetch(`/api/listings/count?${previewQueryString}`, {
          method: "GET",
          headers: { "accept": "application/json" },
        });
        if (!res.ok) throw new Error("count fetch failed");
        const json = (await res.json()) as { count?: number };
        setPreviewCount(typeof json.count === "number" ? json.count : null);
      } catch {
        setPreviewCount(null);
      } finally {
        setPreviewLoading(false);
      }
    }, 250);
  }, [
    dateMode,
    exactCheckIn,
    exactCheckOut,
    exactFlexDays,
    flexStaysKey,
    flexMonthsKey,
    zonesKey,
    bedSize,
    windowType,
    roomSizeSqm,
    furnished,
    apartmentRooms,
    apartmentBaths,
    apartmentSizeSqm,
    wifi,
    previewQueryString,
  ]);

  return (
    <Card className="bg-card text-card-foreground flex min-h-0 flex-1 flex-col gap-0 overflow-hidden rounded-md py-0">
      <form
        id="listings-filter-form"
        action="/listings"
        method="get"
        className="flex min-h-0 flex-1 flex-col"
      >
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="city" value={defaultCity} readOnly />
        <input type="hidden" name="country" value={defaultCountry} readOnly />
        <input type="hidden" name="dateMode" value={dateMode} readOnly />
        <input
          type="hidden"
          name="checkIn"
          value={
            dateMode === "exact" && exactCheckIn
              ? formatDateOnlyUTC(exactCheckIn)
              : ""
          }
          readOnly
        />
        <input
          type="hidden"
          name="checkOut"
          value={
            dateMode === "exact" && exactCheckOut
              ? formatDateOnlyUTC(exactCheckOut)
              : ""
          }
          readOnly
        />
        <input
          type="hidden"
          name="flexDays"
          value={dateMode === "exact" ? exactFlexDays : ""}
          readOnly
        />
        <input
          type="hidden"
          name="flexStay"
          value={dateMode === "flex" ? flexStays.join(",") : ""}
          readOnly
        />
        <input
          type="hidden"
          name="flexMonths"
          value={dateMode === "flex" ? flexMonths.join(",") : ""}
          readOnly
        />
        <input type="hidden" name="bedSize" value={bedSize} readOnly />
        <input type="hidden" name="windowType" value={windowType} readOnly />
        <input type="hidden" name="roomSizeSqm" value={roomSizeSqm} readOnly />
        <input type="hidden" name="furnished" value={furnished} readOnly />
        <input type="hidden" name="apartmentRooms" value={apartmentRooms} readOnly />
        <input type="hidden" name="apartmentBaths" value={apartmentBaths} readOnly />
        <input
          type="hidden"
          name="apartmentSizeSqm"
          value={apartmentSizeSqm}
          readOnly
        />
        <input type="hidden" name="wifi" value={wifi} readOnly />

        <CardHeader className="rounded-t-md border-0 px-6 pt-6 pb-7">
          <Settings2 className="size-6" aria-hidden />
          <CardTitle className="text-base leading-6 font-medium">
            Filtrá las habitaciones disponibles
          </CardTitle>
          <CardDescription>
            Usá los filtros para encontrar tu habitación ideal
          </CardDescription>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col px-6 pb-0">
          <div className="-mx-6 min-h-0 flex-1 overflow-y-auto px-6">
            <div className="flex flex-col gap-2 pb-6">
            <FilterSection title={whereTitle}>
              <BarcelonaZonePicker
                formId="listings-filter-form"
                defaultZones={defaultZones}
                zones={zones}
                onChangeZones={setZones}
                autoSubmit={false}
              />
            </FilterSection>

            <FilterSection title={whenTitle}>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-base leading-6 font-medium text-center">
                    Elegí tus fechas
                  </p>
                  <p className="text-sm text-muted-foreground text-center">
                    Podés elegir fechas exactas o buscar de forma flexible
                  </p>
                </div>

                <Tabs
                  value={dateMode}
                  onValueChange={(v) => setDateMode(v as DateMode)}
                  className="items-center"
                >
                  <TabsList className="w-40">
                    <TabsTrigger
                      value="exact"
                      className="bg-transparent text-foreground hover:text-foreground data-active:!bg-black/50 data-active:!text-foreground data-active:border data-active:!border-white/15 data-active:shadow-xs"
                    >
                      Fechas
                    </TabsTrigger>
                    <TabsTrigger
                      value="flex"
                      className="bg-transparent text-foreground/80 hover:text-foreground data-active:!bg-black/50 data-active:!text-foreground data-active:border data-active:!border-white/15 data-active:shadow-xs"
                    >
                      Flexible
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="exact" className="w-full">
                    <div className="mt-8 space-y-4">
                      <Select
                        value={exactFlexDays}
                        onValueChange={(v) => setExactFlexDays(v ?? "0")}
                      >
                        <SelectTrigger className="w-full">
                          <span className="flex flex-1 text-left">
                            {exactFlexDays === "0"
                              ? "Fechas exactas"
                              : `± ${exactFlexDays} días`}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Fechas exactas</SelectItem>
                          <SelectItem value="14">± 14 días</SelectItem>
                          <SelectItem value="7">± 7 días</SelectItem>
                          <SelectItem value="3">± 3 días</SelectItem>
                          <SelectItem value="2">± 2 días</SelectItem>
                          <SelectItem value="1">± 1 día</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="space-y-3">
                        <div className="bg-background rounded-lg border border-border shadow-sm">
                          <CalendarHeader
                            month={checkInMonth}
                            onPrev={() => {
                              const prev = addMonths(checkInMonth, -1);
                              setCheckInMonth(startOfUTCMonth(prev));
                            }}
                            onNext={() => {
                              const next = addMonths(checkInMonth, 1);
                              setCheckInMonth(startOfUTCMonth(next));
                              setCheckOutMonth((prev) => {
                                const n =
                                  prev.getTime() <= next.getTime()
                                    ? addMonths(next, 1)
                                    : prev;
                                return startOfUTCMonth(n);
                              });
                            }}
                            onMonthSelect={(mIdx) => {
                              const next = setUTCMonthYear(
                                checkInMonth,
                                mIdx,
                                checkInMonth.getUTCFullYear(),
                              );
                              setCheckInMonth(next);
                              setCheckOutMonth((prev) => {
                                const n =
                                  prev.getTime() <= next.getTime()
                                    ? addMonths(next, 1)
                                    : prev;
                                return startOfUTCMonth(n);
                              });
                            }}
                            onYearSelect={(y) => {
                              const next = setUTCMonthYear(
                                checkInMonth,
                                checkInMonth.getUTCMonth(),
                                y,
                              );
                              setCheckInMonth(next);
                              setCheckOutMonth((prev) => {
                                const n =
                                  prev.getTime() <= next.getTime()
                                    ? addMonths(next, 1)
                                    : prev;
                                return startOfUTCMonth(n);
                              });
                            }}
                          />
                          <Calendar
                            mode="single"
                            month={checkInMonth}
                            onMonthChange={(m) => {
                              setCheckInMonth(startOfUTCMonth(m));
                              setCheckOutMonth((prev) => {
                                const next =
                                  prev.getTime() <= m.getTime()
                                    ? addMonths(m, 1)
                                    : prev;
                                return startOfUTCMonth(next);
                              });
                            }}
                            selected={exactCheckIn}
                            onSelect={(d) => {
                              if (!d) return;
                              const next = toUTCNoonDateOnly(d);
                              setExactCheckIn(next);
                              if (exactCheckOut && !(next < exactCheckOut)) {
                                setExactCheckOut(undefined);
                              }
                            }}
                            modifiers={rangeModifiers}
                            modifiersClassNames={rangeModifierClassNames}
                            classNames={{
                              month_caption: "hidden",
                              nav: "hidden",
                            }}
                          />
                        </div>
                        <div className="bg-background rounded-lg border border-border shadow-sm">
                          <CalendarHeader
                            month={checkOutMonth}
                            onPrev={() =>
                              setCheckOutMonth(
                                startOfUTCMonth(addMonths(checkOutMonth, -1)),
                              )
                            }
                            onNext={() =>
                              setCheckOutMonth(
                                startOfUTCMonth(addMonths(checkOutMonth, 1)),
                              )
                            }
                            onMonthSelect={(mIdx) =>
                              setCheckOutMonth(
                                setUTCMonthYear(
                                  checkOutMonth,
                                  mIdx,
                                  checkOutMonth.getUTCFullYear(),
                                ),
                              )
                            }
                            onYearSelect={(y) =>
                              setCheckOutMonth(
                                setUTCMonthYear(
                                  checkOutMonth,
                                  checkOutMonth.getUTCMonth(),
                                  y,
                                ),
                              )
                            }
                          />
                          <Calendar
                            mode="single"
                            month={checkOutMonth}
                            onMonthChange={(m) =>
                              setCheckOutMonth(startOfUTCMonth(m))
                            }
                            selected={exactCheckOut}
                            onSelect={(d) => {
                              if (!d) return;
                              const next = toUTCNoonDateOnly(d);
                              if (exactCheckIn && !(exactCheckIn < next)) return;
                              setExactCheckOut(next);
                            }}
                            disabled={
                              exactCheckIn ? { before: exactCheckIn } : undefined
                            }
                            modifiers={rangeModifiers}
                            modifiersClassNames={rangeModifierClassNames}
                            classNames={{
                              month_caption: "hidden",
                              nav: "hidden",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="flex" className="w-full">
                    <div className="space-y-6 pt-2">
                      <div className="space-y-3">
                        <p className="text-base leading-6 font-semibold text-center">
                          Por cuánto tiempo te querés quedar?
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleFlexStay("weekend")}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                              flexStays.includes("weekend")
                                ? "bg-accent text-accent-foreground border-accent-foreground/20"
                                : "bg-background hover:bg-muted border-border",
                            )}
                          >
                            {flexStays.includes("weekend") ? (
                              <Check className="size-3.5" aria-hidden />
                            ) : null}
                            Fin de semana
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleFlexStay("week")}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                              flexStays.includes("week")
                                ? "bg-accent text-accent-foreground border-accent-foreground/20"
                                : "bg-background hover:bg-muted border-border",
                            )}
                          >
                            Semana
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleFlexStay("month")}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                              flexStays.includes("month")
                                ? "bg-accent text-accent-foreground border-accent-foreground/20"
                                : "bg-background hover:bg-muted border-border",
                            )}
                          >
                            Mes
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-base leading-6 font-semibold text-center">
                          Durante
                        </p>
                        <div className="grid grid-cols-4 gap-3">
                          {monthOptions.slice(0, flexMonthLimit).map((m) => {
                            const selected = flexMonths.includes(m.ym);
                            const Icon = selected ? CalendarCheck : CalendarDays;
                            return (
                              <button
                                key={m.ym}
                                type="button"
                                onClick={() => toggleFlexMonth(m.ym)}
                                className={cn(
                                  "rounded-md border p-4 text-center shadow-sm transition-colors",
                                  selected
                                    ? "bg-accent text-accent-foreground border-accent-foreground/20"
                                    : "bg-background hover:bg-muted border-border",
                                )}
                              >
                                <Icon className="mx-auto mb-3 size-8" aria-hidden />
                                <div className="text-sm font-medium capitalize">
                                  {m.month}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {m.year}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex justify-center">
                          <Button
                            type="button"
                            size="icon"
                            className="size-7 rounded-full"
                            onClick={() =>
                              setFlexMonthLimit((n) => Math.min(n + 4, monthOptions.length))
                            }
                            disabled={flexMonthLimit >= monthOptions.length}
                            aria-label="Cargar más meses"
                          >
                            <ArrowDown className="size-4" aria-hidden />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </FilterSection>

            <FilterSection title="Precio">
              <p className="text-sm text-muted-foreground">
                Pronto vas a poder filtrar por rango de precio o tipo de tarifa. Por
                ahora revisá la descripción en cada habitación o contactá al anfitrión.
              </p>
            </FilterSection>

            <FilterSection title={characteristicsTitle}>
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Características de la habitación</p>

                  <div className="space-y-2">
                    <Label>Tamaño de cama</Label>
                    <Select value={bedSize} onValueChange={(v) => setBedSize(v ?? "")}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Cualquiera" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Cualquiera</SelectItem>
                        <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                        <SelectItem value="DOBLE">Doble</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Ventana</Label>
                    <Select
                      value={windowType}
                      onValueChange={(v) => setWindowType(v ?? "")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Cualquiera" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Cualquiera</SelectItem>
                        <SelectItem value="CALLE">Ventana a la calle</SelectItem>
                        <SelectItem value="CORAZON_DE_MANZANA">
                          Ventana a corazón de manzana
                        </SelectItem>
                        <SelectItem value="POZO_DE_AIRE">Ventana a pozo de aire</SelectItem>
                        <SelectItem value="SIN_VENTANA">Sin ventana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tamaño aprox. de la habitación (m²)</Label>
                    <Select
                      value={roomSizeSqm}
                      onValueChange={(v) => setRoomSizeSqm(v ?? "")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Cualquiera" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Cualquiera</SelectItem>
                        <SelectItem value="5">5 m²</SelectItem>
                        <SelectItem value="10">10 m²</SelectItem>
                        <SelectItem value="15">15 m²</SelectItem>
                        <SelectItem value="20">20 m²</SelectItem>
                        <SelectItem value="21">+20 m²</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Amueblada</Label>
                    <Select
                      value={furnished}
                      onValueChange={(v) => setFurnished(v ?? "")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Cualquiera" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Cualquiera</SelectItem>
                        <SelectItem value="yes">Sí</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Características del piso</p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="filter-apartment-rooms">
                        Número de habitaciones
                      </Label>
                      <Input
                        id="filter-apartment-rooms"
                        type="number"
                        min={1}
                        max={20}
                        step={1}
                        value={apartmentRooms}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setApartmentRooms(e.target.value)
                        }
                        placeholder="Cualquiera"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filter-apartment-baths">Número de baños</Label>
                      <Input
                        id="filter-apartment-baths"
                        type="number"
                        min={1}
                        max={20}
                        step={1}
                        value={apartmentBaths}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setApartmentBaths(e.target.value)
                        }
                        placeholder="Cualquiera"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tamaño aprox. del piso (m²)</Label>
                    <Select
                      value={apartmentSizeSqm}
                      onValueChange={(v) => setApartmentSizeSqm(v ?? "")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Cualquiera" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Cualquiera</SelectItem>
                        {Array.from({ length: 25 }).map((_, i) => {
                          const val = (i + 4) * 10;
                          return (
                            <SelectItem key={val} value={String(val)}>
                              {val} m²
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Wifi</Label>
                    <Select value={wifi} onValueChange={(v) => setWifi(v ?? "")}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Cualquiera" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Cualquiera</SelectItem>
                        <SelectItem value="yes">Sí</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </FilterSection>
            </div>
          </div>
        </CardContent>

        <CardFooter className="mt-auto border-t border-foreground/10 px-6 py-4">
          <div className="flex w-full items-center justify-between gap-3">
            <Button
              type="button"
              variant="link"
              className="h-auto p-0"
              onClick={resetAndApplyFilters}
            >
              Borrar filtros
            </Button>

            <Button
              type="button"
              onClick={applyFilters}
              disabled={previewLoading}
              className="rounded-full"
            >
              {previewLoading
                ? "Calculando…"
                : `Mostrar ${previewCount ?? "—"} habitaciones`}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
