/**
 * Browser-safe Google Places UI Kit configuration.
 * Never read GOOGLE_PLACES_MATCHING_API_KEY here — that key is server/CLI only.
 */

export type GooglePlacesUiKitAvailability =
  | { status: "ready" }
  | { status: "disabled" }
  | { status: "missing_key" };

function readFlag(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

export function isGooglePlacesUiKitEnabled(): boolean {
  return readFlag(process.env.NEXT_PUBLIC_GOOGLE_PLACES_UI_KIT_ENABLED);
}

export function getGoogleMapsBrowserKey(): string | null {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY?.trim();
  return key ? key : null;
}

export function getGooglePlacesUiKitAvailability(): GooglePlacesUiKitAvailability {
  if (!isGooglePlacesUiKitEnabled()) {
    return { status: "disabled" };
  }
  if (!getGoogleMapsBrowserKey()) {
    return { status: "missing_key" };
  }
  return { status: "ready" };
}

export const GOOGLE_PLACES_UI_KIT_LOAD_TIMEOUT_MS = 20_000;

export const GOOGLE_PLACES_UNAVAILABLE_MESSAGE =
  "Live photos and Google place details are currently unavailable.";
