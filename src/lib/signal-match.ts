import type { Prisma } from "@/generated/prisma/client";

type SignalForMatch = Prisma.SignalGetPayload<true>;
type FilterForMatch = Prisma.BuscarHuespedFilterGetPayload<true>;

function intersect<T>(a: readonly T[], b: readonly T[]): boolean {
  if (a.length === 0 || b.length === 0) return false;
  const set = new Set(a);
  return b.some((x) => set.has(x));
}

function inRange(value: number | null, min: number | null, max: number | null): boolean {
  if (min !== null && value === null) return false;
  if (max !== null && value === null) return false;
  if (min !== null && value !== null && value < min) return false;
  if (max !== null && value !== null && value > max) return false;
  return true;
}

/**
 * True iff the Señal matches every populated criterion in the host's filter.
 * Empty arrays / `null` ranges mean "no constraint" — they always match.
 *
 * URGENT señales (`asapUrgent`) are filtered out when the host has explicitly
 * opted out via `includeAsap = false`.
 */
export function matchesBuscarHuespedFilter(
  signal: SignalForMatch,
  filter: FilterForMatch,
): boolean {
  if (!filter.enabled) return false;

  if (signal.asapUrgent && !filter.includeAsap) return false;

  if (filter.genders.length > 0) {
    if (!signal.gender || !filter.genders.includes(signal.gender)) return false;
  }
  if (filter.occupations.length > 0) {
    if (!signal.occupation || !filter.occupations.includes(signal.occupation)) {
      return false;
    }
  }
  if (filter.movingWith.length > 0) {
    if (!signal.movingWith || !filter.movingWith.includes(signal.movingWith)) {
      return false;
    }
  }
  if (filter.languages.length > 0) {
    if (!intersect(signal.languages, filter.languages)) return false;
  }
  if (filter.countriesOfOrigin.length > 0) {
    if (
      !signal.countryOfOrigin ||
      !filter.countriesOfOrigin.includes(signal.countryOfOrigin)
    ) {
      return false;
    }
  }
  if (!inRange(signal.age, filter.ageMin, filter.ageMax)) return false;
  if (
    !inRange(
      signal.cleanlinessImportance,
      filter.cleanlinessMin,
      filter.cleanlinessMax,
    )
  ) {
    return false;
  }
  if (!inRange(signal.orderImportance, filter.orderMin, filter.orderMax)) {
    return false;
  }

  // flexStayLengths (if set) is a soft preference — must overlap with the
  // signal's chosen flex stay lengths, only when the signal is in flex mode.
  if (filter.flexStayLengths.length > 0 && signal.dateMode === "flex") {
    if (!intersect(signal.flexStayLengths, filter.flexStayLengths)) {
      return false;
    }
  }

  return true;
}

/**
 * Returns all hosts (their `BuscarHuespedFilter`) whose criteria match a
 * specific Señal. Used by the matching cron to fan out a freshly-published
 * Señal into per-host SignalMatch rows.
 */
export async function findHostFiltersForSignal(
  prisma: Prisma.TransactionClient,
  signal: SignalForMatch,
): Promise<FilterForMatch[]> {
  const candidates = await prisma.buscarHuespedFilter.findMany({
    where: {
      enabled: true,
      // Don't notify the Señal author about their own señal.
      NOT: { userId: signal.userId },
    },
  });
  return candidates.filter((f) => matchesBuscarHuespedFilter(signal, f));
}
