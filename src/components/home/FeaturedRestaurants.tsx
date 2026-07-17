import Link from "next/link";
import { Section } from "@/components/layout/Section";
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

  return (
    <Section
      eyebrow="Featured"
      title={homepageConfig.featuredSectionTitle}
      dek={homepageConfig.featuredSectionDek}
      className="bg-surface-soft"
    >
      <div className="space-y-10">
        <RestaurantEditorialCard restaurant={featured} />

        {discovery.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {discovery.map((restaurant) => (
              <RestaurantDiscoveryCard
                key={restaurant.slug}
                restaurant={restaurant}
                surface="homepage"
              />
            ))}
          </div>
        ) : null}

        <div>
          <Link
            href="/explore"
            className="font-sans text-[15px] font-medium text-forest no-underline hover:text-forest-deep"
          >
            View all restaurants →
          </Link>
        </div>
      </div>
    </Section>
  );
}
