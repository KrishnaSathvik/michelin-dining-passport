import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { RestaurantMap } from "@/components/map/RestaurantMap";
import { PassportClientShell } from "@/components/passport/PassportClientShell";
import { getMappableRestaurants } from "@/lib/data/geocodes";
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
  // Include uncertain for client toggle; map hides them by default.
  const restaurants = getMappableRestaurants({ includeUncertain: true });
  const allRestaurants = getRestaurants();

  return (
    <div className="border-b border-border">
      <Container className="py-10 sm:py-14">
        <p className="font-sans text-xs uppercase tracking-[0.18em] text-burgundy">
          Map
        </p>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
          Restaurant map
        </h1>
        <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink-muted">
          Markers use batch-geocoded coordinates stored in first-party data.
          Uncertain matches stay hidden until reviewed. The map works without
          location permission.
        </p>
        <p className="mt-3 font-sans text-sm text-ink-muted">
          Provider decision: MapLibre + compatible tiles. See{" "}
          <code className="text-ink">docs/adr/0001-map-provider.md</code>.
        </p>

        <div className="mt-8">
          <PassportClientShell restaurants={allRestaurants}>
            <RestaurantMap restaurants={restaurants} initialQuery={params} />
          </PassportClientShell>
        </div>
      </Container>
    </div>
  );
}
