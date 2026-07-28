import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  classifyPlan,
  createJourneyVisit,
  deriveRestaurantJourney,
  migrateLegacyJourneyRecords,
  removeJourneyPlan,
} from "../src/lib/passport/journey.ts";

const stamp = "2026-07-18T12:00:00.000Z";

function legacyRecord(overrides = {}) {
  return {
    restaurantSlug: "benu-san-francisco-ca",
    saved: true,
    wantToVisit: false,
    planned: false,
    visited: false,
    favorite: false,
    visitDate: null,
    personalRating: null,
    notes: "",
    favoriteDishes: [],
    reservationPlannedFor: null,
    reservationProvider: null,
    reservationConfirmationNote: null,
    createdAt: stamp,
    updatedAt: stamp,
    ...overrides,
  };
}

describe("Stage 8 normalized Passport journey", () => {
  it("migrates one legacy planned-and-visited aggregate into separate records", () => {
    const result = migrateLegacyJourneyRecords({
      "benu-san-francisco-ca": legacyRecord({
        planned: true,
        visited: true,
        favorite: true,
        visitDate: "2026-05-12",
        reservationPlannedFor: "2026-09-01",
        reservationProvider: "Tock",
        reservationConfirmationNote: "ABC-123",
        notes: "A private memory",
        favoriteDishes: ["Quail"],
      }),
    });

    assert.equal(Object.keys(result.bookmarks).length, 1);
    assert.equal(Object.keys(result.plans).length, 1);
    assert.equal(Object.keys(result.visits).length, 1);
    assert.equal(Object.values(result.visits)[0].personalFavorite, true);
    assert.equal(Object.values(result.visits)[0].visitDate, "2026-05-12");
    assert.equal(Object.values(result.plans)[0].plannedDate, "2026-09-01");
  });

  it("does not convert a favorite-only legacy row into a visit", () => {
    const result = migrateLegacyJourneyRecords({
      "benu-san-francisco-ca": legacyRecord({
        saved: false,
        favorite: true,
      }),
    });

    assert.equal(Object.keys(result.bookmarks).length, 1);
    assert.equal(Object.keys(result.visits).length, 0);
  });

  it("supports multiple visits on the same date without overwriting", () => {
    const first = createJourneyVisit(
      {},
      {
        id: "visit-lunch",
        restaurantSlug: "benu-san-francisco-ca",
        visitDate: "2026-07-18",
        favoriteDishes: "Lunch menu",
        notes: "",
        wouldReturn: true,
        personalFavorite: false,
      },
      stamp,
    );
    const second = createJourneyVisit(
      first,
      {
        id: "visit-dinner",
        restaurantSlug: "benu-san-francisco-ca",
        visitDate: "2026-07-18",
        favoriteDishes: "Dinner menu",
        notes: "",
        wouldReturn: null,
        personalFavorite: true,
      },
      stamp,
    );

    assert.equal(Object.keys(second).length, 2);
    assert.equal(second["visit-lunch"].visitDate, "2026-07-18");
    assert.equal(second["visit-dinner"].visitDate, "2026-07-18");
  });

  it("derives Saved, Planned, Visited, and Personal favorite together", () => {
    const journey = deriveRestaurantJourney(
      "benu-san-francisco-ca",
      {
        "benu-san-francisco-ca": {
          restaurantSlug: "benu-san-francisco-ca",
          createdAt: stamp,
          updatedAt: stamp,
        },
      },
      {
        "plan-1": {
          id: "plan-1",
          restaurantSlug: "benu-san-francisco-ca",
          plannedDate: "2026-09-01",
          plannedTime: null,
          reservationProvider: null,
          confirmationReference: null,
          privateNotes: "",
          createdAt: stamp,
          updatedAt: stamp,
        },
      },
      {
        "visit-1": {
          id: "visit-1",
          restaurantSlug: "benu-san-francisco-ca",
          visitDate: "2026-05-12",
          datePrecision: "day",
          favoriteDishes: "",
          privateNotes: "",
          wouldReturn: true,
          personalFavorite: true,
          createdAt: stamp,
          updatedAt: stamp,
        },
      },
    );

    assert.equal(journey.isSaved, true);
    assert.equal(journey.isPlanned, true);
    assert.equal(journey.isVisited, true);
    assert.equal(journey.isPersonalFavorite, true);
    assert.equal(journey.visitCount, 1);
  });

  it("classifies overdue plans for 30 days, then as preserved history", () => {
    assert.equal(classifyPlan("2026-07-10", "2026-07-18"), "needs-update");
    assert.equal(classifyPlan("2026-06-18", "2026-07-18"), "needs-update");
    assert.equal(classifyPlan("2026-06-17", "2026-07-18"), "past");
    assert.equal(classifyPlan("2026-07-18", "2026-07-18"), "upcoming");
  });

  it("removes only the plan and preserves all other journey records", () => {
    const plans = {
      "plan-1": {
        id: "plan-1",
        restaurantSlug: "benu-san-francisco-ca",
        plannedDate: "2026-09-01",
        plannedTime: null,
        reservationProvider: null,
        confirmationReference: null,
        privateNotes: "",
        createdAt: stamp,
        updatedAt: stamp,
      },
    };
    assert.deepEqual(removeJourneyPlan(plans, "plan-1"), {});
  });
});
