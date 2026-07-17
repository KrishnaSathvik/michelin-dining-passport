import type { LocalCollection, UserRestaurantRecord } from "@/lib/passport/types";

export type MergeConflict = {
  restaurantSlug: string;
  field: "notes" | "rating";
  localValue: string | number | null;
  cloudValue: string | number | null;
  retained: "local" | "cloud";
  preservedElsewhere: boolean;
};

function newerTimestamp(a: string, b: string): string {
  return Date.parse(a) >= Date.parse(b) ? a : b;
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed.toLowerCase())) continue;
    seen.add(trimmed.toLowerCase());
    result.push(trimmed);
  }
  return result;
}

/**
 * Deterministic local/cloud merge for a user-restaurant record.
 *
 * Rules:
 * - Booleans are true if either source is true
 * - Non-null planned/visited dates are preserved (prefer newer updatedAt when both set)
 * - Favorite dishes are unioned without duplicates
 * - Personal rating prefers the most recently updated valid value
 * - Notes: nonempty values preserved; if both differ, keep newer as primary and report conflict
 */
export function mergeUserRestaurantRecords(
  local: UserRestaurantRecord | null | undefined,
  cloud: UserRestaurantRecord | null | undefined,
): { record: UserRestaurantRecord | null; conflicts: MergeConflict[] } {
  if (!local && !cloud) return { record: null, conflicts: [] };
  if (!local) return { record: cloud ?? null, conflicts: [] };
  if (!cloud) return { record: local, conflicts: [] };

  const conflicts: MergeConflict[] = [];
  const localNewer = Date.parse(local.updatedAt) >= Date.parse(cloud.updatedAt);

  let notes = local.notes.trim() || cloud.notes.trim();
  if (local.notes.trim() && cloud.notes.trim() && local.notes.trim() !== cloud.notes.trim()) {
    notes = localNewer ? local.notes : cloud.notes;
    conflicts.push({
      restaurantSlug: local.restaurantSlug,
      field: "notes",
      localValue: local.notes,
      cloudValue: cloud.notes,
      retained: localNewer ? "local" : "cloud",
      preservedElsewhere: true,
    });
  }

  let personalRating = local.personalRating ?? cloud.personalRating;
  if (
    local.personalRating !== null &&
    cloud.personalRating !== null &&
    local.personalRating !== cloud.personalRating
  ) {
    personalRating = localNewer ? local.personalRating : cloud.personalRating;
    conflicts.push({
      restaurantSlug: local.restaurantSlug,
      field: "rating",
      localValue: local.personalRating,
      cloudValue: cloud.personalRating,
      retained: localNewer ? "local" : "cloud",
      preservedElsewhere: true,
    });
  } else if (local.personalRating !== null && cloud.personalRating !== null) {
    personalRating = localNewer ? local.personalRating : cloud.personalRating;
  }

  const plannedFor =
    local.reservationPlannedFor && cloud.reservationPlannedFor
      ? localNewer
        ? local.reservationPlannedFor
        : cloud.reservationPlannedFor
      : local.reservationPlannedFor ?? cloud.reservationPlannedFor;

  const visitedOn =
    local.visitDate && cloud.visitDate
      ? localNewer
        ? local.visitDate
        : cloud.visitDate
      : local.visitDate ?? cloud.visitDate;

  const record: UserRestaurantRecord = {
    restaurantSlug: local.restaurantSlug,
    saved: local.saved || cloud.saved,
    wantToVisit: local.wantToVisit || cloud.wantToVisit,
    planned: local.planned || cloud.planned,
    visited: local.visited || cloud.visited,
    favorite: local.favorite || cloud.favorite,
    visitDate: visitedOn,
    personalRating,
    notes,
    favoriteDishes: uniqueStrings([
      ...local.favoriteDishes,
      ...cloud.favoriteDishes,
    ]),
    reservationPlannedFor: plannedFor,
    reservationProvider:
      local.reservationProvider?.trim() || cloud.reservationProvider?.trim() || null,
    reservationConfirmationNote:
      local.reservationConfirmationNote?.trim() ||
      cloud.reservationConfirmationNote?.trim() ||
      null,
    createdAt:
      Date.parse(local.createdAt) <= Date.parse(cloud.createdAt)
        ? local.createdAt
        : cloud.createdAt,
    updatedAt: newerTimestamp(local.updatedAt, cloud.updatedAt),
  };

  return { record, conflicts };
}

export function mergeCollections(
  local: LocalCollection[],
  cloud: LocalCollection[],
): LocalCollection[] {
  const byKey = new Map<string, LocalCollection>();

  for (const collection of cloud) {
    byKey.set(collection.id, collection);
    byKey.set(`slug:${collection.slug}`, collection);
  }

  for (const collection of local) {
    const existing =
      byKey.get(collection.id) ?? byKey.get(`slug:${collection.slug}`);
    if (!existing) {
      byKey.set(collection.id, collection);
      byKey.set(`slug:${collection.slug}`, collection);
      continue;
    }

    const merged: LocalCollection = {
      ...existing,
      name: existing.name || collection.name,
      description: existing.description || collection.description,
      private: existing.private && collection.private,
      coverRestaurantSlug:
        existing.coverRestaurantSlug ?? collection.coverRestaurantSlug,
      restaurantSlugs: uniqueStrings([
        ...existing.restaurantSlugs,
        ...collection.restaurantSlugs,
      ]),
      createdAt:
        Date.parse(existing.createdAt) <= Date.parse(collection.createdAt)
          ? existing.createdAt
          : collection.createdAt,
      updatedAt: newerTimestamp(existing.updatedAt, collection.updatedAt),
    };
    byKey.set(existing.id, merged);
    byKey.set(`slug:${merged.slug}`, merged);
  }

  const seen = new Set<string>();
  const result: LocalCollection[] = [];
  for (const value of byKey.values()) {
    if (seen.has(value.id)) continue;
    seen.add(value.id);
    result.push(value);
  }
  return result;
}
