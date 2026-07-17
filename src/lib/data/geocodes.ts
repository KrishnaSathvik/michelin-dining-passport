import geocodeDataset from "../../../data/geocodes.json";
import overrideDataset from "../../../data/geocode-overrides.json";
import { getRestaurants } from "./restaurants";
import type { Restaurant } from "./types";

export type ManualReviewStatus =
  | "auto_approved"
  | "manually_approved"
  | "manually_corrected"
  | "needs_review"
  | "unmatched"
  | "rejected"
  | string;

export type GeocodeRecord = {
  restaurantSlug: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  confidence: "high" | "medium" | "low" | "none" | string;
  matchType?: string;
  displayName?: string;
  provider: string;
  providerPlaceId?: string;
  geocodedAt: string;
  manualReviewStatus?: ManualReviewStatus;
  approved: boolean;
  uncertain: boolean;
  needsManualCorrection?: boolean;
  notes?: string;
  rawType?: string;
  sharedAddressGroup?: string[];
  overrideApplied?: boolean;
};

export type GeocodeOverride = {
  restaurantSlug: string;
  latitude: number;
  longitude: number;
  reason: string;
  verificationSource: string;
  verifiedDate: string;
};

type GeocodeDataset = {
  version: number;
  updatedAt?: string;
  records: Record<string, GeocodeRecord>;
};

type OverrideDataset = {
  version: number;
  updatedAt?: string;
  overrides: GeocodeOverride[];
};

const data = geocodeDataset as GeocodeDataset;
const overrides = overrideDataset as OverrideDataset;

export type MapRestaurant = Restaurant & {
  geocode: GeocodeRecord;
  latitude: number | null;
  longitude: number | null;
  hasApprovedCoordinates: boolean;
  locationPending: boolean;
};

export type MappableRestaurant = MapRestaurant & {
  latitude: number;
  longitude: number;
  hasApprovedCoordinates: true;
};

export function isFiniteCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function getGeocodeOverrides(): GeocodeOverride[] {
  return Array.isArray(overrides.overrides) ? overrides.overrides : [];
}

export function getOverrideBySlug(slug: string): GeocodeOverride | undefined {
  return getGeocodeOverrides().find((item) => item.restaurantSlug === slug);
}

export function getRawGeocodeRecords(): Record<string, GeocodeRecord> {
  return data.records ?? {};
}

export function applyGeocodeOverride(
  record: GeocodeRecord,
  override: GeocodeOverride | undefined,
): GeocodeRecord {
  if (!override) return record;
  if (
    !isFiniteCoordinate(override.latitude) ||
    !isFiniteCoordinate(override.longitude)
  ) {
    return record;
  }
  return {
    ...record,
    latitude: override.latitude,
    longitude: override.longitude,
    approved: true,
    uncertain: false,
    needsManualCorrection: false,
    confidence: record.confidence === "none" ? "high" : record.confidence,
    matchType: "manual_override",
    manualReviewStatus: "manually_corrected",
    notes: [record.notes, override.reason].filter(Boolean).join(" · "),
    overrideApplied: true,
  };
}

/** Provider records with approved overrides applied. */
export function getGeocodeRecords(): Record<string, GeocodeRecord> {
  const records: Record<string, GeocodeRecord> = {};
  for (const [slug, record] of Object.entries(getRawGeocodeRecords())) {
    records[slug] = applyGeocodeOverride(record, getOverrideBySlug(slug));
  }
  return records;
}

export function getGeocodeUpdatedAt(): string | undefined {
  return data.updatedAt;
}

function hasApprovedCoordinates(geocode: GeocodeRecord): boolean {
  return (
    Boolean(geocode.approved) &&
    !geocode.uncertain &&
    isFiniteCoordinate(geocode.latitude) &&
    isFiniteCoordinate(geocode.longitude)
  );
}

export function getMapRestaurants(): MapRestaurant[] {
  const records = getGeocodeRecords();

  return getRestaurants().map((restaurant) => {
    const fallback: GeocodeRecord = {
      restaurantSlug: restaurant.slug,
      address: restaurant.address,
      latitude: null,
      longitude: null,
      confidence: "none",
      matchType: "missing_record",
      displayName: restaurant.address,
      provider: "none",
      geocodedAt: "",
      manualReviewStatus: "unmatched",
      approved: false,
      uncertain: true,
      needsManualCorrection: true,
    };
    const geocode = records[restaurant.slug] ?? fallback;
    const approved = hasApprovedCoordinates(geocode);

    return {
      ...restaurant,
      geocode,
      latitude: geocode.latitude,
      longitude: geocode.longitude,
      hasApprovedCoordinates: approved,
      locationPending: !approved,
    };
  });
}

export function getMappableRestaurants(): MappableRestaurant[] {
  return getMapRestaurants().flatMap((restaurant) => {
    if (
      !restaurant.hasApprovedCoordinates ||
      !isFiniteCoordinate(restaurant.latitude) ||
      !isFiniteCoordinate(restaurant.longitude)
    ) {
      return [];
    }
    return [
      {
        ...restaurant,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        hasApprovedCoordinates: true as const,
      },
    ];
  });
}

export function restaurantInBounds(
  restaurant: Pick<
    MapRestaurant,
    "latitude" | "longitude" | "hasApprovedCoordinates"
  >,
  bounds: { west: number; south: number; east: number; north: number },
): boolean {
  if (
    !restaurant.hasApprovedCoordinates ||
    !isFiniteCoordinate(restaurant.latitude) ||
    !isFiniteCoordinate(restaurant.longitude)
  ) {
    return false;
  }
  return (
    restaurant.longitude >= bounds.west &&
    restaurant.longitude <= bounds.east &&
    restaurant.latitude >= bounds.south &&
    restaurant.latitude <= bounds.north
  );
}

export function findSharedCoordinateGroups(
  restaurants: readonly MapRestaurant[],
): Map<string, string[]> {
  const byCoord = new Map<string, string[]>();
  for (const restaurant of restaurants) {
    if (
      !restaurant.hasApprovedCoordinates ||
      !isFiniteCoordinate(restaurant.latitude) ||
      !isFiniteCoordinate(restaurant.longitude)
    ) {
      continue;
    }
    const key = `${restaurant.latitude.toFixed(6)},${restaurant.longitude.toFixed(6)}`;
    const group = byCoord.get(key) ?? [];
    group.push(restaurant.slug);
    byCoord.set(key, group);
  }
  for (const [key, group] of [...byCoord.entries()]) {
    if (group.length < 2) byCoord.delete(key);
  }
  return byCoord;
}

/** Small visual offset so co-located restaurants remain distinct markers. */
export function offsetSharedCoordinates(
  restaurants: readonly MappableRestaurant[],
): MappableRestaurant[] {
  const groups = new Map<string, MappableRestaurant[]>();
  for (const restaurant of restaurants) {
    const key = `${restaurant.latitude.toFixed(6)},${restaurant.longitude.toFixed(6)}`;
    const group = groups.get(key) ?? [];
    group.push(restaurant);
    groups.set(key, group);
  }

  return restaurants.map((restaurant) => {
    const key = `${restaurant.latitude.toFixed(6)},${restaurant.longitude.toFixed(6)}`;
    const group = groups.get(key) ?? [restaurant];
    if (group.length < 2) return restaurant;
    const index = group.findIndex((item) => item.slug === restaurant.slug);
    const angle = (2 * Math.PI * index) / group.length;
    const meters = 12;
    const latOffset = (meters / 111_320) * Math.cos(angle);
    const lngOffset =
      (meters / (111_320 * Math.cos((restaurant.latitude * Math.PI) / 180))) *
      Math.sin(angle);
    return {
      ...restaurant,
      latitude: restaurant.latitude + latOffset,
      longitude: restaurant.longitude + lngOffset,
    };
  });
}
