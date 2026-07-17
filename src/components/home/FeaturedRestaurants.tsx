import { Section } from "@/components/layout/Section";
import { RestaurantCompactCard } from "@/components/restaurant/RestaurantCompactCard";
import { RestaurantDiscoveryCard } from "@/components/restaurant/RestaurantDiscoveryCard";
import { RestaurantEditorialCard } from "@/components/restaurant/RestaurantEditorialCard";
import { homepageConfig } from "@/config/homepage";
import type { Restaurant } from "@/lib/data/types";

type FeaturedRestaurantsProps = {
  restaurants: Restaurant[];
};

export function FeaturedRestaurants({ restaurants }: FeaturedRestaurantsProps) {
  if (restaurants.length === 0) return null;

  const [featured, ...rest] = restaurants;
  const discovery = rest.slice(0, 3);
  const compact = rest.slice(3);

  return (
    <Section
      eyebrow="Across the atlas"
      title={homepageConfig.featuredSectionTitle}
      dek={homepageConfig.featuredSectionDek}
    >
      <div className="space-y-10">
        <RestaurantEditorialCard restaurant={featured} />

        {discovery.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {discovery.map((restaurant) => (
              <RestaurantDiscoveryCard
                key={restaurant.slug}
                restaurant={restaurant}
              />
            ))}
          </div>
        ) : null}

        {compact.length > 0 ? (
          <div className="border border-border bg-bg-elevated/50 px-4 py-2 sm:px-6">
            <p className="border-b border-border py-3 font-sans text-xs uppercase tracking-[0.16em] text-ink-muted">
              More from this selection
            </p>
            {compact.map((restaurant) => (
              <RestaurantCompactCard
                key={restaurant.slug}
                restaurant={restaurant}
              />
            ))}
          </div>
        ) : null}
      </div>
    </Section>
  );
}
