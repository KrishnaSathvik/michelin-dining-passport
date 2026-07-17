import assert from "node:assert/strict";
import { describe, it } from "node:test";

/**
 * Mirrors Phase 8 stitch/passport/metrics.ts (OD-09 + stars/states).
 * Kept as a plain Node test so CI does not need TS transpilation.
 */

function uniqueRestaurantIds(records) {
  return [...new Set(records.map((record) => record.restaurantSlug))];
}

function isToVisitRecord(record) {
  return (
    (record.wantToVisit === true || record.planned === true) &&
    record.visited !== true
  );
}

function countVisited(store) {
  return uniqueRestaurantIds(
    Object.values(store.userRestaurants).filter((r) => r.visited === true),
  ).length;
}

function countToVisit(store) {
  return uniqueRestaurantIds(
    Object.values(store.userRestaurants).filter(isToVisitRecord),
  ).length;
}

function countFavorites(store) {
  return uniqueRestaurantIds(
    Object.values(store.userRestaurants).filter((r) => r.favorite === true),
  ).length;
}

function starsCollected(store, restaurants) {
  const bySlug = new Map(restaurants.map((item) => [item.slug, item]));
  let total = 0;
  const visited = uniqueRestaurantIds(
    Object.values(store.userRestaurants).filter((r) => r.visited),
  );
  const breakdown = { 1: 0, 2: 0, 3: 0 };
  for (const slug of visited) {
    const restaurant = bySlug.get(slug);
    if (!restaurant) continue;
    total += restaurant.stars;
    breakdown[restaurant.stars] += 1;
  }
  return { total, breakdown };
}

function statesExplored(store, restaurants) {
  const bySlug = new Map(restaurants.map((item) => [item.slug, item]));
  const states = new Set();
  for (const record of Object.values(store.userRestaurants)) {
    if (!record.visited) continue;
    const restaurant = bySlug.get(record.restaurantSlug);
    if (restaurant) states.add(restaurant.stateSlug);
  }
  return states.size;
}

function collectionPreviewCounts(collection, store) {
  const visited = new Set(
    Object.values(store.userRestaurants)
      .filter((r) => r.visited)
      .map((r) => r.restaurantSlug),
  );
  return {
    restaurantCount: collection.restaurantSlugs.length,
    visitedCount: collection.restaurantSlugs.filter((slug) =>
      visited.has(slug),
    ).length,
  };
}

describe("Phase 8 passport metrics (OD-09)", () => {
  it("1. Visited counts unique visited records", () => {
    const store = {
      userRestaurants: {
        a: { restaurantSlug: "a", visited: true },
        b: { restaurantSlug: "b", visited: true },
        c: { restaurantSlug: "c", visited: false },
      },
    };
    assert.equal(countVisited(store), 2);
  });

  it("2–4. To Visit uses want-or-planned union, excludes visited, dedupes", () => {
    const store = {
      userRestaurants: {
        a: { restaurantSlug: "a", wantToVisit: true, planned: false, visited: false },
        b: { restaurantSlug: "b", wantToVisit: false, planned: true, visited: false },
        c: {
          restaurantSlug: "c",
          wantToVisit: true,
          planned: true,
          visited: false,
        },
        d: { restaurantSlug: "d", wantToVisit: true, planned: true, visited: true },
        e: { restaurantSlug: "e", wantToVisit: false, planned: false, visited: false },
      },
    };
    assert.equal(countToVisit(store), 3);
  });

  it("5. Favorites count correctly", () => {
    const store = {
      userRestaurants: {
        a: { restaurantSlug: "a", favorite: true },
        b: { restaurantSlug: "b", favorite: true },
        c: { restaurantSlug: "c", favorite: false },
      },
    };
    assert.equal(countFavorites(store), 2);
  });

  it("6–7. Stars Collected sums Michelin stars for unique visited", () => {
    const result = starsCollected(
      {
        userRestaurants: {
          a: { restaurantSlug: "a", visited: true },
          b: { restaurantSlug: "b", visited: true },
          c: { restaurantSlug: "c", visited: true },
          d: { restaurantSlug: "d", visited: false },
        },
      },
      [
        { slug: "a", stars: 1 },
        { slug: "b", stars: 2 },
        { slug: "c", stars: 3 },
        { slug: "d", stars: 3 },
      ],
    );
    assert.equal(result.total, 6);
    assert.deepEqual(result.breakdown, { 1: 1, 2: 1, 3: 1 });
  });

  it("8. States Explored uses unique visited states only", () => {
    const count = statesExplored(
      {
        userRestaurants: {
          a: { restaurantSlug: "a", visited: true },
          b: { restaurantSlug: "b", visited: true },
          c: { restaurantSlug: "c", visited: false },
        },
      },
      [
        { slug: "a", stateSlug: "california" },
        { slug: "b", stateSlug: "california" },
        { slug: "c", stateSlug: "new-york" },
      ],
    );
    assert.equal(count, 1);
  });

  it("9. Collection preview counts are accurate", () => {
    const counts = collectionPreviewCounts(
      { restaurantSlugs: ["a", "b", "missing"] },
      {
        userRestaurants: {
          a: { restaurantSlug: "a", visited: true },
          b: { restaurantSlug: "b", visited: false },
        },
      },
    );
    assert.equal(counts.restaurantCount, 3);
    assert.equal(counts.visitedCount, 1);
  });

  it("Saved predicate remains saved === true (includes visited-if-saved)", () => {
    const records = [
      { restaurantSlug: "a", saved: true, visited: true },
      { restaurantSlug: "b", saved: true, visited: false },
      { restaurantSlug: "c", saved: false, visited: false },
    ];
    const saved = records.filter((r) => r.saved === true);
    assert.equal(saved.length, 2);
  });

  it("Planned predicate is planned === true (may also be visited)", () => {
    const records = [
      { restaurantSlug: "a", planned: true, visited: true },
      { restaurantSlug: "b", planned: true, visited: false },
      { restaurantSlug: "c", planned: false, visited: true },
    ];
    const planned = records.filter((r) => r.planned === true);
    assert.equal(planned.length, 2);
  });
});
