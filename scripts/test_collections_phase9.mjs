import assert from "node:assert/strict";
import { describe, it } from "node:test";

/**
 * Mirrors Phase 9 stitch/collections metrics + filters (plain Node, no TS).
 */

function uniqueMemberSlugs(restaurantSlugs) {
  const seen = new Set();
  const unique = [];
  for (const slug of restaurantSlugs) {
    if (seen.has(slug)) continue;
    seen.add(slug);
    unique.push(slug);
  }
  return unique;
}

function selectFeaturedCollection(collections) {
  if (collections.length === 0) return null;
  const byRecency = (a, b) => {
    const time = b.updatedAt.localeCompare(a.updatedAt);
    if (time !== 0) return time;
    return a.id.localeCompare(b.id);
  };
  const nonEmpty = collections.filter((c) => c.restaurantSlugs.length > 0);
  if (nonEmpty.length > 0) return [...nonEmpty].sort(byRecency)[0];
  return [...collections].sort(byRecency)[0];
}

function buildProgress(collection, store, restaurants) {
  const bySlug = new Map(restaurants.map((r) => [r.slug, r]));
  const ordered = uniqueMemberSlugs(collection.restaurantSlugs);
  const members = ordered.flatMap((slug) => {
    const r = bySlug.get(slug);
    return r ? [r] : [];
  });
  const stale = ordered.length - members.length;
  const visited = members.filter(
    (r) => store.userRestaurants[r.slug]?.visited === true,
  ).length;
  const total = members.length;
  const percent =
    total === 0 ? 0 : Math.min(100, Math.round((visited / total) * 100));
  const stars = members.reduce((sum, r) => sum + r.stars, 0);
  return { total, visited, percent, stars, stale };
}

function filterByQuery(collections, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [...collections];
  return collections.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q),
  );
}

function sortCollections(collections, sort) {
  const next = [...collections];
  if (sort === "name-asc") next.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "name-desc") next.sort((a, b) => b.name.localeCompare(a.name));
  if (sort === "count-desc")
    next.sort((a, b) => b.restaurantCount - a.restaurantCount);
  if (sort === "count-asc")
    next.sort((a, b) => a.restaurantCount - b.restaurantCount);
  if (sort === "updated-desc")
    next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return next;
}

const restaurants = [
  { slug: "a", name: "Alpha", stars: 3, stateSlug: "ca", stateCode: "CA" },
  { slug: "b", name: "Beta", stars: 2, stateSlug: "ny", stateCode: "NY" },
  { slug: "c", name: "Gamma", stars: 1, stateSlug: "ca", stateCode: "CA" },
];

describe("Phase 9 collections metrics", () => {
  it("featured prefers most recently updated non-empty collection", () => {
    const featured = selectFeaturedCollection([
      {
        id: "1",
        name: "Empty recent",
        restaurantSlugs: [],
        updatedAt: "2026-06-01T00:00:00.000Z",
      },
      {
        id: "2",
        name: "Older with members",
        restaurantSlugs: ["a"],
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "3",
        name: "Newer with members",
        restaurantSlugs: ["b"],
        updatedAt: "2026-05-01T00:00:00.000Z",
      },
    ]);
    assert.equal(featured.id, "3");
  });

  it("single collection is featured candidate without requiring pin field", () => {
    const only = {
      id: "only",
      name: "Solo",
      restaurantSlugs: ["a"],
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    assert.equal(selectFeaturedCollection([only]).id, "only");
  });

  it("progress uses resolved members only and clamps zero", () => {
    const store = {
      userRestaurants: {
        a: { restaurantSlug: "a", visited: true },
        b: { restaurantSlug: "b", visited: false },
      },
    };
    const progress = buildProgress(
      {
        restaurantSlugs: ["a", "b", "stale", "a"],
      },
      store,
      restaurants,
    );
    assert.equal(progress.total, 2);
    assert.equal(progress.visited, 1);
    assert.equal(progress.percent, 50);
    assert.equal(progress.stale, 1);
    assert.equal(progress.stars, 5);

    const empty = buildProgress({ restaurantSlugs: [] }, store, restaurants);
    assert.equal(empty.percent, 0);
    assert.equal(empty.total, 0);
  });

  it("duplicate member slugs count once", () => {
    assert.deepEqual(uniqueMemberSlugs(["a", "a", "b"]), ["a", "b"]);
  });

  it("search matches name and description", () => {
    const rows = [
      { name: "California Trip", description: "Coastal dining" },
      { name: "NY Icons", description: "Manhattan tasting menus" },
    ];
    assert.equal(filterByQuery(rows, "california").length, 1);
    assert.equal(filterByQuery(rows, "tasting").length, 1);
    assert.equal(filterByQuery(rows, "zzz").length, 0);
  });

  it("sort supports real values only", () => {
    const rows = [
      { name: "B", restaurantCount: 1, updatedAt: "2026-01-01T00:00:00.000Z" },
      { name: "A", restaurantCount: 5, updatedAt: "2026-02-01T00:00:00.000Z" },
    ];
    assert.equal(sortCollections(rows, "name-asc")[0].name, "A");
    assert.equal(sortCollections(rows, "count-desc")[0].restaurantCount, 5);
    assert.equal(sortCollections(rows, "updated-desc")[0].name, "A");
  });

  it("featured null when no collections", () => {
    assert.equal(selectFeaturedCollection([]), null);
  });
});
