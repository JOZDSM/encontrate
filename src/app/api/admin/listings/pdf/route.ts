import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isPlatformAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { buildAdminListingsPdfBuffer } from "@/lib/listing-pdf/build-admin-listings-pdf";
import type { AdminListingsPdfListing } from "@/lib/listing-pdf/admin-listings-pdf-document";
import type { ListingWindowValue } from "@/lib/listing-window-options";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const PDF_RATE_LIMIT = 5;
const PDF_RATE_WINDOW_MS = 60_000;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!isPlatformAdmin(session)) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const rateKey = `admin-listings-pdf:${session.user.id}`;
  if (!rateLimit(rateKey, PDF_RATE_LIMIT, PDF_RATE_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Demasiadas exportaciones. Probá de nuevo en un minuto." },
      { status: 429 },
    );
  }

  const rows = await prisma.listing.findMany({
    orderBy: [{ neighborhood: "asc" }, { title: "asc" }],
    select: {
      title: true,
      neighborhood: true,
      bedSize: true,
      windowTypes: true,
      roomSizeSqm: true,
      furnished: true,
      apartmentRooms: true,
      apartmentBaths: true,
      apartmentSizeSqm: true,
      wifi: true,
    },
  });

  const listings: AdminListingsPdfListing[] = rows.map((row) => ({
    title: row.title,
    neighborhood: row.neighborhood,
    bedSize: row.bedSize,
    windowTypes: row.windowTypes as ListingWindowValue[],
    roomSizeSqm: row.roomSizeSqm,
    furnished: row.furnished,
    apartmentRooms: row.apartmentRooms,
    apartmentBaths: row.apartmentBaths,
    apartmentSizeSqm: row.apartmentSizeSqm,
    wifi: row.wifi,
  }));

  try {
    const { buffer, filename } = await buildAdminListingsPdfBuffer(listings);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("admin listings PDF generation failed", err);
    return NextResponse.json(
      { error: "No se pudo generar el PDF. Probá de nuevo." },
      { status: 500 },
    );
  }
}
