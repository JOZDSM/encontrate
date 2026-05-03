import type { Session } from "next-auth";
import { BookingStatus } from "@/generated/prisma/enums";
import { isPlatformAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function canSeeFullAddress(
  session: Session | null,
  listing: { id: string; hostId: string },
): Promise<boolean> {
  if (!session?.user?.id) return false;
  if (isPlatformAdmin(session)) return true;
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
