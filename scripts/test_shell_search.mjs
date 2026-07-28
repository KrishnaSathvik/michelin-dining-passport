import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { footerNav, primaryNav } from "../src/config/navigation.ts";
import { siteConfig } from "../src/config/site.ts";
import { globalSearch, GLOBAL_SEARCH_MIN_QUERY } from "../src/lib/data/search.ts";

describe("global search", () => {
  it("refuses queries shorter than the minimum without searching", () => {
    const result = globalSearch("a");
    assert.equal(result.tooShort, true);
    assert.deepEqual(result.restaurants, []);
    assert.deepEqual(result.refinements, []);
    assert.equal(result.totalRestaurants, 0);
    assert.equal(result.exploreHref, "/explore");
  });

  it("treats whitespace-only queries as empty", () => {
    const result = globalSearch("   ");
    assert.equal(result.tooShort, true);
    assert.equal(result.totalRestaurants, 0);
  });

  it("matches restaurants by name", () => {
    const result = globalSearch("Alinea");
    assert.equal(result.tooShort, false);
    assert.ok(result.restaurants.length > 0);
    assert.ok(
      result.restaurants.some((item) => /alinea/i.test(item.name)),
      "expected an Alinea match",
    );
  });

  it("matches by city and offers a city refinement", () => {
    const result = globalSearch("Chicago");
    assert.ok(result.totalRestaurants > 0);
    const city = result.refinements.find((item) => item.kind === "city");
    assert.ok(city, "expected a city refinement");
    assert.match(city.href, /^\/explore\?city=/);
    assert.ok(city.count > 0);
  });

  it("matches by state", () => {
    const result = globalSearch("California");
    assert.ok(result.totalRestaurants > 0);
    const state = result.refinements.find((item) => item.kind === "state");
    assert.ok(state, "expected a state refinement");
    assert.match(state.href, /^\/explore\?state=/);
  });

  it("matches by cuisine", () => {
    const result = globalSearch("Japanese");
    assert.ok(result.totalRestaurants > 0);
    const cuisine = result.refinements.find((item) => item.kind === "cuisine");
    assert.ok(cuisine, "expected a cuisine refinement");
    assert.match(cuisine.href, /^\/explore\?cuisine=/);
  });

  it("bounds the preview payload", () => {
    const result = globalSearch("a e");
    assert.ok(result.restaurants.length <= 6);
    assert.ok(result.refinements.length <= 4);
  });

  it("reports the full match count even when the preview is truncated", () => {
    const result = globalSearch("Chicago");
    assert.ok(result.totalRestaurants >= result.restaurants.length);
  });

  it("returns an empty preview for a query that matches nothing", () => {
    const result = globalSearch("zzzzqqqxx");
    assert.equal(result.tooShort, false);
    assert.deepEqual(result.restaurants, []);
    assert.deepEqual(result.refinements, []);
    assert.equal(result.totalRestaurants, 0);
  });

  it("always expresses the full result set as an Explore URL", () => {
    const result = globalSearch("Chicago");
    assert.match(result.exploreHref, /^\/explore\?q=Chicago$/);
  });

  it("ignores case and diacritics", () => {
    const plain = globalSearch("cafe");
    const accented = globalSearch("café");
    assert.equal(plain.totalRestaurants, accented.totalRestaurants);
  });

  it("exposes a minimum query length the client can honour", () => {
    assert.equal(typeof GLOBAL_SEARCH_MIN_QUERY, "number");
    assert.ok(GLOBAL_SEARCH_MIN_QUERY >= 1);
  });
});

describe("shell navigation config", () => {
  it("keeps the footer disjoint from primary navigation", () => {
    const primary = new Set(primaryNav.map((item) => item.href));
    for (const item of footerNav) {
      assert.equal(
        primary.has(item.href),
        false,
        `${item.href} must not be repeated in the footer`,
      );
    }
  });

  it("lists the five supporting pages in order", () => {
    assert.deepEqual(
      footerNav.map((item) => item.label),
      ["About", "Privacy", "Terms", "Contact", "Sources"],
    );
  });

  it("carries exactly one footer disclaimer, free of dataset language", () => {
    assert.equal(
      siteConfig.footerDisclaimer,
      "Orellin is an independent discovery platform and is not affiliated with the Michelin Guide.",
    );
    assert.equal(/dataset|roster|import|ingest/i.test(siteConfig.footerDescription), false);
    assert.equal(/dataset|roster|import|ingest/i.test(siteConfig.footerDisclaimer), false);
  });
});
