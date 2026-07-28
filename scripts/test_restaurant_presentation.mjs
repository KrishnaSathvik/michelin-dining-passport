/**
 * Phase 3 — Stitch restaurant presentation models / adapters / distinction text.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Mirror distinction helpers (keep in sync with MichelinDistinction.tsx)
function michelinDistinctionText(stars) {
  switch (stars) {
    case 1:
      return "1 Michelin star";
    case 2:
      return "2 Michelin stars";
    case 3:
      return "3 Michelin stars";
    default:
      throw new Error(`unexpected stars: ${stars}`);
  }
}

function michelinDistinctionTitle(stars) {
  switch (stars) {
    case 1:
      return "One Michelin Star";
    case 2:
      return "Two Michelin Stars";
    case 3:
      return "Three Michelin Stars";
    default:
      throw new Error(`unexpected stars: ${stars}`);
  }
}

const FORBIDDEN_CARD_MODEL_KEYS = [
  "googlePlaceId",
  "googleRating",
  "googleReviewCount",
  "googlePhotos",
  "openingHours",
  "openNow",
  "reviews",
  "rating",
  "reviewCount",
  "neighborhood",
  "chefName",
  "trending",
  "recommendation",
];

const RESERVATION_ACTION_LABELS = [
  "Reserve now",
  "Check availability",
  "View booking options",
  "Visit restaurant website",
];

const restaurants = JSON.parse(
  readFileSync(join(root, "data/restaurants.json"), "utf8"),
).restaurants;

function formatLocation(restaurant) {
  return `${restaurant.city}, ${restaurant.stateCode}`;
}

function toDiscoveryModel(restaurant, reservationAction, options = {}) {
  return {
    id: restaurant.slug,
    slug: restaurant.slug,
    name: restaurant.name,
    distinction: restaurant.stars,
    cuisine: restaurant.cuisine?.trim() || undefined,
    location: formatLocation(restaurant),
    price: restaurant.price?.trim() || undefined,
    image: options.image,
    reservation: reservationAction,
    isSaved: Boolean(options.isSaved),
    surface: options.surface ?? "explore_grid",
  };
}

describe("Michelin distinction text", () => {
  it("exposes one-, two-, and three-star text equivalents", () => {
    assert.equal(michelinDistinctionText(1), "1 Michelin star");
    assert.equal(michelinDistinctionText(2), "2 Michelin stars");
    assert.equal(michelinDistinctionText(3), "3 Michelin stars");
    assert.equal(michelinDistinctionTitle(1), "One Michelin Star");
    assert.equal(michelinDistinctionTitle(2), "Two Michelin Stars");
    assert.equal(michelinDistinctionTitle(3), "Three Michelin Stars");
  });
});

describe("Restaurant presentation models", () => {
  it("uses first-party fields only — no Google content keys", () => {
    const restaurant = restaurants.find((r) => r.slug === "addison-san-diego-ca");
    assert.ok(restaurant);
    const model = toDiscoveryModel(restaurant, {
      href: "https://www.addisondelmar.com/reservations/",
      label: "Reserve now",
      providerLabel: "Restaurant website",
      isDirectBooking: true,
      source: "verified_direct",
    });

    for (const key of FORBIDDEN_CARD_MODEL_KEYS) {
      assert.equal(
        Object.prototype.hasOwnProperty.call(model, key),
        false,
        `model must not include ${key}`,
      );
    }

    assert.equal(model.id, restaurant.slug);
    assert.equal(model.distinction, 3);
    assert.equal(model.location, "San Diego, CA");
    assert.ok(RESERVATION_ACTION_LABELS.includes(model.reservation.label));
  });

  it("omits empty cuisine and price without inventing values", () => {
    const restaurant = restaurants.find((r) => r.slug === "7-adams-san-francisco-ca");
    assert.ok(restaurant);
    const model = toDiscoveryModel(
      { ...restaurant, cuisine: "  ", price: "" },
      {
        href: restaurant.website || restaurant.michelinGuideUrl,
        label: "Check availability",
        providerLabel: "Restaurant website",
        isDirectBooking: false,
        source: "official_website",
      },
    );
    assert.equal(model.cuisine, undefined);
    assert.equal(model.price, undefined);
  });

  it("supports approved image without Google photo fields", () => {
    const restaurant = restaurants.find((r) => r.slug === "7-adams-san-francisco-ca");
    const model = toDiscoveryModel(
      restaurant,
      {
        href: restaurant.website || restaurant.michelinGuideUrl,
        label: "Check availability",
        providerLabel: "Restaurant website",
        isDirectBooking: false,
        source: "official_website",
      },
      {
        image: {
          url: "/dev/approved-restaurant-demo.svg",
          alt: "Approved first-party restaurant media demo",
        },
      },
    );
    assert.equal(model.image.url, "/dev/approved-restaurant-demo.svg");
    assert.equal(model.image.googlePhotoReference, undefined);
  });
});

describe("Reservation labels contract", () => {
  it("documents the four truthful labels only", () => {
    assert.deepEqual(RESERVATION_ACTION_LABELS, [
      "Reserve now",
      "Check availability",
      "View booking options",
      "Visit restaurant website",
    ]);
    assert.equal(RESERVATION_ACTION_LABELS.includes("Reserve"), false);
  });
});

describe("Fallback palette seed", () => {
  it("derives stable variation from slug", () => {
    function hashSeed(seed) {
      let hash = 0;
      for (let i = 0; i < seed.length; i += 1) {
        hash = (hash * 31 + seed.charCodeAt(i)) | 0;
      }
      return Math.abs(hash);
    }
    assert.equal(hashSeed("benu-san-francisco-ca"), hashSeed("benu-san-francisco-ca"));
    assert.notEqual(
      hashSeed("benu-san-francisco-ca") % 5,
      hashSeed("addison-san-diego-ca") % 5,
    );
  });
});

// Ensure the TypeScript source files exist for the gallery route.
describe("Phase 3 source surface", () => {
  it("ships restaurant presentation modules", () => {
    const files = [
      "src/components/stitch/restaurant/index.ts",
      "src/components/stitch/restaurant/adapters.ts",
      "src/components/stitch/restaurant/RestaurantDiscoveryCard.tsx",
      "src/components/stitch/restaurant/RestaurantEditorialCard.tsx",
      "src/components/stitch/restaurant/RestaurantListRow.tsx",
      "src/components/stitch/restaurant/RestaurantMapRow.tsx",
      "src/components/stitch/restaurant/ReservationAction.tsx",
      "src/components/stitch/restaurant/SaveAction.tsx",
      "src/app/dev/stitch-restaurant-components/page.tsx",
    ];
    for (const file of files) {
      assert.ok(
        readFileSync(join(root, file), "utf8").length > 0,
        `missing ${file}`,
      );
    }
  });
});
