/**
 * Phase 2 Explore query-engine tests.
 * Mirrors src/lib/data/explore.ts + normalize.ts for Node's native test runner
 * without TypeScript path/extension friction.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

function normalizeSearchText(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const EXPLORE_SORT_OPTIONS = [
  "featured",
  "stars-desc",
  "stars-asc",
  "name-asc",
  "name-desc",
  "state",
  "city",
];

const EXPLORE_VIEW_OPTIONS = ["grid", "list"];

function readParam(value) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function parseExploreSearchParams(params) {
  const starsRaw = readParam(params.stars).trim();
  const starsNum = Number(starsRaw);
  const stars =
    starsRaw === "1" || starsRaw === "2" || starsRaw === "3"
      ? starsNum
      : null;
  const sortRaw = readParam(params.sort).trim();
  const viewRaw = readParam(params.view).trim();
  const pageRaw = Number(readParam(params.page).trim());

  return {
    q: readParam(params.q).trim(),
    stars,
    state: readParam(params.state).trim(),
    city: readParam(params.city).trim(),
    cuisine: readParam(params.cuisine).trim(),
    price: readParam(params.price).trim(),
    sort: EXPLORE_SORT_OPTIONS.includes(sortRaw) ? sortRaw : "featured",
    view: EXPLORE_VIEW_OPTIONS.includes(viewRaw) ? viewRaw : "grid",
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1,
  };
}

function buildExploreSearchParams(query) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.stars !== null && query.stars !== undefined) {
    params.set("stars", String(query.stars));
  }
  if (query.state) params.set("state", query.state);
  if (query.city) params.set("city", query.city);
  if (query.cuisine) params.set("cuisine", query.cuisine);
  if (query.price) params.set("price", query.price);
  if (query.sort && query.sort !== "featured") params.set("sort", query.sort);
  if (query.view && query.view !== "grid") params.set("view", query.view);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  return params;
}

function buildExploreHref(query) {
  const qs = buildExploreSearchParams(query).toString();
  return qs ? `/explore?${qs}` : "/explore";
}

function filterRestaurants(restaurants, query) {
  return restaurants.filter((restaurant) => {
    if (query.stars !== null && restaurant.stars !== query.stars) return false;
    if (query.state && restaurant.stateSlug !== query.state) return false;
    if (query.city && restaurant.citySlug !== query.city) return false;
    if (query.cuisine && restaurant.cuisineSlug !== query.cuisine) return false;
    if (query.price && restaurant.price !== query.price) return false;
    if (!query.q) return true;
    const haystack = normalizeSearchText(
      [
        restaurant.name,
        restaurant.city,
        restaurant.state,
        restaurant.stateCode,
        restaurant.cuisine,
        restaurant.address,
      ].join(" "),
    );
    const terms = normalizeSearchText(query.q).split(" ").filter(Boolean);
    return terms.every((term) => haystack.includes(term));
  });
}

function sortRestaurants(restaurants, sort, featuredSlugs = []) {
  const items = [...restaurants];
  const featuredIndex = new Map(
    featuredSlugs.map((slug, index) => [slug, index]),
  );
  items.sort((a, b) => {
    if (sort === "featured") {
      const aFeatured = featuredIndex.has(a.slug);
      const bFeatured = featuredIndex.has(b.slug);
      if (aFeatured && bFeatured) {
        return featuredIndex.get(a.slug) - featuredIndex.get(b.slug);
      }
      if (aFeatured !== bFeatured) return aFeatured ? -1 : 1;
      if (b.stars !== a.stars) return b.stars - a.stars;
      return a.name.localeCompare(b.name);
    }
    if (sort === "stars-desc") {
      if (b.stars !== a.stars) return b.stars - a.stars;
      return a.name.localeCompare(b.name);
    }
    if (sort === "name-asc") return a.name.localeCompare(b.name);
    return 0;
  });
  return items;
}

const sample = [
  {
    slug: "alpha-sf-ca",
    name: "Alpha",
    stars: 3,
    cuisine: "Japanese",
    cuisineSlug: "japanese",
    price: "$$$$",
    city: "San Francisco",
    citySlug: "san-francisco",
    state: "California",
    stateCode: "CA",
    stateSlug: "california",
    address: "1 Market St., San Francisco, CA, 94105, USA",
  },
  {
    slug: "beta-nyc-ny",
    name: "Beta",
    stars: 1,
    cuisine: "Contemporary",
    cuisineSlug: "contemporary",
    price: "$$$",
    city: "New York",
    citySlug: "new-york",
    state: "New York",
    stateCode: "NY",
    stateSlug: "new-york",
    address: "11 Madison Ave., New York, NY, 10010, USA",
  },
  {
    slug: "gamma-chi-il",
    name: "Café Gamma",
    stars: 2,
    cuisine: "French",
    cuisineSlug: "french",
    price: "$$$$",
    city: "Chicago",
    citySlug: "chicago",
    state: "Illinois",
    stateCode: "IL",
    stateSlug: "illinois",
    address: "200 W. Randolph St., Chicago, IL, 60606, USA",
  },
];

describe("normalizeSearchText", () => {
  it("strips diacritics, punctuation, and collapses whitespace", () => {
    assert.equal(normalizeSearchText("  Café—Gamma!!! "), "cafe gamma");
  });
});

describe("parseExploreSearchParams", () => {
  it("parses supported query keys with defaults", () => {
    const query = parseExploreSearchParams({
      q: "sushi",
      stars: "3",
      state: "california",
      city: "san-francisco",
      cuisine: "japanese",
      price: "$$$$",
      sort: "stars-desc",
      view: "list",
      page: "2",
    });
    assert.deepEqual(query, {
      q: "sushi",
      stars: 3,
      state: "california",
      city: "san-francisco",
      cuisine: "japanese",
      price: "$$$$",
      sort: "stars-desc",
      view: "list",
      page: 2,
    });
  });

  it("falls back safely for invalid values", () => {
    const query = parseExploreSearchParams({
      stars: "9",
      sort: "popularity",
      view: "map",
      page: "0",
    });
    assert.equal(query.stars, null);
    assert.equal(query.sort, "featured");
    assert.equal(query.view, "grid");
    assert.equal(query.page, 1);
  });
});

describe("filterRestaurants", () => {
  it("searches name, city, state, cuisine, and address", () => {
    const byAddress = filterRestaurants(
      sample,
      parseExploreSearchParams({ q: "Madison" }),
    );
    assert.equal(byAddress.length, 1);
    assert.equal(byAddress[0]?.slug, "beta-nyc-ny");
  });

  it("applies combined filters", () => {
    const results = filterRestaurants(
      sample,
      parseExploreSearchParams({
        state: "california",
        stars: "3",
        cuisine: "japanese",
      }),
    );
    assert.equal(results.length, 1);
    assert.equal(results[0]?.name, "Alpha");
  });

  it("supports empty results", () => {
    const results = filterRestaurants(
      sample,
      parseExploreSearchParams({ q: "zzzz-no-match" }),
    );
    assert.equal(results.length, 0);
  });
});

describe("sortRestaurants", () => {
  it("sorts by stars descending and name", () => {
    const sorted = sortRestaurants(sample, "stars-desc", []);
    assert.deepEqual(
      sorted.map((item) => item.slug),
      ["alpha-sf-ca", "gamma-chi-il", "beta-nyc-ny"],
    );
  });

  it("puts featured slugs first for featured sort", () => {
    const sorted = sortRestaurants(sample, "featured", ["gamma-chi-il"]);
    assert.equal(sorted[0]?.slug, "gamma-chi-il");
  });
});

describe("URL helpers", () => {
  it("builds shareable explore URLs and omits defaults", () => {
    assert.equal(
      buildExploreHref({
        stars: 3,
        state: "california",
        sort: "featured",
        view: "grid",
        page: 1,
      }),
      "/explore?stars=3&state=california",
    );
  });

  it("clearing cuisine keeps other filters", () => {
    const href = buildExploreHref({
      state: "california",
      stars: 3,
      cuisine: "",
      sort: "featured",
      view: "grid",
      page: 1,
    });
    assert.ok(href.includes("state=california"));
    assert.ok(href.includes("stars=3"));
    assert.ok(!href.includes("cuisine="));
  });
});
