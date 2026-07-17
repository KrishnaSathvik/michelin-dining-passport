import type { Metadata } from "next";
import { RestaurantMap } from "@/components/map/RestaurantMap";
import { MapLoadingState } from "@/components/stitch/map";
import { MapWorkspaceShell } from "@/components/shell/MapWorkspaceShell";
import { getExploreFacets } from "@/lib/data/explore";
import { getMapRestaurants } from "@/lib/data/geocodes";
import { getRestaurants } from "@/lib/data/restaurants";
import { buildPageMetadata } from "@/lib/seo/metadata";

type MapPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildPageMetadata({
  title: "Map",
  description:
    "Map Michelin-starred restaurants across the United States. Coordinates come from batch geocoding, not live page-load lookups.",
  path: "/map",
});

/**
 * Map — Stitch dining_passport_map_workspace composition (Phase 6).
 * Domain logic remains in RestaurantMap + MapCanvas.
 */
export default async function MapPage({ searchParams }: MapPageProps) {
  const params = await searchParams;
  const restaurants = getMapRestaurants();
  const allRestaurants = getRestaurants();
  const facets = getExploreFacets(allRestaurants);

  const proof =
    process.env.NODE_ENV !== "production"
      ? typeof params.proof === "string"
        ? params.proof
        : undefined
      : undefined;

  if (proof === "loading") {
    return (
      <MapWorkspaceShell>
        <MapLoadingState />
      </MapWorkspaceShell>
    );
  }

  return (
    <MapWorkspaceShell>
      <RestaurantMap
        restaurants={restaurants}
        initialQuery={params}
        facetOptions={{
          states: facets.states.map((state) => ({
            value: state.value,
            label: state.label,
          })),
          cuisines: facets.cuisines.map((cuisine) => ({
            value: cuisine.value,
            label: cuisine.label,
          })),
        }}
      />
    </MapWorkspaceShell>
  );
}
