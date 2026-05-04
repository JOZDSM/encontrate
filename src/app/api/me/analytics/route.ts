import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const userId = session.user.id;

  const [listingsCount, bookingsCount] = await Promise.all([
    prisma.listing.count({ where: { hostId: userId } }),
    prisma.booking.count({ where: { guestId: userId } }),
  ]);

  return NextResponse.json({
    ok: true,
    roles: {
      isPlatformAdmin: Boolean(session.user.isAdmin),
      isApproved: Boolean(session.user.isApproved),
      isHost: listingsCount > 0,
      isGuest: bookingsCount > 0,
    },
  });
}

