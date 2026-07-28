import type { Metadata } from "next";
import { RestaurantMap } from "@/components/map/RestaurantMap";
import { MapWorkspaceShell } from "@/components/shell/MapWorkspaceShell";
import { getMapRestaurants } from "@/lib/data/geocodes";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Restaurant Map",
  description:
    "Map Michelin-starred restaurants across the United States. Coordinates come from batch geocoding, not live page-load lookups.",
  path: "/map",
});

/**
 * Map — a single full-bleed U.S. map of Michelin pins.
 * Domain logic lives in RestaurantMap + MapCanvas.
 */
export default function MapPage() {
  const restaurants = getMapRestaurants();

  return (
    <MapWorkspaceShell>
      <RestaurantMap restaurants={restaurants} />
    </MapWorkspaceShell>
  );
}
