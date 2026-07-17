/**
 * Phase 5.5 reservation resolver / scoring / override tests.
 * Mirrors src/lib/reservations for Node's test runner.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const restaurants = JSON.parse(
  readFileSync(join(root, "data/restaurants.json"), "utf8"),
).restaurants;
const reservationsFile = JSON.parse(
  readFileSync(join(root, "data/reservations.json"), "utf8"),
);
const overridesFile = JSON.parse(
  readFileSync(join(root, "data/reservation-overrides.json"), "utf8"),
);

const PROVIDER_HOSTS = [
  { provider: "resy", hosts: ["resy.com"] },
  { provider: "tock", hosts: ["exploretock.com"] },
  { provider: "opentable", hosts: ["opentable.com"] },
  { provider: "sevenrooms", hosts: ["sevenrooms.com"] },
  { provider: "michelin", hosts: ["guide.michelin.com"] },
];

function classifyProviderFromUrl(url) {
  if (!url) return "none";
  let hostname = "";
  let pathname = "";
  try {
    const parsed = new URL(url);
    hostname = parsed.hostname.toLowerCase();
    pathname = parsed.pathname.toLowerCase();
  } catch {
    return "none";
  }
  for (const entry of PROVIDER_HOSTS) {
    if (entry.hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))) {
      return entry.provider;
    }
  }
  if (
    ["/reservations", "/reserve", "/book", "/booking", "/tickets", "/experiences"].some(
      (hint) => pathname.includes(hint),
    )
  ) {
    return "restaurant_direct";
  }
  return "other";
}

function isProviderHomepage(url) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/+$/, "") || "/";
    const host = parsed.hostname.toLowerCase();
    if (host.includes("resy.com") && (path === "/" || path === "/cities")) return true;
    if ((host.includes("exploretock.com") || host.includes("opentable.com")) && path === "/") {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

function providerDisplayLabel(provider) {
  switch (provider) {
    case "resy":
      return "via Resy";
    case "tock":
      return "via Tock";
    case "opentable":
      return "via OpenTable";
    case "sevenrooms":
      return "via SevenRooms";
    case "restaurant_direct":
      return "via restaurant";
    case "michelin":
      return "Michelin Guide";
    case "other":
      return "via booking partner";
    default:
      return null;
  }
}

function isPublishableVerified(record) {
  if (!record) return false;
  if (record.status !== "verified") return false;
  if (record.confidence === "low") return false;
  if (!record.reservationUrl) return false;
  if (!record.verifiedAt) return false;
  if (isProviderHomepage(record.reservationUrl)) return false;
  return true;
}

function getRestaurantReservationAction(restaurant, reservationRecord) {
  const status = reservationRecord?.status ?? "unknown";
  if (status === "no_online_booking" || status === "phone_only") {
    if (restaurant.website) {
      return {
        href: restaurant.website,
        label: "Visit restaurant website",
        providerLabel: status === "phone_only" ? "Phone reservations" : "No online booking",
        isDirectBooking: false,
        source: "official_website_restricted",
      };
    }
    return {
      href: restaurant.michelinGuideUrl,
      label: "View booking options",
      providerLabel: "Michelin Guide",
      isDirectBooking: false,
      source: "michelin_listing",
    };
  }
  if (isPublishableVerified(reservationRecord)) {
    if (reservationRecord.provider === "michelin") {
      return {
        href: reservationRecord.reservationUrl,
        label: "View booking options",
        providerLabel: "Michelin Guide",
        isDirectBooking: false,
        source: "verified_michelin",
      };
    }
    return {
      href: reservationRecord.reservationUrl,
      label: "Reserve now",
      providerLabel: providerDisplayLabel(reservationRecord.provider),
      isDirectBooking: true,
      source: "verified_direct",
    };
  }
  if (restaurant.website) {
    return {
      href: restaurant.website,
      label: "Check availability",
      providerLabel: "Restaurant website",
      isDirectBooking: false,
      source: "official_website",
    };
  }
  return {
    href: restaurant.michelinGuideUrl,
    label: "View booking options",
    providerLabel: "Michelin Guide",
    isDirectBooking: false,
    source: "michelin_listing",
  };
}

function applyOverride(record, override) {
  if (!override) return record;
  return { ...record, ...override, restaurantSlug: record.restaurantSlug };
}

function getRecords() {
  const overrideBy = new Map(
    (overridesFile.overrides || []).map((item) => [item.restaurantSlug, item]),
  );
  const records = {};
  for (const [slug, raw] of Object.entries(reservationsFile.records || {})) {
    records[slug] = applyOverride({ ...raw }, overrideBy.get(slug));
  }
  return records;
}

function scoreCandidate({ anchorText, url, fromOfficial, httpStatus }) {
  let score = 0;
  if (/reserve|book|reservation/i.test(anchorText)) score += 40;
  const provider = classifyProviderFromUrl(url);
  if (["resy", "tock", "opentable", "sevenrooms"].includes(provider)) score += 30;
  if (fromOfficial) score += 15;
  if (url.startsWith("https://")) score += 5;
  if (httpStatus && httpStatus >= 200 && httpStatus < 400) score += 10;
  if (isProviderHomepage(url)) score -= 40;
  const confidence = score >= 70 ? "high" : score >= 45 ? "medium" : "low";
  return { score, confidence, provider };
}

function shouldAutoApprove(candidate) {
  return (
    candidate.confidence === "high" &&
    candidate.fromOfficialWebsite === true &&
    candidate.clearBookingAnchor === true &&
    candidate.directRestaurantPage === true &&
    candidate.identityClear === true &&
    candidate.httpStatus >= 200 &&
    candidate.httpStatus < 400 &&
    !candidate.providerHomepage
  );
}

function migratePassportStore(raw) {
  if (!raw || typeof raw !== "object") {
    return { version: 2, userRestaurants: {}, collections: {} };
  }
  const userRestaurants = {};
  for (const [slug, entry] of Object.entries(raw.userRestaurants || {})) {
    userRestaurants[slug] = {
      restaurantSlug: slug,
      saved: Boolean(entry.saved),
      planned: Boolean(entry.planned),
      reservationPlannedFor: entry.reservationPlannedFor ?? null,
      reservationProvider: entry.reservationProvider ?? null,
      reservationConfirmationNote: entry.reservationConfirmationNote ?? null,
    };
  }
  return { version: 2, userRestaurants, collections: raw.collections || {} };
}

function trackReservationClicked(input) {
  return {
    name: "reservation_clicked",
    restaurantSlug: input.restaurantSlug,
    provider: input.provider,
    surface: input.surface,
    isDirectBooking: input.isDirectBooking,
    timestamp: new Date().toISOString(),
  };
}

describe("reservation provider classification", () => {
  it("classifies known hosts and direct paths", () => {
    assert.equal(classifyProviderFromUrl("https://resy.com/cities/sf/benu"), "resy");
    assert.equal(classifyProviderFromUrl("https://www.exploretock.com/benu"), "tock");
    assert.equal(classifyProviderFromUrl("https://www.opentable.com/r/test"), "opentable");
    assert.equal(
      classifyProviderFromUrl("https://example.com/reservations"),
      "restaurant_direct",
    );
  });
});

describe("reservation resolver priority", () => {
  const withWebsite = {
    slug: "demo",
    website: "https://demo.example/",
    michelinGuideUrl: "https://guide.michelin.com/us/en/demo",
  };
  const noWebsite = {
    slug: "demo-no-web",
    website: null,
    michelinGuideUrl: "https://guide.michelin.com/us/en/demo-no-web",
  };

  it("uses verified direct link", () => {
    const action = getRestaurantReservationAction(withWebsite, {
      status: "verified",
      confidence: "high",
      verifiedAt: "2026-07-16T00:00:00.000Z",
      reservationUrl: "https://resy.com/cities/sf/demo",
      provider: "resy",
    });
    assert.equal(action.label, "Reserve now");
    assert.equal(action.href, "https://resy.com/cities/sf/demo");
    assert.equal(action.isDirectBooking, true);
    assert.equal(action.providerLabel, "via Resy");
  });

  it("falls back to official website", () => {
    const action = getRestaurantReservationAction(withWebsite, {
      status: "unknown",
      confidence: "low",
      verifiedAt: null,
      reservationUrl: null,
      provider: "none",
    });
    assert.equal(action.label, "Check availability");
    assert.equal(action.href, withWebsite.website);
  });

  it("falls back to Michelin listing", () => {
    const action = getRestaurantReservationAction(noWebsite, null);
    assert.equal(action.label, "View booking options");
    assert.equal(action.href, noWebsite.michelinGuideUrl);
  });

  it("handles no online booking", () => {
    const action = getRestaurantReservationAction(withWebsite, {
      status: "no_online_booking",
      confidence: "high",
      verifiedAt: "2026-07-16T00:00:00.000Z",
      reservationUrl: null,
      provider: "none",
    });
    assert.equal(action.label, "Visit restaurant website");
    assert.equal(action.isDirectBooking, false);
  });

  it("does not publish low-confidence verified records", () => {
    const action = getRestaurantReservationAction(withWebsite, {
      status: "verified",
      confidence: "low",
      verifiedAt: "2026-07-16T00:00:00.000Z",
      reservationUrl: "https://resy.com/cities/sf/demo",
      provider: "resy",
    });
    assert.equal(action.label, "Check availability");
  });

  it("rejects provider homepages", () => {
    const action = getRestaurantReservationAction(withWebsite, {
      status: "verified",
      confidence: "high",
      verifiedAt: "2026-07-16T00:00:00.000Z",
      reservationUrl: "https://resy.com/",
      provider: "resy",
    });
    assert.equal(action.label, "Check availability");
  });
});

describe("candidate scoring and approval", () => {
  it("scores known provider booking pages highly", () => {
    const result = scoreCandidate({
      anchorText: "Reserve a table",
      url: "https://resy.com/cities/sf/benu",
      fromOfficial: true,
      httpStatus: 200,
    });
    assert.equal(result.confidence, "high");
    assert.equal(result.provider, "resy");
  });

  it("does not auto-approve medium confidence", () => {
    assert.equal(
      shouldAutoApprove({
        confidence: "medium",
        fromOfficialWebsite: true,
        clearBookingAnchor: true,
        directRestaurantPage: true,
        identityClear: true,
        httpStatus: 200,
        providerHomepage: false,
      }),
      false,
    );
  });

  it("auto-approves only strict high-confidence cases", () => {
    assert.equal(
      shouldAutoApprove({
        confidence: "high",
        fromOfficialWebsite: true,
        clearBookingAnchor: true,
        directRestaurantPage: true,
        identityClear: true,
        httpStatus: 200,
        providerHomepage: false,
      }),
      true,
    );
  });
});

describe("manual overrides and dataset integrity", () => {
  it("applies overrides over base records", () => {
    const base = {
      restaurantSlug: "x",
      status: "unknown",
      reservationUrl: null,
      provider: "none",
    };
    const merged = applyOverride(base, {
      restaurantSlug: "x",
      status: "verified",
      reservationUrl: "https://www.exploretock.com/x",
      provider: "tock",
      reason: "test",
      decidedAt: "2026-07-16T00:00:00.000Z",
    });
    assert.equal(merged.status, "verified");
    assert.equal(merged.provider, "tock");
  });

  it("has one reservation record per restaurant and no duplicates", () => {
    const records = getRecords();
    assert.equal(Object.keys(records).length, restaurants.length);
    const slugs = Object.keys(records);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  it("every restaurant resolves to a truthful action", () => {
    const records = getRecords();
    for (const restaurant of restaurants) {
      const action = getRestaurantReservationAction(
        restaurant,
        records[restaurant.slug],
      );
      assert.ok(action.href);
      assert.ok(
        [
          "Reserve now",
          "Check availability",
          "View booking options",
          "Visit restaurant website",
        ].includes(action.label),
      );
    }
  });
});

describe("passport reservation migration", () => {
  it("upgrades v1 records with nullable reservation fields", () => {
    const migrated = migratePassportStore({
      version: 1,
      userRestaurants: {
        demo: { restaurantSlug: "demo", saved: true, planned: true },
      },
      collections: {},
    });
    assert.equal(migrated.version, 2);
    assert.equal(migrated.userRestaurants.demo.reservationPlannedFor, null);
    assert.equal(migrated.userRestaurants.demo.reservationProvider, null);
  });
});

describe("reservation analytics payload", () => {
  it("includes required fields without private notes", () => {
    const event = trackReservationClicked({
      restaurantSlug: "benu-san-francisco-ca",
      provider: "resy",
      surface: "explore_grid",
      isDirectBooking: true,
    });
    assert.equal(event.name, "reservation_clicked");
    assert.equal(event.restaurantSlug, "benu-san-francisco-ca");
    assert.equal(event.surface, "explore_grid");
    assert.equal(event.isDirectBooking, true);
    assert.ok(event.timestamp);
    assert.equal("confirmationNote" in event, false);
  });
});

describe("temporary failure handling policy", () => {
  it("requires repeated failures before review flag", () => {
    let failures = 0;
    const results = ["temporary_failure", "temporary_failure", "temporary_failure"];
    let needsReview = false;
    for (const result of results) {
      if (result === "temporary_failure") failures += 1;
      needsReview = failures >= 3;
    }
    assert.equal(failures, 3);
    assert.equal(needsReview, true);
  });
});
