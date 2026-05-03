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
