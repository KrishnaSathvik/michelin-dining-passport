import { RestaurantCompactCard } from "@/components/restaurant/RestaurantCompactCard";
import { RestaurantDiscoveryCard } from "@/components/restaurant/RestaurantDiscoveryCard";
import type { ExploreView } from "@/lib/data/explore";
import type { Restaurant } from "@/lib/data/types";

type ExploreResultsProps = {
  restaurants: Restaurant[];
  view: ExploreView;
};

export function ExploreResults({ restaurants, view }: ExploreResultsProps) {
  if (view === "list") {
    return (
      <ul className="divide-y divide-border border border-border bg-bg-elevated/40 px-4 sm:px-5">
        {restaurants.map((restaurant) => (
          <li key={restaurant.slug}>
            <RestaurantCompactCard restaurant={restaurant} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {restaurants.map((restaurant) => (
        <li key={restaurant.slug}>
          <RestaurantDiscoveryCard restaurant={restaurant} />
        </li>
      ))}
    </ul>
  );
}
