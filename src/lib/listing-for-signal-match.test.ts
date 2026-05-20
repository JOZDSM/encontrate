import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Prisma } from "@/generated/prisma/client";
import { listingMatchesSignal } from "@/lib/listing-for-signal-match";

type SignalForMatch = Prisma.SignalGetPayload<true>;
type ListingForMatch = Prisma.ListingGetPayload<true>;

function baseListing(overrides: Partial<ListingForMatch> = {}): ListingForMatch {
  return {
    neighborhood: "Eixample",
    bedSize: "DOBLE",
    windowTypes: ["CALLE"],
    roomSizeSqm: 15,
    furnished: true,
    apartmentRooms: 3,
    apartmentBaths: 2,
    apartmentSizeSqm: 80,
    wifi: true,
    hostId: "host-1",
    ...overrides,
  } as ListingForMatch;
}

function baseSignal(overrides: Partial<SignalForMatch> = {}): SignalForMatch {
  return {
    preferredZones: [],
    preferredBedSizes: [],
    preferredWindowTypes: [],
    preferredRoomSizeSqmMin: null,
    preferredFurnished: null,
    preferredApartmentRoomsMin: null,
    preferredApartmentBathsMin: null,
    preferredApartmentSizeSqmMin: null,
    preferredWifi: null,
    ...overrides,
  } as SignalForMatch;
}

describe("listingMatchesSignal", () => {
  it("matches any neighborhood when preferredZones is empty", () => {
    const listing = baseListing({ neighborhood: "Gràcia" });
    const signal = baseSignal({ preferredZones: [] });
    assert.equal(listingMatchesSignal(listing, signal), true);
  });

  it("requires neighborhood in preferredZones when zones are set", () => {
    const listing = baseListing({ neighborhood: "Gràcia" });
    const signal = baseSignal({
      preferredZones: ["eixample", "gracia"],
    });
    assert.equal(listingMatchesSignal(listing, signal), true);

    const wrong = baseListing({ neighborhood: "Les Corts" });
    assert.equal(listingMatchesSignal(wrong, signal), false);
  });

  it("matches any bed size when preferredBedSizes is empty", () => {
    const listing = baseListing({ bedSize: "INDIVIDUAL" });
    const signal = baseSignal({ preferredBedSizes: [] });
    assert.equal(listingMatchesSignal(listing, signal), true);
  });

  it("requires bed size in preferredBedSizes when set", () => {
    const listing = baseListing({ bedSize: "DOBLE" });
    const signal = baseSignal({ preferredBedSizes: ["INDIVIDUAL", "DOBLE"] });
    assert.equal(listingMatchesSignal(listing, signal), true);

    const wrong = baseListing({ bedSize: "INDIVIDUAL" });
    const onlyDoble = baseSignal({ preferredBedSizes: ["DOBLE"] });
    assert.equal(listingMatchesSignal(wrong, onlyDoble), false);
  });

  it("enforces +20 m² sentinel (min 21)", () => {
    const signal = baseSignal({ preferredRoomSizeSqmMin: 21 });
    assert.equal(
      listingMatchesSignal(baseListing({ roomSizeSqm: 21 }), signal),
      true,
    );
    assert.equal(
      listingMatchesSignal(baseListing({ roomSizeSqm: 20 }), signal),
      false,
    );
  });

  it("ignores identity and lifestyle fields on the signal", () => {
    const listing = baseListing();
    const signal = baseSignal({
      preferredZones: [],
      occupation: "STUDENT",
      gender: "FEMALE",
      age: 25,
      cleanlinessImportance: 5,
      description: "<p>Hola</p>",
    } as Partial<SignalForMatch>);
    assert.equal(listingMatchesSignal(listing, signal), true);
  });
});
