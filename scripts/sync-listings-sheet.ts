import "dotenv/config";

import { google } from "googleapis";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

const SHEET_ID = process.env.GOOGLE_SHEET_ID?.trim();
const SHEET_TAB = (process.env.GOOGLE_SHEET_TAB ?? "Listings").trim();
// Optional: prefix used to build a public listing URL in the sheet (e.g. https://encontrate.es).
const PUBLIC_URL_BASE = (process.env.PUBLIC_URL_BASE ?? "").replace(/\/+$/, "");

const REQUIRED_HEADERS = [
  "listingId",
  "title",
  "hostName",
  "hostEmail",
  "city",
  "neighborhood",
  "priceEur",
  "favorites",
  "uniqueVisits",
  "confirmedBookings",
  "photos",
  "createdAt",
  "url",
  "notes",
] as const;

type Header = (typeof REQUIRED_HEADERS)[number];
type Row = Record<Header, string>;

// Last column letter for `REQUIRED_HEADERS.length` columns (A=1).
const LAST_COL = String.fromCharCode("A".charCodeAt(0) + REQUIRED_HEADERS.length - 1);

function iso(d: Date | null | undefined): string {
  return d ? d.toISOString() : "";
}

function num(n: number | null | undefined): string {
  return typeof n === "number" && Number.isFinite(n) ? String(n) : "";
}

function listingUrl(listingId: string): string {
  if (!PUBLIC_URL_BASE) return "";
  return `${PUBLIC_URL_BASE}/listings/${listingId}`;
}

async function getPrisma() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing");

  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool as unknown as ConstructorParameters<typeof PrismaPg>[0]);
  const prisma = new PrismaClient({ adapter });
  return { prisma, pool };
}

async function ensureSheetTab(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  title: string,
): Promise<number> {
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties(sheetId,title))",
  });
  const existing = meta.data.sheets?.find(
    (s) => s.properties?.title === title,
  )?.properties?.sheetId;
  if (typeof existing === "number") return existing;

  const created = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title } } }],
    },
  });
  const newSheetId = created.data.replies?.[0]?.addSheet?.properties?.sheetId;
  if (typeof newSheetId !== "number") {
    throw new Error(`Failed to create tab "${title}"`);
  }
  return newSheetId;
}

async function main() {
  if (!SHEET_ID) throw new Error("GOOGLE_SHEET_ID is missing");

  // Auth: in GitHub Actions this comes from google-github-actions/auth (ADC).
  const auth = await google.auth.getClient({
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const { prisma, pool } = await getPrisma();
  try {
    await ensureSheetTab(sheets, SHEET_ID, SHEET_TAB);

    // Pull listings + aggregate counts. groupBy is cheaper than nested includes for big tables.
    const [listings, favCounts, visitCounts, confirmedBookingCounts, photoCounts] =
      await Promise.all([
        prisma.listing.findMany({
          select: {
            id: true,
            title: true,
            city: true,
            neighborhood: true,
            priceMonthlyEur: true,
            createdAt: true,
            host: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5_000,
        }),
        prisma.favoriteListing.groupBy({
          by: ["listingId"],
          _count: { _all: true },
        }),
        prisma.listingVisit.groupBy({
          by: ["listingId"],
          _count: { _all: true },
        }),
        prisma.booking.groupBy({
          by: ["listingId"],
          where: { status: "CONFIRMED" },
          _count: { _all: true },
        }),
        prisma.listingPhoto.groupBy({
          by: ["listingId"],
          _count: { _all: true },
        }),
      ]);

    const favBy = new Map<string, number>();
    for (const r of favCounts) favBy.set(r.listingId, r._count?._all ?? 0);
    const visitsBy = new Map<string, number>();
    for (const r of visitCounts) visitsBy.set(r.listingId, r._count?._all ?? 0);
    const confirmedBy = new Map<string, number>();
    for (const r of confirmedBookingCounts)
      confirmedBy.set(r.listingId, r._count?._all ?? 0);
    const photosBy = new Map<string, number>();
    for (const r of photoCounts) photosBy.set(r.listingId, r._count?._all ?? 0);

    // Read existing rows so we can preserve the editable `notes` column on update.
    const range = `${SHEET_TAB}!A:${LAST_COL}`;
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });
    const values = (existing.data.values ?? []) as string[][];

    const header = values[0] ?? [];
    const headerOk =
      header.length >= REQUIRED_HEADERS.length &&
      REQUIRED_HEADERS.every((h, i) => header[i] === h);

    if (!headerOk) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_TAB}!A1:${LAST_COL}1`,
        valueInputOption: "RAW",
        requestBody: { values: [Array.from(REQUIRED_HEADERS)] },
      });
    }

    // Index existing rows by listingId; capture editable `notes` so we never overwrite it.
    const notesColIdx = REQUIRED_HEADERS.indexOf("notes");
    const listingIdToRowIndex = new Map<string, number>(); // 1-based row number
    const listingIdToNotes = new Map<string, string>();
    for (let i = 1; i < values.length; i++) {
      const row = values[i] ?? [];
      const id = row[0]?.trim();
      if (!id) continue;
      listingIdToRowIndex.set(id, i + 1);
      const notes = (row[notesColIdx] ?? "").toString();
      if (notes) listingIdToNotes.set(id, notes);
    }

    const toAppend: string[][] = [];
    const updates: Array<{ rowIndex: number; row: Row }> = [];

    for (const l of listings) {
      const row: Row = {
        listingId: l.id,
        title: l.title,
        hostName: l.host?.name?.trim() || "",
        hostEmail: l.host?.email?.trim() || "",
        city: l.city,
        neighborhood: l.neighborhood,
        priceEur: num(l.priceMonthlyEur),
        favorites: String(favBy.get(l.id) ?? 0),
        uniqueVisits: String(visitsBy.get(l.id) ?? 0),
        confirmedBookings: String(confirmedBy.get(l.id) ?? 0),
        photos: String(photosBy.get(l.id) ?? 0),
        createdAt: iso(l.createdAt),
        url: listingUrl(l.id),
        notes: listingIdToNotes.get(l.id) ?? "",
      };

      const existingRowIndex = listingIdToRowIndex.get(l.id);
      if (!existingRowIndex) {
        toAppend.push(REQUIRED_HEADERS.map((h) => row[h]));
      } else {
        updates.push({ rowIndex: existingRowIndex, row });
      }
    }

    if (toAppend.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: toAppend },
      });
    }

    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          valueInputOption: "RAW",
          data: updates.map((u) => ({
            range: `${SHEET_TAB}!A${u.rowIndex}:${LAST_COL}${u.rowIndex}`,
            values: [REQUIRED_HEADERS.map((h) => u.row[h])],
          })),
        },
      });
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          listings: listings.length,
          appended: toAppend.length,
          updated: updates.length,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect().catch(() => {});
    await pool.end().catch(() => {});
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
