import type { Prisma } from "@/generated/prisma/client";
import { sendEmail } from "@/lib/email";

type SignalForMatch = Prisma.SignalGetPayload<true>;
type FilterForMatch = Prisma.BuscarHuespedFilterGetPayload<true>;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

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
 * specific Señal.
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

async function createHostSignalMatch(
  prisma: Prisma.TransactionClient,
  signal: SignalForMatch,
  filter: FilterForMatch,
): Promise<{ created: boolean; emailSent: boolean }> {
  const row = await prisma.signalMatch
    .create({
      data: { hostId: filter.userId, signalId: signal.id },
      select: { id: true },
    })
    .catch(() => null);
  if (!row) return { created: false, emailSent: false };

  let emailSent = false;
  if (filter.notifyByEmail) {
    const host = await prisma.user.findUnique({
      where: { id: filter.userId },
      select: { email: true },
    });
    const to = host?.email?.trim();
    if (to) {
      const url = `https://encontrate.es/signals/${signal.id}`;
      await sendEmail({
        to,
        subject: `Nueva señal que coincide con lo que estás buscando`,
        html: `
              <p><strong>${escapeHtml(signal.fullName)}</strong> publicó una señal que matchea con tu filtro de "Buscar huésped".</p>
              <p><a href="${url}">Ver la señal</a></p>
            `,
      }).catch(() => {});
      emailSent = true;
    }
  }
  return { created: true, emailSent };
}

/**
 * Fan out `SignalMatch` rows (and optional emails) for one ACTIVE Señal against
 * all enabled host filters. Called on publish/activate and by the cron backup.
 */
export async function processHostSignalMatchesForSignal(
  prisma: Prisma.TransactionClient,
  signal: SignalForMatch,
): Promise<{ matchesCreated: number; emailsSent: number }> {
  if (signal.status !== "ACTIVE") {
    return { matchesCreated: 0, emailsSent: 0 };
  }

  const filters = await findHostFiltersForSignal(prisma, signal);
  let matchesCreated = 0;
  let emailsSent = 0;

  for (const filter of filters) {
    const result = await createHostSignalMatch(prisma, signal, filter);
    if (!result.created) continue;
    matchesCreated++;
    if (result.emailSent) emailsSent++;
  }

  return { matchesCreated, emailsSent };
}

/**
 * Back-scan all ACTIVE Señales when a host saves an enabled Buscar huésped
 * filter so Coincidencias populate without waiting for the cron.
 */
export async function processHostSignalMatchesForFilter(
  prisma: Prisma.TransactionClient,
  filter: FilterForMatch,
): Promise<{ matchesCreated: number; emailsSent: number }> {
  if (!filter.enabled) {
    return { matchesCreated: 0, emailsSent: 0 };
  }

  const signals = await prisma.signal.findMany({
    where: {
      status: "ACTIVE",
      NOT: { userId: filter.userId },
    },
  });

  let matchesCreated = 0;
  let emailsSent = 0;

  for (const signal of signals) {
    if (!matchesBuscarHuespedFilter(signal, filter)) continue;
    const result = await createHostSignalMatch(prisma, signal, filter);
    if (!result.created) continue;
    matchesCreated++;
    if (result.emailSent) emailsSent++;
  }

  return { matchesCreated, emailsSent };
}
