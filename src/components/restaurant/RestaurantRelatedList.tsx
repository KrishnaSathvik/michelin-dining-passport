import Link from "next/link";
import { RestaurantDiscoveryCard } from "@/components/restaurant/RestaurantDiscoveryCard";
import type { Restaurant } from "@/lib/data/types";

type RestaurantRelatedListProps = {
  title: string;
  restaurants: Restaurant[];
  emptyNote?: string;
};

export function RestaurantRelatedList({
  title,
  restaurants,
  emptyNote,
}: RestaurantRelatedListProps) {
  if (restaurants.length === 0) {
    return emptyNote ? (
      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-display text-2xl text-ink sm:text-3xl">{title}</h2>
        <p className="mt-3 font-sans text-sm text-ink-muted">{emptyNote}</p>
      </section>
    ) : null;
  }

  return (
    <section className="mt-12 border-t border-border pt-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-2xl text-ink sm:text-3xl">{title}</h2>
        <Link
          href="/explore"
          className="font-sans text-sm text-forest no-underline hover:underline"
        >
          Explore all
        </Link>
      </div>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((restaurant) => (
          <li key={restaurant.slug}>
            <RestaurantDiscoveryCard
              restaurant={restaurant}
              surface="related_restaurant"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
