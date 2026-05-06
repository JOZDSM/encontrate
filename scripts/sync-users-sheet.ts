import "dotenv/config";

import { google } from "googleapis";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

const SHEET_ID = process.env.GOOGLE_SHEET_ID?.trim();
const SHEET_TAB = (process.env.GOOGLE_SHEET_TAB ?? "Users").trim();

const CONTACTED_OPTIONS = ["Yes", "No", "Completed"] as const;

const REQUIRED_HEADERS = [
  "userId",
  "username",
  "email",
  "phoneNumber",
  "contacted",
  "hasListing",
  "createdAt",
  "approved",
] as const;

type Row = Record<(typeof REQUIRED_HEADERS)[number], string>;

function normalizeContacted(raw: string): (typeof CONTACTED_OPTIONS)[number] | "" {
  const v = raw.replace(/\s+/g, " ").trim();
  if (!v) return "";
  const lower = v.toLowerCase();
  if (lower === "yes") return "Yes";
  if (lower === "no") return "No";
  if (lower === "completed" || lower === "complete" || lower === "done") return "Completed";
  return "";
}

function yesNo(v: boolean): "Yes" | "No" {
  return v ? "Yes" : "No";
}

function iso(d: Date): string {
  return d.toISOString();
}

async function getPrisma() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing");

  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool as unknown as ConstructorParameters<typeof PrismaPg>[0]);
  const prisma = new PrismaClient({ adapter });
  return { prisma, pool };
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
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
      fields: "sheets(properties(sheetId,title))",
    });
    const sheetId = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === SHEET_TAB,
    )?.properties?.sheetId;
    if (typeof sheetId !== "number") {
      throw new Error(
        `Sheet tab "${SHEET_TAB}" not found. Create a tab with that exact name.`,
      );
    }

    const [users, listingCounts] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          whatsappNumber: true,
          isApproved: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5_000,
      }),
      prisma.listing.groupBy({
        by: ["hostId"],
        _count: { _all: true },
      }),
    ]);

    const hostHasListing = new Map<string, boolean>();
    for (const row of listingCounts) {
      hostHasListing.set(row.hostId, (row._count?._all ?? 0) > 0);
    }

    // Read existing sheet A:H (we never overwrite beyond H so you can add columns later).
    const range = `${SHEET_TAB}!A:H`;
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
      // Initialize tab headers (and keep sheet simple). This overwrites A1:H1 only.
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_TAB}!A1:H1`,
        valueInputOption: "RAW",
        requestBody: { values: [Array.from(REQUIRED_HEADERS)] },
      });
    }

    // Build index by userId from existing rows.
    const userIdToRowIndex = new Map<string, number>(); // 1-based row number in sheet
    const userIdToContacted = new Map<string, string>();
    const blankContactedRowIndices: number[] = [];
    const invalidContactedFixes: Array<{ rowIndex: number; value: string }> = [];

    for (let i = 1; i < values.length; i++) {
      const row = values[i] ?? [];
      const userId = row[0]?.trim();
      if (!userId) continue;
      userIdToRowIndex.set(userId, i + 1);
      const contactedRaw = String(row[4] ?? "");
      const normalized = normalizeContacted(contactedRaw);
      if (!normalized) {
        blankContactedRowIndices.push(i + 1);
      } else {
        userIdToContacted.set(userId, normalized);
        if (normalized !== contactedRaw.trim()) {
          invalidContactedFixes.push({ rowIndex: i + 1, value: normalized });
        }
      }
    }

    const toAppend: string[][] = [];
    const updates: Array<{ rowIndex: number; row: Row }> = [];

    for (const u of users) {
      const row: Row = {
        userId: u.id,
        // In Google Sheets "Tables", columns may have strict types (email/phone).
        // Use blank for missing values so the Table doesn't show "Invalid".
        username: u.name?.trim() || "",
        email: u.email?.trim() || "",
        phoneNumber: u.whatsappNumber?.trim() || "",
        contacted: userIdToContacted.get(u.id) || "No",
        hasListing: yesNo(Boolean(hostHasListing.get(u.id))),
        createdAt: iso(u.createdAt),
        approved: yesNo(Boolean(u.isApproved)),
      };

      const existingRowIndex = userIdToRowIndex.get(u.id);
      if (!existingRowIndex) {
        toAppend.push(REQUIRED_HEADERS.map((h) => row[h]));
      } else {
        updates.push({ rowIndex: existingRowIndex, row });
      }
    }

    // Append new users.
    if (toAppend.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_TAB}!A:H`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: toAppend },
      });
    }

    // Batch update existing rows (A:H only).
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          valueInputOption: "RAW",
          data: updates.map((u) => ({
            range: `${SHEET_TAB}!A${u.rowIndex}:H${u.rowIndex}`,
            values: [REQUIRED_HEADERS.map((h) => u.row[h])],
          })),
        },
      });
    }

    // Default `contacted` to "No" for any existing blank cells (don't overwrite real values).
    if (blankContactedRowIndices.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          valueInputOption: "RAW",
          data: blankContactedRowIndices.map((rowIndex) => ({
            range: `${SHEET_TAB}!E${rowIndex}`,
            values: [["No"]],
          })),
        },
      });
    }

    // Fix any non-canonical spellings/casing/whitespace so data validation doesn't flag them.
    if (invalidContactedFixes.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          valueInputOption: "RAW",
          data: invalidContactedFixes.map((f) => ({
            range: `${SHEET_TAB}!E${f.rowIndex}`,
            values: [[f.value]],
          })),
        },
      });
    }

    // Ensure `contacted` is a dropdown: Yes / No / Completed (E2:E).
    // We set a large row range so it applies as the sheet grows.
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [
            {
              setDataValidation: {
                range: {
                  sheetId,
                  startRowIndex: 1,
                  endRowIndex: 10000,
                  startColumnIndex: 4,
                  endColumnIndex: 5,
                },
                rule: {
                  condition: {
                    type: "ONE_OF_LIST",
                    values: CONTACTED_OPTIONS.map((v) => ({ userEnteredValue: v })),
                  },
                  // Some Sheets "Tables" UI variants can still show warnings for values that look
                  // identical; we normalize values above and keep the dropdown UI enabled here.
                  strict: false,
                  showCustomUi: true,
                },
              },
            },
          ],
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Google Sheets "Tables" (typed columns) reject setDataValidation calls on those cells.
      // Syncing values is still valid; the dropdown UI must be configured via the Table UI.
      if (msg.includes("not allowed on cells in typed columns")) {
        console.warn(
          `Skipping data validation (typed Table columns). Configure the 'contacted' column type as a dropdown in Sheets UI instead.`,
        );
      } else {
        throw err;
      }
    }

    console.log(
      JSON.stringify(
        { ok: true, users: users.length, appended: toAppend.length, updated: updates.length },
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

