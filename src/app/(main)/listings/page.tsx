import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ListingsFilterPanel } from "@/components/listings-filter-panel";
import { ListingsResultsPanel } from "@/components/listings-results-panel";
import { parseBarcelonaZonesParam } from "@/lib/barcelona-zones";
import { parseDateOnly } from "@/lib/dates";
import { parseListingSort } from "@/lib/listing-sort";
import { getPublicListings, type AvailabilityRange } from "@/lib/listing-queries";
import { isUserApproved } from "@/lib/approval";
import { isUserProfileComplete } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { addDays } from "date-fns";

type SearchParams = {
  city?: string;
  country?: string;
  checkIn?: string;
  checkOut?: string;
  dateMode?: string;
  flexDays?: string;
  flexStay?: string;
  flexMonths?: string;
  bedSize?: string;
  windowType?: string;
  roomSizeSqm?: string;
  furnished?: string;
  apartmentRooms?: string;
  apartmentBaths?: string;
  apartmentSizeSqm?: string;
  wifi?: string;
  sort?: string;
  zones?: string;
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isUserProfileComplete(session)) redirect("/onboarding");
  if (!isUserApproved(session)) redirect("/pending");

  const sp = await searchParams;
  const city = sp.city ?? "Barcelona";
  const country = sp.country ?? "España";
  const sort = parseListingSort(sp.sort);
  const zones = parseBarcelonaZonesParam(sp.zones);

  let rangeStart: Date | undefined;
  let rangeEnd: Date | undefined;
  let rangeFlexDays: number | undefined;
  let availabilityRanges: AvailabilityRange[] | undefined;

  const dateMode = sp.dateMode === "flex" ? "flex" : "exact";

  if (dateMode === "flex") {
    const stays = (sp.flexStay ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const months = (sp.flexMonths ?? "")
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

      // Date-only in UTC, noon to avoid DST issues.
      const monthStart = new Date(Date.UTC(y, m - 1, 1, 12, 0, 0));
      const nextMonthStart = new Date(Date.UTC(y, m, 1, 12, 0, 0));

      if (wantMonth) {
        ranges.push({ start: monthStart, end: nextMonthStart });
      }

      // For weekend/week we generate a bounded set of candidate starts to keep the search snappy:
      // - Weekend: Friday and Saturday starts (2 nights)
      // - Week: starts every 7 days from month start (7 nights)
      for (let d = new Date(monthStart); d < nextMonthStart; d = addDays(d, 1)) {
        const dow = d.getUTCDay(); // 0=Sun ... 6=Sat
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

    // If nothing selected, don't apply date filtering.
    if (ranges.length) {
      availabilityRanges = ranges.slice(0, 160);
    }
  }

  if (sp.checkIn && sp.checkOut) {
    rangeStart = parseDateOnly(sp.checkIn);
    rangeEnd = parseDateOnly(sp.checkOut);
    if (!(rangeStart < rangeEnd)) {
      rangeStart = undefined;
      rangeEnd = undefined;
    }
  }

  if (dateMode === "exact" && sp.flexDays) {
    const n = Number.parseInt(sp.flexDays, 10);
    if (Number.isFinite(n) && n > 0) rangeFlexDays = Math.min(n, 14);
  }

  const publicListingOpts: Parameters<typeof getPublicListings>[0] = {
    city: city || undefined,
    country: country || undefined,
    zones: zones.length ? zones : undefined,
    availabilityRanges,
    rangeStart,
    rangeEnd,
    rangeFlexDays,
    bedSize: sp.bedSize || undefined,
    windowType: sp.windowType || undefined,
    roomSizeSqm: sp.roomSizeSqm ? Number(sp.roomSizeSqm) : undefined,
    furnished:
      sp.furnished === "yes" ? true : sp.furnished === "no" ? false : undefined,
    apartmentRooms: sp.apartmentRooms ? Number(sp.apartmentRooms) : undefined,
    apartmentBaths: sp.apartmentBaths ? Number(sp.apartmentBaths) : undefined,
    apartmentSizeSqm: sp.apartmentSizeSqm ? Number(sp.apartmentSizeSqm) : undefined,
    wifi: sp.wifi === "yes" ? true : sp.wifi === "no" ? false : undefined,
    sort,
  };

  const listings = await getPublicListings(publicListingOpts);

  return (
    <div className="text-primary-foreground flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col px-4">
        <div
          className={cn(
            "mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col gap-4 overflow-y-auto py-6",
            "md:flex-row md:gap-6 md:min-h-0 md:py-6",
          )}
        >
          <aside className="flex min-h-[min(42vh,340px)] w-full shrink-0 flex-col md:min-h-0 md:w-[min(460px,38vw)] md:max-w-[460px] md:flex-none">
            <ListingsFilterPanel
              defaultCity={city}
              defaultCountry={country}
              defaultCheckIn={sp.checkIn}
              defaultCheckOut={sp.checkOut}
              defaultFlexDays={sp.flexDays}
              defaultZones={zones}
              defaultBedSize={sp.bedSize}
              defaultWindowType={sp.windowType}
              defaultRoomSizeSqm={sp.roomSizeSqm}
              defaultFurnished={sp.furnished}
              defaultApartmentRooms={sp.apartmentRooms}
              defaultApartmentBaths={sp.apartmentBaths}
              defaultApartmentSizeSqm={sp.apartmentSizeSqm}
              defaultWifi={sp.wifi}
              sort={sort}
            />
          </aside>

          <section className="text-card-foreground flex min-h-[min(50vh,400px)] min-w-0 flex-1 flex-col md:min-h-0">
            <ListingsResultsPanel listings={listings} sort={sort} />
          </section>
        </div>
      </div>
    </div>
  );
}
