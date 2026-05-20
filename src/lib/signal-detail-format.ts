import { formatDateLongES } from "@/lib/format";
import { SIGNAL_FLEX_STAY_LABELS } from "@/lib/signal-labels";

/** Listings filter stores 21 for the “+20 m²” threshold. */
export const SIGNAL_ROOM_SIZE_PLUS_20_SENTINEL = 21;

export function joinSignalLabels(
  values: readonly string[],
  dict: Record<string, string>,
): string {
  return values.map((v) => dict[v] ?? v).join(" · ");
}

export function formatSignalRoomSizePreference(min: number): string {
  if (min === SIGNAL_ROOM_SIZE_PLUS_20_SENTINEL) return "+20 m²";
  return `≥ ${min} m²`;
}

function formatFlexMonthLong(ym: string): string {
  const [yearStr, monthStr] = ym.split("-");
  const year = Number(yearStr);
  const monthIdx = Number(monthStr) - 1;
  if (!Number.isFinite(year) || monthIdx < 0 || monthIdx > 11) return ym;
  const d = new Date(year, monthIdx, 1);
  const raw = d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export type SignalDatesFields = {
  dateMode: string | null;
  exactCheckIn: Date | null;
  exactCheckOut: Date | null;
  exactFlexDays: number | null;
  flexStayLengths: readonly string[];
  flexMonths: readonly string[];
};

export function formatSignalDatesSummary(
  signal: SignalDatesFields,
): string | null {
  if (signal.dateMode === "asap") return "Lo antes posible";
  if (
    signal.dateMode === "exact" &&
    signal.exactCheckIn &&
    signal.exactCheckOut
  ) {
    const flex =
      signal.exactFlexDays && signal.exactFlexDays > 0
        ? ` (± ${signal.exactFlexDays} días)`
        : "";
    return `${formatDateLongES(signal.exactCheckIn)} → ${formatDateLongES(signal.exactCheckOut)}${flex}`;
  }
  if (signal.dateMode === "flex") {
    const lengths =
      signal.flexStayLengths.length > 0
        ? joinSignalLabels(signal.flexStayLengths, SIGNAL_FLEX_STAY_LABELS)
        : null;
    const months =
      signal.flexMonths.length > 0
        ? signal.flexMonths.map(formatFlexMonthLong).join(" · ")
        : null;
    if (lengths && months) return `${lengths} | ${months}`;
    if (lengths) return lengths;
    if (months) return months;
    return "Flexible";
  }
  return null;
}

export function signalHasDatesData(signal: SignalDatesFields): boolean {
  return formatSignalDatesSummary(signal) !== null;
}
