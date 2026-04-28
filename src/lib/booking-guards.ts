import type { PrismaClient } from "@/generated/prisma/client";
import { BookingStatus } from "@/generated/prisma/enums";
import { rangesOverlap } from "@/lib/dates";

export async function listingHasConflict(
  prisma: PrismaClient,
  listingId: string,
  start: Date,
  end: Date,
  opts?: { excludeBookingId?: string; includePending?: boolean },
): Promise<{ reason: string } | null> {
  const blocks = await prisma.availabilityBlock.findMany({
    where: { listingId },
  });
  for (const b of blocks) {
    if (rangesOverlap(start, end, b.startDate, b.endDate)) {
      return { reason: "Las fechas coinciden con un cierre del anfitrión." };
    }
  }

  const confirmed = await prisma.booking.findMany({
    where: { listingId, status: BookingStatus.CONFIRMED },
  });
  for (const b of confirmed) {
    if (opts?.excludeBookingId === b.id) continue;
    if (rangesOverlap(start, end, b.startDate, b.endDate)) {
      return { reason: "Ya hay una reserva confirmada en esas fechas." };
    }
  }

  if (opts?.includePending) {
    const pending = await prisma.booking.findMany({
      where: { listingId, status: BookingStatus.PENDING },
    });
    for (const b of pending) {
      if (opts?.excludeBookingId === b.id) continue;
      if (rangesOverlap(start, end, b.startDate, b.endDate)) {
        return {
          reason: "Ya hay una solicitud pendiente que cruza esas fechas.",
        };
      }
    }
  }

  return null;
}
