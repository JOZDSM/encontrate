import type { Session } from "next-auth";
import { BookingStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";

export async function canSeeFullAddress(
  session: Session | null,
  listing: { id: string; hostId: string },
): Promise<boolean> {
  if (!session?.user?.id) return false;
  if (listing.hostId === session.user.id) return true;
  const confirmed = await prisma.booking.findFirst({
    where: {
      listingId: listing.id,
      guestId: session.user.id,
      status: BookingStatus.CONFIRMED,
    },
  });
  return Boolean(confirmed);
}
