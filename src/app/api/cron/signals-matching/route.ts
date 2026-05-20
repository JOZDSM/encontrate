import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { processHostSignalMatchesForSignal } from "@/lib/signal-match";
import { processGuestListingMatchesForListing } from "@/lib/listing-for-signal-match";

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

/** First pass: recently updated ACTIVE Señales → per-host SignalMatch + emails. */
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
    const result = await processHostSignalMatchesForSignal(prisma, signal);
    matchesCreated += result.matchesCreated;
    emailsSent += result.emailsSent;
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
    const result = await processGuestListingMatchesForListing(prisma, listing);
    matchesCreated += result.matchesCreated;
    emailsSent += result.emailsSent;
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
