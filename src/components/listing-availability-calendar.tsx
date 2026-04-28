"use client";

import { useMemo, useState } from "react";
import { addDays } from "date-fns";
import { BookingStatus } from "@/generated/prisma/enums";
import { createAvailabilityBlock } from "@/app/actions/blocks";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDateUTC } from "@/lib/format";

type Block = {
  id: string;
  startDate: Date;
  endDate: Date;
  reason?: string | null;
};

type Booking = {
  id: string;
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
};

function toUTCNoonDateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0));
}

function dayInRange(day: Date, start: Date, end: Date): boolean {
  // Ranges are stored as [start, end) date-only at noon UTC.
  // DayPicker gives local dates; normalize to UTC noon date-only.
  const x = toUTCNoonDateOnly(day);
  return start.getTime() <= x.getTime() && x.getTime() < end.getTime();
}

export function ListingAvailabilityCalendar({
  listingId,
  blocks,
  bookings,
}: {
  listingId: string;
  blocks: Block[];
  bookings: Booking[];
}) {
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const confirmed = useMemo(
    () => bookings.filter((b) => b.status === BookingStatus.CONFIRMED),
    [bookings],
  );
  const pending = useMemo(
    () => bookings.filter((b) => b.status === BookingStatus.PENDING),
    [bookings],
  );

  const modifiers = useMemo(() => {
    return {
      blocked: (d: Date) => blocks.some((b) => dayInRange(d, b.startDate, b.endDate)),
      confirmed: (d: Date) =>
        confirmed.some((b) => dayInRange(d, b.startDate, b.endDate)),
      pending: (d: Date) => pending.some((b) => dayInRange(d, b.startDate, b.endDate)),
    };
  }, [blocks, confirmed, pending]);

  const modifiersClassNames = useMemo(() => {
    return {
      blocked: "bg-muted/70 text-foreground",
      confirmed: "bg-primary text-primary-foreground",
      pending:
        "bg-amber-500/25 text-foreground dark:bg-amber-400/20",
    };
  }, []);

  const canBlock = Boolean(range.from);

  async function blockSelected() {
    if (!range.from) return;
    setLoading(true);
    setErr(null);
    const from = toUTCNoonDateOnly(range.from);
    const to = toUTCNoonDateOnly(range.to ?? range.from);
    const endExclusive = addDays(to, 1);

    const res = await createAvailabilityBlock({
      listingId,
      startDate: formatDateUTC(from),
      endDate: formatDateUTC(endExclusive),
      reason: null,
    });
    setLoading(false);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    // We rely on the parent server component refresh after router.refresh() in the old form,
    // but here we keep it minimal—user can refresh or we can wire router.refresh later.
    setRange({});
    setErr(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">Calendario de disponibilidad</p>
          <p className="text-xs text-muted-foreground">
            Seleccioná fechas para bloquearlas (uso propio / mantenimiento).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            disabled={loading || !canBlock}
            onClick={blockSelected}
          >
            {loading ? "…" : "Bloquear selección"}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background shadow-sm">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={range as any}
          onSelect={(next) => setRange((next as any) ?? {})}
          modifiers={modifiers as any}
          modifiersClassNames={modifiersClassNames as any}
        />
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-primary" /> Confirmada
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-amber-500/25 ring-1 ring-amber-500/30" />{" "}
          Pendiente
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-muted/70 ring-1 ring-border" />{" "}
          Cierre
        </span>
      </div>

      {err ? (
        <p className="text-xs text-destructive" role="alert">
          {err}
        </p>
      ) : null}
    </div>
  );
}

