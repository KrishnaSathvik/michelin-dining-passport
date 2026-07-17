/**
 * Phase 7 — Restaurant detail Stitch composition contract tests.
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

const pageTs = readFileSync(
  join(root, "src/app/restaurants/[slug]/page.tsx"),
  "utf8",
);
const viewTs = readFileSync(
  join(root, "src/components/stitch/restaurant-detail/RestaurantDetailView.tsx"),
  "utf8",
);
const modelsTs = readFileSync(
  join(root, "src/components/stitch/restaurant-detail/models.ts"),
  "utf8",
);
const adaptersTs = readFileSync(
  join(root, "src/components/stitch/restaurant-detail/adapters.ts"),
  "utf8",
);
const googleSectionTs = readFileSync(
  join(root, "src/components/stitch/restaurant-detail/RestaurantGoogleSection.tsx"),
  "utf8",
);
const jsonLdTs = readFileSync(join(root, "src/lib/seo/jsonld.ts"), "utf8");
const restaurantsDataTs = readFileSync(
  join(root, "src/lib/data/restaurants.ts"),
  "utf8",
);

describe("Restaurant detail route composition", () => {
  it("wires Stitch RestaurantDetailView from the route", () => {
    assert.match(pageTs, /RestaurantDetailView/);
    assert.match(pageTs, /toRestaurantDetailViewModel/);
    assert.doesNotMatch(pageTs, /RestaurantPassportControls/);
    assert.doesNotMatch(pageTs, /RestaurantGooglePlacesSection/);
    assert.doesNotMatch(pageTs, /from \"@\/components\/restaurant\//);
  });

  it("preserves SEO helpers and notFound", () => {
    assert.match(pageTs, /generateMetadata/);
    assert.match(pageTs, /notFound/);
    assert.match(viewTs, /breadcrumbJsonLd/);
    assert.match(viewTs, /restaurantJsonLd/);
  });
});

describe("Restaurant detail view model contract", () => {
  it("models first-party fields without Google content keys", () => {
    assert.match(modelsTs, /RestaurantDetailModel/);
    assert.match(modelsTs, /googlePlaceId/);
    for (const key of [
      "googleRating",
      "aggregateRating",
      "googlePhotos",
      "userRatingCount",
      "openingHours",
    ]) {
      assert.doesNotMatch(modelsTs, new RegExp(key));
    }
  });

  it("adapters exclude self from related/nearby", () => {
    assert.match(adaptersTs, /item\.slug !== restaurant\.slug/);
    assert.match(adaptersTs, /toRelatedRestaurantCardModel/);
    assert.match(adaptersTs, /toNearbyRestaurantRowModel/);
  });
});

describe("Google provider boundary", () => {
  it("lazy-mounts a single full GooglePlaceDetails", () => {
    assert.match(googleSectionTs, /dynamic/);
    assert.match(googleSectionTs, /ssr:\s*false/);
    assert.match(googleSectionTs, /GooglePlaceDetails/);
    assert.match(googleSectionTs, /lazy/);
    assert.match(googleSectionTs, /Photos and live place information from Google/);
  });

  it("structured data helper has no Google rating fields", () => {
    assert.doesNotMatch(jsonLdTs, /aggregateRating/);
    assert.doesNotMatch(jsonLdTs, /userRatingCount/);
  });
});

describe("Roster fixtures for detail QA", () => {
  it("includes benu and star variants", () => {
    const benu = restaurants.find((r) => r.slug === "benu-san-francisco-ca");
    assert.ok(benu);
    assert.equal(benu.stars, 3);
    assert.ok(restaurants.some((r) => r.stars === 1));
    assert.ok(restaurants.some((r) => r.stars === 2));
  });

  it("keeps related/nearby loaders", () => {
    assert.match(restaurantsDataTs, /export function getNearbyRestaurants/);
    assert.match(restaurantsDataTs, /export function getRelatedByCuisine/);
  });
});
