import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { RestaurantMap } from "@/components/map/RestaurantMap";
import { PassportClientShell } from "@/components/passport/PassportClientShell";
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
    <div className="border-b border-border">
      <Container className="py-6 sm:py-10">
        <p className="font-sans text-xs uppercase tracking-[0.18em] text-burgundy">
          Map
        </p>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
          Restaurant map
        </h1>
        <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink-muted">
          Markers use batch-geocoded, approved coordinates stored in first-party
          data. Restaurants still awaiting location verification remain in the
          list without a marker. The map works without location permission.
        </p>

        <div className="mt-6">
          <PassportClientShell restaurants={allRestaurants}>
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
          </PassportClientShell>
        </div>
      </Container>
    </div>
  );
}
