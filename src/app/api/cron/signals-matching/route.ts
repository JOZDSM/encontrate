import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { findHostFiltersForSignal } from "@/lib/signal-match";
import { findSignalsForNewListing } from "@/lib/listing-for-signal-match";

export const runtime = "nodejs";
// Vercel cron pings this with `Authorization: Bearer ${CRON_SECRET}`. We never
// want a stale matching pass cached, so always run fresh.
export const dynamic = "force-dynamic";

/** How far back the cron looks each run. Generous to absorb delays/skips. */
const LOOKBACK_HOURS = 36;

function isAuthorized(req: Request): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) {
    // No secret configured → only allow in dev. In production, require it.
    return process.env.NODE_ENV !== "production";
  }
  const header = req.headers.get("authorization") ?? "";
  return header === `Bearer ${expected}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** First pass: brand-new ACTIVE Señales → per-host SignalMatch + emails. */
async function runHostMatchPass(since: Date): Promise<{
  signalsScanned: number;
  matchesCreated: number;
  emailsSent: number;
}> {
  const newSignals = await prisma.signal.findMany({
    where: { status: "ACTIVE", updatedAt: { gte: since } },
    orderBy: { updatedAt: "asc" },
  });

  let matchesCreated = 0;
  let emailsSent = 0;
  for (const signal of newSignals) {
    const filters = await findHostFiltersForSignal(prisma, signal);
    for (const filter of filters) {
      const created = await prisma.signalMatch
        .create({
          data: { hostId: filter.userId, signalId: signal.id },
          select: { id: true },
        })
        .catch(() => null);
      if (!created) continue; // unique([hostId, signalId]) hit → skip duplicates
      matchesCreated++;

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
          emailsSent++;
        }
      }
    }
  }
  return { signalsScanned: newSignals.length, matchesCreated, emailsSent };
}

/** Second pass: brand-new Listings → per-Señal GuestListingMatch + emails. */
async function runGuestMatchPass(since: Date): Promise<{
  listingsScanned: number;
  matchesCreated: number;
  emailsSent: number;
}> {
  const newListings = await prisma.listing.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "asc" },
  });

  let matchesCreated = 0;
  let emailsSent = 0;
  for (const listing of newListings) {
    const signals = await findSignalsForNewListing(prisma, listing);
    for (const signal of signals) {
      const created = await prisma.guestListingMatch
        .create({
          data: { signalId: signal.id, listingId: listing.id },
          select: { id: true },
        })
        .catch(() => null);
      if (!created) continue; // unique([signalId, listingId]) hit → skip
      matchesCreated++;

      if (signal.listingAlertEmail) {
        const guest = await prisma.user.findUnique({
          where: { id: signal.userId },
          select: { email: true },
        });
        const to = guest?.email?.trim();
        if (to) {
          const url = `https://encontrate.es/listings/${listing.id}`;
          await sendEmail({
            to,
            subject: `Nueva habitación que coincide con tu señal`,
            html: `
              <p>Acabamos de detectar una habitación nueva que cumple con lo que pediste.</p>
              <p><strong>${escapeHtml(listing.title)}</strong> · ${escapeHtml(listing.neighborhood)}</p>
              <p><a href="${url}">Ver la habitación</a></p>
            `,
          }).catch(() => {});
          emailsSent++;
        }
      }
    }
  }
  return { listingsScanned: newListings.length, matchesCreated, emailsSent };
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000);

  const [hosts, guests] = await Promise.all([
    runHostMatchPass(since),
    runGuestMatchPass(since),
  ]);

  return NextResponse.json({
    ok: true,
    since: since.toISOString(),
    hostPass: hosts,
    guestPass: guests,
  });
}
