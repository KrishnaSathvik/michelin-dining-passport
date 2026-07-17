import type { Metadata } from "next";
import { RestaurantMap } from "@/components/map/RestaurantMap";
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

export default async function MapPage({ searchParams }: MapPageProps) {
  const params = await searchParams;
  const restaurants = getMapRestaurants();
  const allRestaurants = getRestaurants();
  const facets = getExploreFacets(allRestaurants);

  return (
    <div className="h-[calc(100dvh-4rem)] sm:h-[calc(100dvh-4.5rem)]">
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
    </div>
  );
}
