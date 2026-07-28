/**
 * Development-only counter for intended UI Kit mounts.
 * Estimates integration behavior; not billing-authoritative.
 */

export type GooglePlacesQueryIntent = {
  page: string;
  componentType: "full" | "compact";
  restaurantSlug: string;
  placeIdSuffix: string;
  timestamp: string;
};

const STORAGE_KEY = "mdp:google-places-query-intents";

function placeIdSuffix(placeId: string): string {
  return placeId.length <= 8 ? placeId : placeId.slice(-8);
}

export function recordGooglePlacesQueryIntent(input: {
  page: string;
  componentType: "full" | "compact";
  restaurantSlug: string;
  placeId: string;
}): GooglePlacesQueryIntent | null {
  if (typeof window === "undefined") return null;
  if (process.env.NODE_ENV !== "development") return null;

  const intent: GooglePlacesQueryIntent = {
    page: input.page,
    componentType: input.componentType,
    restaurantSlug: input.restaurantSlug,
    placeIdSuffix: placeIdSuffix(input.placeId),
    timestamp: new Date().toISOString(),
  };

  try {
    const existing = window.sessionStorage.getItem(STORAGE_KEY);
    const list: GooglePlacesQueryIntent[] = existing
      ? (JSON.parse(existing) as GooglePlacesQueryIntent[])
      : [];
    list.push(intent);
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-200)));
  } catch {
    // sessionStorage may be unavailable; logging still proceeds
  }

  console.info("[google-places-ui-kit] query-intent", intent);
  window.dispatchEvent(
    new CustomEvent("mdp:google_places_query_intent", { detail: intent }),
  );

  return intent;
}

export function readGooglePlacesQueryIntents(): GooglePlacesQueryIntent[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = window.sessionStorage.getItem(STORAGE_KEY);
    return existing ? (JSON.parse(existing) as GooglePlacesQueryIntent[]) : [];
  } catch {
    return [];
  }
}
