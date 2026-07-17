/**
 * Phase 5 — Explore Stitch rebuild composition + query-contract guards.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pageTs = readFileSync(join(root, "src/app/explore/page.tsx"), "utf8");
const exploreData = readFileSync(join(root, "src/lib/data/explore.ts"), "utf8");
const adapterTs = readFileSync(
  join(root, "src/components/stitch/explore/adapters.ts"),
  "utf8",
);
const viewTs = readFileSync(
  join(root, "src/components/stitch/explore/ExplorePageView.tsx"),
  "utf8",
);

describe("Explore Phase 5 composition", () => {
  it("renders Stitch ExplorePageView and does not import old explore chrome", () => {
    assert.match(pageTs, /ExplorePageView/);
    assert.match(pageTs, /toExploreViewModel/);
    assert.doesNotMatch(
      pageTs,
      /components\/explore\/|ExploreSearchBar|ExploreResults|ExploreToolbar|ExploreFilterDrawer/,
    );
  });

  it("wires cards through Phase 3 discovery / list adapters", () => {
    assert.match(adapterTs, /toRestaurantDiscoveryCardModel/);
    assert.match(adapterTs, /toRestaurantListRowModel/);
    assert.match(adapterTs, /surface:\s*"explore_grid"/);
    assert.match(adapterTs, /surface:\s*"explore_list"/);
    assert.doesNotMatch(adapterTs, /googlePlaceId|googleRating|reviewCount/);
  });

  it("deleted obsolete Explore presentation files", () => {
    const obsolete = [
      "src/components/explore/ExploreSearchBar.tsx",
      "src/components/explore/ExploreQuickFilters.tsx",
      "src/components/explore/ExploreFilterDrawer.tsx",
      "src/components/explore/ExploreFilterFields.tsx",
      "src/components/explore/ExploreActiveFilters.tsx",
      "src/components/explore/ExploreToolbar.tsx",
      "src/components/explore/ExploreSortSelect.tsx",
      "src/components/explore/ExploreResults.tsx",
      "src/components/explore/ExplorePagination.tsx",
      "src/components/explore/ExploreEmptyState.tsx",
    ];
    for (const file of obsolete) {
      assert.equal(existsSync(join(root, file)), false, `expected deleted: ${file}`);
    }
  });

  it("ExplorePageView uses Stitch grid/list/drawer pieces", () => {
    assert.match(viewTs, /DiscoveryToolbar/);
    assert.match(viewTs, /ExploreGrid|ExploreList/);
    assert.match(viewTs, /ExploreEmptyState/);
    assert.match(viewTs, /ExplorePagination/);
  });
});

describe("Explore query contract unchanged", () => {
  it("still documents the known parameter surface", () => {
    for (const key of [
      "q",
      "stars",
      "state",
      "city",
      "cuisine",
      "price",
      "sort",
      "view",
      "page",
    ]) {
      assert.match(exploreData, new RegExp(`\\b${key}\\b`));
    }
    assert.match(exploreData, /EXPLORE_PAGE_SIZE = 24/);
    assert.match(exploreData, /"featured"/);
    assert.match(exploreData, /"grid"/);
    assert.doesNotMatch(exploreData, /\bsaved\b|\bvisited\b/);
  });
});
