"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { BookingStatus } from "@/generated/prisma/enums";
import { isPlatformAdmin } from "@/lib/admin";
import { listingHasConflict } from "@/lib/booking-guards";
import { parseDateOnly } from "@/lib/dates";
import { prisma } from "@/lib/db";

const updateSchema = z.object({
  bookingId: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.nativeEnum(BookingStatus),
});

export async function updateBookingAsAdminAction(
  input: z.infer<typeof updateSchema>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!isPlatformAdmin(session)) return { ok: false, error: "No autorizado." };

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos no válidos." };

  const { bookingId, startDate, endDate, status } = parsed.data;
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (!(start < end)) {
    return { ok: false, error: "La salida debe ser después de la entrada." };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { listing: true },
  });
  if (!booking) return { ok: false, error: "Reserva no encontrada." };

  const needsAvailabilityCheck =
    status === BookingStatus.CONFIRMED || status === BookingStatus.PENDING;

  if (needsAvailabilityCheck) {
    const conflict = await listingHasConflict(
      prisma,
      booking.listingId,
      start,
      end,
      { excludeBookingId: bookingId },
    );
    if (conflict) return { ok: false, error: conflict.reason };
  }

  if (status === BookingStatus.CONFIRMED) {
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { startDate: start, endDate: end, status },
      });
      await tx.booking.updateMany({
        where: {
          listingId: booking.listingId,
          status: BookingStatus.PENDING,
          id: { not: bookingId },
          AND: [
            { startDate: { lt: end } },
            { endDate: { gt: start } },
          ],
        },
        data: { status: BookingStatus.DECLINED },
      });
    });
  } else {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { startDate: start, endDate: end, status },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/calendar");
  revalidatePath(`/listings/${booking.listingId}`);
  revalidatePath(`/dashboard/bookings/${bookingId}`);
  revalidatePath("/mis-cosas/mensajes");
  return { ok: true };
}
