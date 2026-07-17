import assert from "node:assert/strict";
import test from "node:test";

function uniqueStrings(values) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed.toLowerCase())) continue;
    seen.add(trimmed.toLowerCase());
    result.push(trimmed);
  }
  return result;
}

function mergeUserRestaurantRecords(local, cloud) {
  if (!local && !cloud) return { record: null, conflicts: [] };
  if (!local) return { record: cloud ?? null, conflicts: [] };
  if (!cloud) return { record: local, conflicts: [] };
  const conflicts = [];
  const localNewer = Date.parse(local.updatedAt) >= Date.parse(cloud.updatedAt);
  let notes = local.notes.trim() || cloud.notes.trim();
  if (
    local.notes.trim() &&
    cloud.notes.trim() &&
    local.notes.trim() !== cloud.notes.trim()
  ) {
    notes = localNewer ? local.notes : cloud.notes;
    conflicts.push({ field: "notes", retained: localNewer ? "local" : "cloud" });
  }
  const record = {
    restaurantSlug: local.restaurantSlug,
    saved: local.saved || cloud.saved,
    wantToVisit: local.wantToVisit || cloud.wantToVisit,
    planned: local.planned || cloud.planned,
    visited: local.visited || cloud.visited,
    favorite: local.favorite || cloud.favorite,
    visitDate: local.visitDate ?? cloud.visitDate,
    personalRating: localNewer
      ? (local.personalRating ?? cloud.personalRating)
      : (cloud.personalRating ?? local.personalRating),
    notes,
    favoriteDishes: uniqueStrings([
      ...local.favoriteDishes,
      ...cloud.favoriteDishes,
    ]),
    reservationPlannedFor:
      local.reservationPlannedFor ?? cloud.reservationPlannedFor,
    updatedAt: localNewer ? local.updatedAt : cloud.updatedAt,
  };
  return { record, conflicts };
}

const base = {
  restaurantSlug: "addison-san-diego-ca",
  saved: false,
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
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

test("guest with no local data yields null", () => {
  const result = mergeUserRestaurantRecords(null, null);
  assert.equal(result.record, null);
});

test("boolean OR merge", () => {
  const result = mergeUserRestaurantRecords(
    { ...base, saved: true, updatedAt: "2026-02-01T00:00:00.000Z" },
    { ...base, visited: true, updatedAt: "2026-01-15T00:00:00.000Z" },
  );
  assert.equal(result.record.saved, true);
  assert.equal(result.record.visited, true);
});

test("favorite dishes union without duplicates", () => {
  const result = mergeUserRestaurantRecords(
    { ...base, favoriteDishes: ["Tasting menu", "wine"] },
    { ...base, favoriteDishes: ["Wine", "bread"] },
  );
  assert.deepEqual(result.record.favoriteDishes, [
    "Tasting menu",
    "wine",
    "bread",
  ]);
});

test("conflicting notes retain newer and report conflict", () => {
  const result = mergeUserRestaurantRecords(
    {
      ...base,
      notes: "local note",
      updatedAt: "2026-03-01T00:00:00.000Z",
    },
    {
      ...base,
      notes: "cloud note",
      updatedAt: "2026-02-01T00:00:00.000Z",
    },
  );
  assert.equal(result.record.notes, "local note");
  assert.equal(result.conflicts.length, 1);
  assert.equal(result.conflicts[0].retained, "local");
});
