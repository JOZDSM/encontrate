import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isUserApproved } from "@/lib/approval";
import { canSeeFullAddress } from "@/lib/listing-visibility";
import {
  getListingDetailForViewer,
  listingDetailTodayUtc,
} from "@/lib/listing-detail-data";
import { buildListingPdfBuffer } from "@/lib/listing-pdf/build-listing-pdf";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const PDF_RATE_LIMIT = 10;
const PDF_RATE_WINDOW_MS = 60_000;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!isUserApproved(session)) {
    return NextResponse.json({ error: "Cuenta pendiente de aprobación" }, {
      status: 403,
    });
  }

  const rateKey = `listing-pdf:${session.user.id}`;
  if (!rateLimit(rateKey, PDF_RATE_LIMIT, PDF_RATE_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Demasiadas exportaciones. Probá de nuevo en un minuto." },
      { status: 429 },
    );
  }

  const { id } = await ctx.params;
  const detail = await getListingDetailForViewer(id, {
    todayUtc: listingDetailTodayUtc(),
  });
  if (!detail) {
    return NextResponse.json({ error: "Anuncio no encontrado" }, { status: 404 });
  }

  const showFullAddress = await canSeeFullAddress(session, detail.listing);

  try {
    const { buffer, filename } = await buildListingPdfBuffer(detail, {
      showFullAddress,
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("listing PDF generation failed", err);
    return NextResponse.json(
      { error: "No se pudo generar el PDF. Probá de nuevo." },
      { status: 500 },
    );
  }
}
