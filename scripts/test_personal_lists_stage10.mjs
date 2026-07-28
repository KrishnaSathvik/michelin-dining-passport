import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  buildPlannedPersonalList,
  buildSavedPersonalList,
  buildVisitedPersonalList,
} from "../src/lib/passport/personal-lists.ts";

const stamp = "2026-07-19T12:00:00.000Z";
const restaurants = [
  {
    slug: "benu-san-francisco-ca",
    name: "Benu",
    stars: 3,
    cuisine: "Asian",
    cuisineSlug: "asian",
    price: "$$$$",
    city: "San Francisco",
    citySlug: "san-francisco",
    state: "California",
    stateCode: "CA",
    stateSlug: "california",
    address: "22 Hawthorne Street",
    michelinGuideUrl: "https://example.test/benu",
    website: null,
  },
  {
    slug: "singlethread-healdsburg-ca",
    name: "SingleThread",
    stars: 3,
    cuisine: "Contemporary",
    cuisineSlug: "contemporary",
    price: "$$$$",
    city: "Healdsburg",
    citySlug: "healdsburg",
    state: "California",
    stateCode: "CA",
    stateSlug: "california",
    address: "131 North Street",
    michelinGuideUrl: "https://example.test/singlethread",
    website: null,
  },
];

const store = {
  version: 3,
  bookmarks: {
    "benu-san-francisco-ca": {
      restaurantSlug: "benu-san-francisco-ca",
      createdAt: "2026-01-10T12:00:00.000Z",
      updatedAt: stamp,
    },
    "singlethread-healdsburg-ca": {
      restaurantSlug: "singlethread-healdsburg-ca",
      createdAt: "2026-02-10T12:00:00.000Z",
      updatedAt: stamp,
    },
  },
  plans: {
    upcoming: {
      id: "upcoming",
      restaurantSlug: "singlethread-healdsburg-ca",
      plannedDate: "2026-08-12",
      plannedTime: "19:30",
      reservationProvider: "Tock",
      confirmationReference: "PRIVATE",
      privateNotes: "",
      createdAt: stamp,
      updatedAt: stamp,
    },
    overdue: {
      id: "overdue",
      restaurantSlug: "benu-san-francisco-ca",
      plannedDate: "2026-07-10",
      plannedTime: null,
      reservationProvider: null,
      confirmationReference: null,
      privateNotes: "",
      createdAt: stamp,
      updatedAt: stamp,
    },
  },
  visits: {
    "benu-one": {
      id: "benu-one",
      restaurantSlug: "benu-san-francisco-ca",
      visitDate: "2026-05-12",
      datePrecision: "day",
      favoriteDishes: "Quail",
      privateNotes: "Private",
      wouldReturn: true,
      personalFavorite: true,
      createdAt: stamp,
      updatedAt: stamp,
    },
    "benu-two": {
      id: "benu-two",
      restaurantSlug: "benu-san-francisco-ca",
      visitDate: null,
      datePrecision: "unknown",
      favoriteDishes: "",
      privateNotes: "",
      wouldReturn: null,
      personalFavorite: false,
      createdAt: stamp,
      updatedAt: stamp,
    },
  },
  userRestaurants: {},
  collections: {},
};

describe("Stage 10 normalized personal-list models", () => {
  it("builds Saved from bookmarks and retains plan and visit summaries", () => {
    const items = buildSavedPersonalList(store, restaurants, "2026-07-19");
    assert.equal(items.length, 2);
    const benu = items.find((item) => item.slug === "benu-san-francisco-ca");
    assert.equal(benu?.visitCount, 2);
    assert.equal(benu?.plan?.id, "overdue");
    assert.equal(benu?.planStatus, "needs-update");
    assert.equal(benu?.personalFavorite, true);
  });

  it("separates Upcoming and Needs update without treating overdue plans as visits", () => {
    const result = buildPlannedPersonalList(
      store,
      restaurants,
      "2026-07-19",
    );
    assert.deepEqual(result.upcoming.map((item) => item.plan.id), ["upcoming"]);
    assert.deepEqual(
      result.needsUpdate.map((item) => item.plan.id),
      ["overdue"],
    );
    assert.equal(result.upcoming[0].visitCount, 0);
  });

  it("groups one-to-many visits by restaurant and puts undated visits last", () => {
    const groups = buildVisitedPersonalList(store, restaurants);
    assert.equal(groups.length, 1);
    assert.equal(groups[0].visitCount, 2);
    assert.equal(groups[0].personalFavorite, true);
    assert.equal(groups[0].visits[0].id, "benu-one");
    assert.equal(groups[0].visits[1].datePrecision, "unknown");
  });

  it("routes use one normalized shared list page without duplicate catalog delivery", () => {
    for (const route of ["saved", "planned", "visited"]) {
      const source = readFileSync(
        new URL(`../src/app/(passport)/${route}/page.tsx`, import.meta.url),
        "utf8",
      );
      assert.match(source, /PassportPersonalListPage/);
      assert.doesNotMatch(source, /getRestaurants|restaurants=/);
    }
  });

  it("the shared page uses V2 journey dialogs and does not import legacy cards", () => {
    const source = readFileSync(
      new URL(
        "../src/components/stitch/passport/PassportPersonalListPage.tsx",
        import.meta.url,
      ),
      "utf8",
    );
    assert.match(source, /JourneyPlanDialog/);
    assert.match(source, /JourneyVisitDialog/);
    assert.match(source, /PassportSyncNotice/);
    assert.doesNotMatch(
      source,
      /SavedRestaurantCard|PlannedRestaurantRow|VisitedRestaurantCard|PlanningDetailsDialog|VisitDetailsDialog/,
    );
  });
});
