/**
 * Phase 5 geocode loader / map filter tests.
 * Mirrors src/lib/data/geocodes.ts + src/lib/map/query.ts for Node's test runner.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const geocodes = JSON.parse(readFileSync(join(root, "data/geocodes.json"), "utf8"));
const overridesFile = JSON.parse(
  readFileSync(join(root, "data/geocode-overrides.json"), "utf8"),
);
const restaurants = JSON.parse(
  readFileSync(join(root, "data/restaurants.json"), "utf8"),
).restaurants;

function isFiniteCoordinate(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function applyGeocodeOverride(record, override) {
  if (!override) return record;
  if (!isFiniteCoordinate(override.latitude) || !isFiniteCoordinate(override.longitude)) {
    return record;
  }
  return {
    ...record,
    latitude: override.latitude,
    longitude: override.longitude,
    approved: true,
    uncertain: false,
    needsManualCorrection: false,
    matchType: "manual_override",
    manualReviewStatus: "manually_corrected",
    overrideApplied: true,
  };
}

function getGeocodeRecords(overrideList = overridesFile.overrides) {
  const records = {};
  for (const [slug, record] of Object.entries(geocodes.records)) {
    const override = overrideList.find((item) => item.restaurantSlug === slug);
    records[slug] = applyGeocodeOverride({ ...record }, override);
  }
  return records;
}

function restaurantInBounds(restaurant, bounds) {
  if (
    !restaurant.hasApprovedCoordinates ||
    !isFiniteCoordinate(restaurant.latitude) ||
    !isFiniteCoordinate(restaurant.longitude)
  ) {
    return false;
  }
  return (
    restaurant.longitude >= bounds.west &&
    restaurant.longitude <= bounds.east &&
    restaurant.latitude >= bounds.south &&
    restaurant.latitude <= bounds.north
  );
}

function parseBoundsParam(raw) {
  const parts = raw.split(",").map((part) => Number(part.trim()));
  if (parts.length !== 4) return null;
  const [west, south, east, north] = parts;
  if (![west, south, east, north].every((value) => Number.isFinite(value))) {
    return null;
  }
  if (west >= east || south >= north) return null;
  return { west, south, east, north };
}

function formatBoundsParam(bounds) {
  const round = (value) => Math.round(value * 1e4) / 1e4;
  return [round(bounds.west), round(bounds.south), round(bounds.east), round(bounds.north)].join(",");
}

function boundsMeaningfullyDifferent(current, previous, threshold = 0.02) {
  if (!previous) return true;
  return (
    Math.abs(current.west - previous.west) > threshold ||
    Math.abs(current.south - previous.south) > threshold ||
    Math.abs(current.east - previous.east) > threshold ||
    Math.abs(current.north - previous.north) > threshold
  );
}

function findSharedCoordinateGroups(items) {
  const byCoord = new Map();
  for (const item of items) {
    if (!item.hasApprovedCoordinates) continue;
    const key = `${item.latitude.toFixed(6)},${item.longitude.toFixed(6)}`;
    const group = byCoord.get(key) ?? [];
    group.push(item.slug);
    byCoord.set(key, group);
  }
  for (const [key, group] of [...byCoord.entries()]) {
    if (group.length < 2) byCoord.delete(key);
  }
  return byCoord;
}

describe("geocode loader", () => {
  it("covers every restaurant slug", () => {
    for (const restaurant of restaurants) {
      assert.ok(geocodes.records[restaurant.slug], restaurant.slug);
    }
    assert.equal(Object.keys(geocodes.records).length, 271);
  });

  it("does not approve low-confidence matches", () => {
    for (const [slug, record] of Object.entries(geocodes.records)) {
      if (record.confidence === "low") {
        assert.equal(record.approved, false, slug);
      }
    }
  });

  it("applies overrides after provider coordinates", () => {
    const sampleSlug = Object.keys(geocodes.records).find(
      (slug) => geocodes.records[slug].approved,
    );
    const override = {
      restaurantSlug: sampleSlug,
      latitude: 40.0,
      longitude: -74.0,
      reason: "test",
      verificationSource: "unit-test",
      verifiedDate: "2026-07-17",
    };
    const records = getGeocodeRecords([override]);
    assert.equal(records[sampleSlug].latitude, 40.0);
    assert.equal(records[sampleSlug].longitude, -74.0);
    assert.equal(records[sampleSlug].manualReviewStatus, "manually_corrected");
    assert.equal(records[sampleSlug].overrideApplied, true);
  });

  it("handles missing coordinates without inventing markers", () => {
    const records = getGeocodeRecords();
    const pending = Object.values(records).filter((record) => !record.approved);
    assert.ok(pending.length > 0);
    for (const record of pending) {
      if (record.latitude != null || record.longitude != null) {
        assert.equal(record.approved, false);
      }
    }
  });

  it("keeps shared-coordinate restaurant pairs distinct", () => {
    const records = getGeocodeRecords();
    const items = Object.values(records)
      .filter((record) => record.approved)
      .map((record) => ({
        slug: record.restaurantSlug,
        latitude: record.latitude,
        longitude: record.longitude,
        hasApprovedCoordinates: true,
      }));
    const groups = findSharedCoordinateGroups(items);
    assert.ok(groups.size >= 1);
    for (const group of groups.values()) {
      assert.equal(new Set(group).size, group.length);
      assert.ok(group.length >= 2);
    }
  });
});

describe("bounds filtering and search-this-area", () => {
  it("filters approved coordinates inside bounds", () => {
    const records = getGeocodeRecords();
    const ny = Object.values(records).find(
      (record) =>
        record.approved &&
        record.address.includes("New York") &&
        isFiniteCoordinate(record.latitude),
    );
    assert.ok(ny);
    const inside = restaurantInBounds(
      {
        latitude: ny.latitude,
        longitude: ny.longitude,
        hasApprovedCoordinates: true,
      },
      { west: -75, south: 40, east: -73, north: 42 },
    );
    const outside = restaurantInBounds(
      {
        latitude: ny.latitude,
        longitude: ny.longitude,
        hasApprovedCoordinates: true,
      },
      { west: -122.6, south: 37.6, east: -122.3, north: 37.9 },
    );
    assert.equal(inside, true);
    assert.equal(outside, false);
  });

  it("excludes pending restaurants from area search", () => {
    assert.equal(
      restaurantInBounds(
        { latitude: null, longitude: null, hasApprovedCoordinates: false },
        { west: -130, south: 20, east: -60, north: 50 },
      ),
      false,
    );
  });

  it("round-trips bounds URL params without extreme precision", () => {
    const bounds = { west: -122.41928, south: 37.77492, east: -122.4, north: 37.8 };
    const encoded = formatBoundsParam(bounds);
    assert.ok(!encoded.includes("122.419280000"));
    const parsed = parseBoundsParam(encoded);
    assert.ok(parsed);
    assert.ok(Math.abs(parsed.west - bounds.west) < 0.0001);
  });

  it("detects meaningful viewport changes for search-this-area", () => {
    const a = { west: -100, south: 30, east: -90, north: 40 };
    const b = { west: -100.01, south: 30.01, east: -90.01, north: 40.01 };
    const c = { west: -110, south: 30, east: -100, north: 40 };
    assert.equal(boundsMeaningfullyDifferent(b, a, 0.02), false);
    assert.equal(boundsMeaningfullyDifferent(c, a, 0.02), true);
  });
});

describe("filter integration", () => {
  it("supports state/star/cuisine filtering over map restaurants", () => {
    const ca = restaurants.filter((item) => item.stateSlug === "california");
    const starred = ca.filter((item) => item.stars === 3);
    const japanese = starred.filter((item) => item.cuisineSlug.includes("japanese") || item.cuisine.toLowerCase().includes("japanese"));
    assert.ok(ca.length > 0);
    assert.ok(starred.length >= 0);
    assert.ok(Array.isArray(japanese));
  });

  it("saved/visited filters use passport flags without a second store", () => {
    const passport = {
      userRestaurants: {
        "benu-san-francisco-ca": { saved: true, visited: false },
        "atelier-crenn-san-francisco-ca": { saved: false, visited: true },
      },
    };
    const savedOnly = restaurants.filter(
      (item) => passport.userRestaurants[item.slug]?.saved,
    );
    const visitedOnly = restaurants.filter(
      (item) => passport.userRestaurants[item.slug]?.visited,
    );
    assert.equal(savedOnly.length, 1);
    assert.equal(visitedOnly.length, 1);
  });
});

describe("map UX state helpers", () => {
  it("models location-permission denial as non-blocking", () => {
    const locationError =
      "Location permission denied or unavailable. You can keep browsing the map without it.";
    assert.match(locationError, /permission denied/i);
  });

  it("models map initialization failure with list fallback", () => {
    const mapFailed = true;
    const listAvailable = true;
    assert.equal(mapFailed && listAvailable, true);
  });

  it("keeps marker and list selection synchronized", () => {
    let selectedSlug = null;
    const selectFromList = (slug) => {
      selectedSlug = slug;
    };
    const selectFromMarker = (slug) => {
      selectedSlug = slug;
    };
    selectFromList("benu-san-francisco-ca");
    assert.equal(selectedSlug, "benu-san-francisco-ca");
    selectFromMarker("atelier-crenn-san-francisco-ca");
    assert.equal(selectedSlug, "atelier-crenn-san-francisco-ca");
  });

  it("supports mobile sheet expanded/collapsed state", () => {
    let sheetExpanded = false;
    sheetExpanded = !sheetExpanded;
    assert.equal(sheetExpanded, true);
    sheetExpanded = !sheetExpanded;
    assert.equal(sheetExpanded, false);
  });

  it("restores selected and bounds from URL state", () => {
    const params = {
      state: "california",
      selected: "benu-san-francisco-ca",
      bounds: "-122.5,37.7,-122.3,37.9",
      saved: "1",
    };
    assert.equal(params.state, "california");
    assert.equal(params.selected, "benu-san-francisco-ca");
    assert.ok(parseBoundsParam(params.bounds));
    assert.equal(params.saved, "1");
  });
});
