import { RestaurantDiscoveryCard } from "@/components/stitch/restaurant";
import type { RestaurantCardModel } from "@/components/stitch/restaurant";

type TaxonomyRestaurantGridProps = {
  restaurants: RestaurantCardModel[];
  columns?: "discovery" | "dense";
};

export function TaxonomyRestaurantGrid({
  restaurants,
  columns = "discovery",
}: TaxonomyRestaurantGridProps) {
  if (restaurants.length === 0) {
    return (
      <p className="font-sans text-base text-dp-ink-muted">
        No restaurants match this taxonomy in the current roster.
      </p>
    );
  }

  return (
    <ul
      className={
        columns === "dense"
          ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          : "grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      }
      data-taxonomy-section="restaurants"
    >
      {restaurants.map((card) => (
        <li key={card.slug}>
          <RestaurantDiscoveryCard model={card} />
        </li>
      ))}
    </ul>
  );
}
