import { NextResponse } from "next/server";
import { flattenCatalogOfferings } from "@/lib/catalog-search";
import { getCatalogRows } from "@/lib/service-catalog";

export const dynamic = "force-dynamic";

/** Published catalog offerings for the homepage search overlay. */
export async function GET() {
  try {
    const { recent, categories } = await getCatalogRows();
    const services = flattenCatalogOfferings(recent, categories);
    return NextResponse.json({ services });
  } catch (err) {
    console.error("[api/catalog/services]", err);
    return NextResponse.json({ services: [] }, { status: 200 });
  }
}
