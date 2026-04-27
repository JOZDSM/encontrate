import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { parseBarcelonaZonesParam } from "@/lib/barcelona-zones";
import { parseDateOnly } from "@/lib/dates";
import { parseListingSort } from "@/lib/listing-sort";
import { getPublicListings, type AvailabilityRange } from "@/lib/listing-queries";
import { isUserApproved } from "@/lib/approval";
import { addDays } from "date-fns";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 }, { status: 401 });
  }
  if (!isUserApproved(session)) {
    return NextResponse.json({ count: 0 }, { status: 403 });
  }

  const url = new URL(req.url);
  const sp = url.searchParams;

  const city = sp.get("city") ?? "Barcelona";
  const country = sp.get("country") ?? "España";
  const sort = parseListingSort(sp.get("sort") ?? undefined);
  const zones = parseBarcelonaZonesParam(sp.get("zones") ?? undefined);

  let rangeStart: Date | undefined;
  let rangeEnd: Date | undefined;
  let rangeFlexDays: number | undefined;
  let availabilityRanges: AvailabilityRange[] | undefined;

  const dateMode = sp.get("dateMode") === "flex" ? "flex" : "exact";

  if (dateMode === "flex") {
    const stays = (sp.get("flexStay") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const months = (sp.get("flexMonths") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const wantWeekend = stays.includes("weekend");
    const wantWeek = stays.includes("week");
    const wantMonth = stays.includes("month");

    const ranges: AvailabilityRange[] = [];
    for (const ym of months.slice(0, 12)) {
      const [yRaw, mRaw] = ym.split("-");
      const y = Number.parseInt(yRaw ?? "", 10);
      const m = Number.parseInt(mRaw ?? "", 10);
      if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) continue;

      const monthStart = new Date(Date.UTC(y, m - 1, 1, 12, 0, 0));
      const nextMonthStart = new Date(Date.UTC(y, m, 1, 12, 0, 0));

      if (wantMonth) ranges.push({ start: monthStart, end: nextMonthStart });

      for (let d = new Date(monthStart); d < nextMonthStart; d = addDays(d, 1)) {
        const dow = d.getUTCDay();
        if (wantWeekend && (dow === 5 || dow === 6)) {
          ranges.push({ start: d, end: addDays(d, 2) });
        }
      }

      if (wantWeek) {
        for (let offset = 0; offset < 35; offset += 7) {
          const start = addDays(monthStart, offset);
          if (!(start < nextMonthStart)) break;
          ranges.push({ start, end: addDays(start, 7) });
        }
      }
    }

    if (ranges.length) availabilityRanges = ranges.slice(0, 160);
  }

  const checkIn = sp.get("checkIn");
  const checkOut = sp.get("checkOut");
  if (checkIn && checkOut) {
    rangeStart = parseDateOnly(checkIn);
    rangeEnd = parseDateOnly(checkOut);
    if (!(rangeStart < rangeEnd)) {
      rangeStart = undefined;
      rangeEnd = undefined;
    }
  }

  const flexDaysRaw = sp.get("flexDays");
  if (dateMode === "exact" && flexDaysRaw) {
    const n = Number.parseInt(flexDaysRaw, 10);
    if (Number.isFinite(n) && n > 0) rangeFlexDays = Math.min(n, 14);
  }

  const roomSizeSqmRaw = sp.get("roomSizeSqm");
  const aptRoomsRaw = sp.get("apartmentRooms");
  const aptBathsRaw = sp.get("apartmentBaths");
  const aptSizeRaw = sp.get("apartmentSizeSqm");

  const listings = await getPublicListings({
    city: city || undefined,
    country: country || undefined,
    zones: zones.length ? zones : undefined,
    availabilityRanges,
    rangeStart,
    rangeEnd,
    rangeFlexDays,
    bedSize: sp.get("bedSize") || undefined,
    windowType: sp.get("windowType") || undefined,
    roomSizeSqm: roomSizeSqmRaw ? Number(roomSizeSqmRaw) : undefined,
    furnished:
      sp.get("furnished") === "yes"
        ? true
        : sp.get("furnished") === "no"
          ? false
          : undefined,
    apartmentRooms: aptRoomsRaw ? Number(aptRoomsRaw) : undefined,
    apartmentBaths: aptBathsRaw ? Number(aptBathsRaw) : undefined,
    apartmentSizeSqm: aptSizeRaw ? Number(aptSizeRaw) : undefined,
    wifi:
      sp.get("wifi") === "yes" ? true : sp.get("wifi") === "no" ? false : undefined,
    sort,
  });

  return NextResponse.json({ count: listings.length });
}

