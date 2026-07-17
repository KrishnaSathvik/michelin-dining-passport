"use client";

import { MapSelectedGooglePlace } from "@/components/google-places/MapSelectedGooglePlace";

type MapSelectedGoogleSectionProps = {
  restaurantSlug: string;
  placeId: string | null;
  enabled?: boolean;
};

/**
 * Stitch selected-panel frame for the existing compact Google Places wrapper.
 * Mount gates remain in the caller (desktop selection / mobile expanded only).
 */
export function MapSelectedGoogleSection({
  restaurantSlug,
  placeId,
  enabled = true,
}: MapSelectedGoogleSectionProps) {
  if (!enabled) return null;

  return (
    <div className="border-t border-dp-outline-variant pt-4">
      <MapSelectedGooglePlace
        restaurantSlug={restaurantSlug}
        placeId={placeId}
        enabled
      />
    </div>
  );
}
