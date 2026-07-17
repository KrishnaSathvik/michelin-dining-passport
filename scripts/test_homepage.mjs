/**
 * Phase 4 — Homepage Stitch explore_feed composition tests.
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
const homepageTs = readFileSync(join(root, "src/config/homepage.ts"), "utf8");
const pageTs = readFileSync(join(root, "src/app/page.tsx"), "utf8");
const adapterTs = readFileSync(
  join(root, "src/components/stitch/home/adapters.ts"),
  "utf8",
);

const slugMatch = homepageTs.match(
  /featuredRestaurantSlugs:\s*\[([\s\S]*?)\]/,
);
assert.ok(slugMatch);
const featuredSlugs = [...slugMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);

describe("Homepage featured configuration", () => {
  it("uses real canonical restaurant slugs", () => {
    assert.ok(featuredSlugs.length >= 3);
    const bySlug = new Set(restaurants.map((r) => r.slug));
    for (const slug of featuredSlugs.slice(0, 3)) {
      assert.ok(bySlug.has(slug), `missing restaurant ${slug}`);
    }
  });
});

describe("Homepage live totals", () => {
  it("matches dataset aggregates used on the homepage", () => {
    const totals = {
      restaurants: restaurants.length,
      oneStar: restaurants.filter((r) => r.stars === 1).length,
      twoStar: restaurants.filter((r) => r.stars === 2).length,
      threeStar: restaurants.filter((r) => r.stars === 3).length,
    };
    assert.equal(totals.restaurants, 271);
    assert.equal(totals.oneStar, 216);
    assert.equal(totals.twoStar, 39);
    assert.equal(totals.threeStar, 16);
  });
});

describe("Homepage composition", () => {
  it("renders Stitch HomepageView and does not import old modules", () => {
    assert.match(pageTs, /HomepageView/);
    assert.match(pageTs, /toHomepageViewModel/);
    assert.doesNotMatch(pageTs, /SearchHero|BrowseByState|BrowseByCuisine|MapTeaser|PassportPreview|MichelinStarsExplained|FeaturedRestaurants/);
  });

  it("wires featured cards through Phase 3 discovery adapters", () => {
    assert.match(adapterTs, /toRestaurantDiscoveryCardModel/);
    assert.match(adapterTs, /surface:\s*"homepage"/);
    assert.doesNotMatch(adapterTs, /googlePlaceId|googleRating|reviewCount/);
  });

  it("deleted obsolete homepage presentation files", () => {
    const obsolete = [
      "src/components/home/SearchHero.tsx",
      "src/components/home/FeaturedRestaurants.tsx",
      "src/components/home/BrowseByState.tsx",
      "src/components/home/BrowseByCuisine.tsx",
      "src/components/home/MapTeaser.tsx",
      "src/components/home/MichelinStarsExplained.tsx",
      "src/components/home/PassportPreview.tsx",
    ];
    for (const file of obsolete) {
      try {
        readFileSync(join(root, file), "utf8");
        assert.fail(`expected deleted: ${file}`);
      } catch (error) {
        assert.equal(/** @type {NodeJS.ErrnoException} */ (error).code, "ENOENT");
      }
    }
  });
});
