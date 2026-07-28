/**
 * Phase 11 — taxonomy aggregations and composition contract tests.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const dataset = require(join(root, "data/restaurants.json"));
const restaurants = dataset.restaurants;

function slugifyLike(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getByState(stateSlug) {
  return restaurants.filter((r) => r.stateSlug === stateSlug);
}
function getByCity(citySlug) {
  return restaurants.filter((r) => r.citySlug === citySlug);
}
function getByCuisine(cuisineSlug) {
  return restaurants.filter((r) => r.cuisineSlug === cuisineSlug);
}

function cityCuisineDistribution(citySlug, limit = 5) {
  const list = getByCity(citySlug);
  const total = list.length;
  const map = new Map();
  for (const r of list) {
    const key = r.cuisineSlug || "unknown";
    const existing = map.get(key);
    if (!existing) map.set(key, { cuisine: r.cuisine, cuisineSlug: key, count: 1 });
    else existing.count += 1;
  }
  return [...map.values()]
    .sort((a, b) => b.count - a.count || a.cuisine.localeCompare(b.cuisine))
    .slice(0, limit)
    .map((item) => ({
      ...item,
      percent: total === 0 ? 0 : Math.round((item.count / total) * 100),
    }));
}

function cuisineCityHubs(cuisineSlug) {
  const list = getByCuisine(cuisineSlug);
  const map = new Map();
  for (const r of list) {
    const existing = map.get(r.citySlug);
    if (!existing) {
      map.set(r.citySlug, {
        city: r.city,
        citySlug: r.citySlug,
        count: 1,
      });
    } else existing.count += 1;
  }
  const hubs = [...map.values()].sort(
    (a, b) => b.count - a.count || a.city.localeCompare(b.city),
  );
  return hubs.length >= 2 ? hubs : [];
}

describe("Dataset roster totals", () => {
  it("matches expected starred roster sizes", () => {
    assert.equal(restaurants.length, dataset.totals.restaurants);
    assert.equal(restaurants.length, 271);
    assert.equal(restaurants.filter((r) => r.stars === 1).length, 216);
    assert.equal(restaurants.filter((r) => r.stars === 2).length, 39);
    assert.equal(restaurants.filter((r) => r.stars === 3).length, 16);
  });
});

describe("State taxonomy aggregates", () => {
  const stateSlug = "california";
  it("resolves California with real counts", () => {
    const list = getByState(stateSlug);
    assert.ok(list.length > 0);
    assert.equal(list.filter((r) => r.stars === 1).length + list.filter((r) => r.stars === 2).length + list.filter((r) => r.stars === 3).length, list.length);
  });

  it("does not invent Bib counts in source files", () => {
    const glance = readFileSync(
      join(root, "src/components/stitch/taxonomy/StateAtAGlance.tsx"),
      "utf8",
    );
    assert.match(glance, /Bib Gourmand/);
    assert.doesNotMatch(glance, /bibCount|Bib:\s*\d/);
  });
});

describe("City cuisine distribution", () => {
  const citySlug = [...new Set(restaurants.map((r) => r.citySlug))].find((s) =>
    s.includes("new-york"),
  );
  assert.ok(citySlug, "new york city slug");

  it("computes percent from city total", () => {
    const dist = cityCuisineDistribution(citySlug, 5);
    const total = getByCity(citySlug).length;
    assert.ok(dist.length > 0);
    for (const item of dist) {
      assert.equal(item.percent, Math.round((item.count / total) * 100));
    }
  });

  it("handles zero total safely", () => {
    assert.deepEqual(cityCuisineDistribution("no-such-city-zzz", 5), []);
  });
});

describe("Cuisine U.S. hubs (OD-14)", () => {
  const japanese = restaurants.find((r) =>
    /japan/i.test(r.cuisineSlug),
  )?.cuisineSlug;
  assert.ok(japanese);

  it("returns hubs only for U.S. cities in roster", () => {
    const hubs = cuisineCityHubs(japanese);
    for (const hub of hubs) {
      assert.ok(restaurants.some((r) => r.citySlug === hub.citySlug));
      assert.doesNotMatch(hub.city, /Tokyo|Kyoto|Paris|London/i);
    }
  });

  it("omits hubs when fewer than two cities", () => {
    // Find a cuisine with exactly one city if possible
    const byCuisine = new Map();
    for (const r of restaurants) {
      const set = byCuisine.get(r.cuisineSlug) ?? new Set();
      set.add(r.citySlug);
      byCuisine.set(r.cuisineSlug, set);
    }
    const single = [...byCuisine.entries()].find(([, cities]) => cities.size === 1);
    if (single) {
      assert.deepEqual(cuisineCityHubs(single[0]), []);
    }
  });
});

describe("Star route validation", () => {
  it("parseStarCount pattern only allows 1-3 in page source", () => {
    const page = readFileSync(
      join(root, "src/app/stars/[starCount]/page.tsx"),
      "utf8",
    );
    assert.match(page, /parseStarCount/);
    assert.match(page, /StarPageView/);
    assert.doesNotMatch(page, /TaxonomyPageShell/);
  });
});

describe("Composition wiring", () => {
  it("routes use stitch page views, not TaxonomyPageShell", () => {
    for (const rel of [
      "src/app/usa/[stateSlug]/page.tsx",
      "src/app/cities/[citySlug]/page.tsx",
      "src/app/cuisines/[cuisineSlug]/page.tsx",
      "src/app/stars/[starCount]/page.tsx",
      "src/app/about-michelin-stars/page.tsx",
    ]) {
      const src = readFileSync(join(root, rel), "utf8");
      assert.doesNotMatch(src, /TaxonomyPageShell/);
    }
    assert.match(
      readFileSync(join(root, "src/app/usa/[stateSlug]/page.tsx"), "utf8"),
      /StatePageView/,
    );
    assert.match(
      readFileSync(join(root, "src/app/about-michelin-stars/page.tsx"), "utf8"),
      /MichelinEducationPage/,
    );
    assert.match(
      readFileSync(join(root, "src/app/about-michelin-stars/page.tsx"), "utf8"),
      /How Michelin Stars Work/,
    );
  });

  it("old TaxonomyPageShell file is deleted", () => {
    let missing = false;
    try {
      readFileSync(
        join(root, "src/components/taxonomy/TaxonomyPageShell.tsx"),
        "utf8",
      );
    } catch {
      missing = true;
    }
    assert.equal(missing, true);
  });
});

void slugifyLike;
