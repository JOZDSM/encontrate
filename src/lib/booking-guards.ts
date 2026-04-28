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
  const block = await prisma.availabilityBlock.findFirst({
    where: {
      listingId,
      startDate: { lt: end },
      endDate: { gt: start },
    },
    select: { id: true },
  });
  if (block) return { reason: "Las fechas coinciden con un cierre del anfitrión." };

  const confirmed = await prisma.booking.findFirst({
    where: {
      listingId,
      status: BookingStatus.CONFIRMED,
      id: opts?.excludeBookingId ? { not: opts.excludeBookingId } : undefined,
      startDate: { lt: end },
      endDate: { gt: start },
    },
    select: { id: true },
  });
  if (confirmed) return { reason: "Ya hay una reserva confirmada en esas fechas." };

  if (opts?.includePending) {
    const pending = await prisma.booking.findFirst({
      where: {
        listingId,
        status: BookingStatus.PENDING,
        id: opts?.excludeBookingId ? { not: opts.excludeBookingId } : undefined,
        startDate: { lt: end },
        endDate: { gt: start },
      },
      select: { id: true },
    });
    if (pending) {
      return { reason: "Ya hay una solicitud pendiente que cruza esas fechas." };
    }
  }

  return null;
}
