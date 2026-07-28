"use client";

import { useEffect, useState } from "react";
import { getGooglePlacesUiKitAvailability } from "@/lib/google-places/config";
import { loadGooglePlacesUiKit } from "@/lib/google-places/loader";

export type GooglePlacePhoto = {
  url: string;
  attribution: string | null;
};

export type GooglePlaceData = {
  photos: GooglePlacePhoto[];
  rating: number | null;
  userRatingCount: number | null;
  weekdayDescriptions: string[];
  openNow: boolean | null;
  phone: string | null;
  googleMapsUri: string | null;
};

export type GooglePlaceState =
  | { status: "idle" | "loading" | "unavailable" }
  | { status: "ready"; data: GooglePlaceData };

/** Minimal shape of the Maps JS Place API fields we read. */
type PlacePhoto = {
  getURI: (options?: { maxWidth?: number; maxHeight?: number }) => string;
  authorAttributions?: { displayName?: string }[];
};
type PlaceInstance = {
  photos?: PlacePhoto[];
  rating?: number | null;
  userRatingCount?: number | null;
  regularOpeningHours?: { weekdayDescriptions?: string[] } | null;
  nationalPhoneNumber?: string | null;
  googleMapsURI?: string | null;
  fetchFields: (options: { fields: string[] }) => Promise<unknown>;
  isOpen?: () => Promise<boolean | undefined>;
};
type PlaceConstructor = new (options: { id: string }) => PlaceInstance;

// One in-flight fetch per place id, shared across every consumer on the page
// (the hero gallery and the details info both read the same place).
const cache = new Map<string, Promise<GooglePlaceData | null>>();

async function fetchPlace(placeId: string): Promise<GooglePlaceData | null> {
  const loader = await loadGooglePlacesUiKit();
  if (loader.status !== "ready") return null;
  const maps = window.google?.maps as
    | { importLibrary: (name: string) => Promise<unknown> }
    | undefined;
  if (!maps) return null;

  const lib = (await maps.importLibrary("places")) as { Place: PlaceConstructor };
  const place = new lib.Place({ id: placeId });
  await place.fetchFields({
    fields: [
      "photos",
      "rating",
      "userRatingCount",
      "regularOpeningHours",
      "nationalPhoneNumber",
      "googleMapsURI",
    ],
  });

  let openNow: boolean | null = null;
  try {
    if (typeof place.isOpen === "function") {
      const value = await place.isOpen();
      openNow = typeof value === "boolean" ? value : null;
    }
  } catch {
    openNow = null;
  }

  const photos = (place.photos ?? []).slice(0, 10).map((photo) => ({
    url: photo.getURI({ maxWidth: 1600, maxHeight: 1200 }),
    attribution:
      photo.authorAttributions
        ?.map((author) => author.displayName)
        .filter(Boolean)
        .join(", ") || null,
  }));

  return {
    photos,
    rating: typeof place.rating === "number" ? place.rating : null,
    userRatingCount:
      typeof place.userRatingCount === "number" ? place.userRatingCount : null,
    weekdayDescriptions: place.regularOpeningHours?.weekdayDescriptions ?? [],
    openNow,
    phone: place.nationalPhoneNumber ?? null,
    googleMapsUri: place.googleMapsURI ?? null,
  };
}

/**
 * Fetches live Google place data (photos, rating, hours, phone) for a detail
 * page. Result is cached per place id so multiple consumers share one request.
 */
export function useGooglePlace(placeId: string | null): GooglePlaceState {
  const [result, setResult] = useState<{
    id: string;
    data: GooglePlaceData | null;
  } | null>(null);

  const canFetch =
    Boolean(placeId) &&
    getGooglePlacesUiKitAvailability().status === "ready";

  useEffect(() => {
    if (!placeId || !canFetch) return;

    let cancelled = false;
    let promise = cache.get(placeId);
    if (!promise) {
      promise = fetchPlace(placeId).catch(() => null);
      cache.set(placeId, promise);
    }
    void promise.then((data) => {
      if (!cancelled) setResult({ id: placeId, data });
    });

    return () => {
      cancelled = true;
    };
  }, [placeId, canFetch]);

  // Derive the synchronous states during render to avoid setState-in-effect.
  if (!canFetch) return { status: "unavailable" };
  if (result && result.id === placeId) {
    return result.data
      ? { status: "ready", data: result.data }
      : { status: "unavailable" };
  }
  return { status: "loading" };
}
