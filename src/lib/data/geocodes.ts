import geocodeDataset from "../../../data/geocodes.json";
import { getRestaurants } from "./restaurants";
import type { Restaurant } from "./types";

export type GeocodeRecord = {
  restaurantSlug: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  confidence: "high" | "medium" | "low" | "none" | string;
  approved: boolean;
  uncertain: boolean;
  provider: string;
  providerPlaceId?: string;
  displayName?: string;
  geocodedAt: string;
  rawType?: string;
  sharedAddressGroup?: string[];
  needsManualCorrection?: boolean;
};

type GeocodeDataset = {
  version: number;
  updatedAt?: string;
  records: Record<string, GeocodeRecord>;
};

const data = geocodeDataset as GeocodeDataset;

export type MappableRestaurant = Restaurant & {
  latitude: number;
  longitude: number;
  geocode: GeocodeRecord;
};

export function getGeocodeRecords(): Record<string, GeocodeRecord> {
  return data.records ?? {};
}

export function getGeocodeUpdatedAt(): string | undefined {
  return data.updatedAt;
}

export function getMappableRestaurants(options?: {
  includeUncertain?: boolean;
}): MappableRestaurant[] {
  const includeUncertain = options?.includeUncertain ?? false;
  const records = getGeocodeRecords();

  return getRestaurants().flatMap((restaurant) => {
    const geocode = records[restaurant.slug];
    if (!geocode) return [];
    if (geocode.latitude == null || geocode.longitude == null) return [];
    if (!includeUncertain && (!geocode.approved || geocode.uncertain)) {
      return [];
    }

    return [
      {
        ...restaurant,
        latitude: geocode.latitude,
        longitude: geocode.longitude,
        geocode,
      },
    ];
  });
}
