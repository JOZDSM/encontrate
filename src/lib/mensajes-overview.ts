import type { BookingStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";

export type InquiryThreadSummary = {
  kind: "inquiry";
  listingId: string;
  peerUserId: string;
  listingTitle: string;
  neighborhood: string;
  peerLabel: string;
  lastBody: string;
  lastAt: Date;
};

export type BookingRowSummary = {
  kind: "booking";
  bookingId: string;
  role: "guest" | "host";
  listingTitle: string;
  listingId: string;
  counterpartyLabel: string;
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
  updatedAt: Date;
};

export async function loadInquiryThreads(
  userId: string,
): Promise<InquiryThreadSummary[]> {
  const inquiryMsgs = await prisma.message.findMany({
    where: {
      bookingId: null,
      // Only listing-anchored inquiries are considered here. Signal-anchored
      // notification rows live in a separate query path.
      listingId: { not: null },
      OR: [{ senderId: userId }, { listing: { hostId: userId } }],
    },
    include: {
      listing: { select: { id: true, title: true, hostId: true, neighborhood: true } },
      sender: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const seen = new Set<string>();
  const threads: InquiryThreadSummary[] = [];

  for (const m of inquiryMsgs) {
    if (!m.listing || !m.listingId) continue;
    const peerUserId = m.senderId === userId ? m.listing.hostId : m.senderId;
    const key = `${m.listingId}:${peerUserId}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const peerLabel =
      m.senderId === userId
        ? "Anfitrión"
        : (m.sender.name?.trim() ||
            m.sender.email?.trim() ||
            "Huésped");

    threads.push({
      kind: "inquiry",
      listingId: m.listingId,
      peerUserId,
      listingTitle: m.listing.title,
      neighborhood: m.listing.neighborhood,
      peerLabel,
      lastBody: m.body,
      lastAt: m.createdAt,
    });
  }

  return threads;
}

export type SignalInquiryThreadSummary = {
  kind: "signal-inquiry";
  signalId: string;
  peerUserId: string;
  signalTitle: string;
  peerLabel: string;
  lastBody: string;
  lastAt: Date;
};

export type SignalSystemMessageSummary = {
  kind: "signal-system";
  /** Direction relative to `userId`. */
  direction: "host-saw-signal" | "guest-saw-listing";
  /** Stable id used as a React key (the underlying match row id). */
  id: string;
  signalId?: string;
  listingId?: string;
  signalTitle?: string;
  listingTitle?: string;
  notifiedAt: Date;
  viewedAt: Date | null;
};

export async function loadSignalInquiryThreads(
  userId: string,
): Promise<SignalInquiryThreadSummary[]> {
  const msgs = await prisma.message.findMany({
    where: {
      bookingId: null,
      signalId: { not: null },
      OR: [{ senderId: userId }, { signal: { userId } }],
    },
    include: {
      signal: { select: { id: true, fullName: true, userId: true } },
      sender: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const seen = new Set<string>();
  const out: SignalInquiryThreadSummary[] = [];
  for (const m of msgs) {
    if (!m.signal || !m.signalId) continue;
    const peerUserId = m.senderId === userId ? m.signal.userId : m.senderId;
    const key = `${m.signalId}:${peerUserId}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const peerLabel =
      m.senderId === userId
        ? "Autor de la señal"
        : (m.sender.name?.trim() || m.sender.email?.trim() || "Anfitrión");

    out.push({
      kind: "signal-inquiry",
      signalId: m.signalId,
      peerUserId,
      signalTitle: m.signal.fullName,
      peerLabel,
      lastBody: m.body,
      lastAt: m.createdAt,
    });
  }
  return out;
}

/**
 * System messages from the matching cron — surfaced in the inbox so users see
 * "you matched with X" without leaving Mensajes. Combines:
 *   - Hosts → SignalMatch (a guest's señal matched my Buscar huésped filter)
 *   - Guests → GuestListingMatch (a new listing matched my señal alert)
 */
export async function loadSignalSystemMessages(
  userId: string,
): Promise<SignalSystemMessageSummary[]> {
  const [signalMatches, listingMatches] = await Promise.all([
    prisma.signalMatch.findMany({
      where: { hostId: userId, dismissedAt: null },
      orderBy: { notifiedAt: "desc" },
      take: 50,
      include: { signal: { select: { id: true, fullName: true } } },
    }),
    prisma.guestListingMatch.findMany({
      where: { signal: { userId } },
      orderBy: { notifiedAt: "desc" },
      take: 50,
      include: {
        signal: { select: { id: true } },
        listing: { select: { id: true, title: true } },
      },
    }),
  ]);

  const out: SignalSystemMessageSummary[] = [];
  for (const m of signalMatches) {
    out.push({
      kind: "signal-system",
      direction: "host-saw-signal",
      id: m.id,
      signalId: m.signal.id,
      signalTitle: m.signal.fullName,
      notifiedAt: m.notifiedAt,
      viewedAt: m.viewedAt,
    });
  }
  for (const m of listingMatches) {
    out.push({
      kind: "signal-system",
      direction: "guest-saw-listing",
      id: m.id,
      signalId: m.signal.id,
      listingId: m.listing.id,
      listingTitle: m.listing.title,
      notifiedAt: m.notifiedAt,
      viewedAt: m.viewedAt,
    });
  }
  out.sort((a, b) => b.notifiedAt.getTime() - a.notifiedAt.getTime());
  return out;
}

export async function loadBookingRowsForMensajes(
  userId: string,
): Promise<BookingRowSummary[]> {
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [{ guestId: userId }, { listing: { hostId: userId } }],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      listing: { select: { id: true, title: true } },
      guest: { select: { name: true, email: true } },
    },
  });

  return bookings.map((b) => {
    const role: "guest" | "host" = b.guestId === userId ? "guest" : "host";
    const counterpartyLabel =
      role === "guest"
        ? "Anfitrión"
        : (b.guest.name?.trim() || b.guest.email?.trim() || "Huésped");
    return {
      kind: "booking" as const,
      bookingId: b.id,
      role,
      listingTitle: b.listing.title,
      listingId: b.listing.id,
      counterpartyLabel,
      startDate: b.startDate,
      endDate: b.endDate,
      status: b.status,
      updatedAt: b.updatedAt,
    };
  });
}
