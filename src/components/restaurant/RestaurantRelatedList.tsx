import Link from "next/link";
import { RestaurantCompactCard } from "@/components/restaurant/RestaurantCompactCard";
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
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        <p className="mt-3 font-sans text-sm text-ink-muted">{emptyNote}</p>
      </section>
    ) : null;
  }

  return (
    <section className="mt-12 border-t border-border pt-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        <Link
          href="/explore"
          className="font-sans text-sm text-forest underline underline-offset-4"
        >
          Explore all
        </Link>
      </div>
      <ul className="mt-4 divide-y divide-border border border-border bg-bg-elevated/40 px-4 sm:px-5">
        {restaurants.map((restaurant) => (
          <li key={restaurant.slug}>
            <RestaurantCompactCard restaurant={restaurant} />
          </li>
        ))}
      </ul>
    </section>
  );
}
