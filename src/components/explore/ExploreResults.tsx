import { RestaurantCompactCard } from "@/components/restaurant/RestaurantCompactCard";
import { RestaurantDiscoveryCard } from "@/components/restaurant/RestaurantDiscoveryCard";
import type { ExploreView } from "@/lib/data/explore";
import type { Restaurant } from "@/lib/data/types";
import type { ReservationSurface } from "@/lib/reservations/types";

type ExploreResultsProps = {
  restaurants: Restaurant[];
  view: ExploreView;
  surface?: ReservationSurface;
};

export function ExploreResults({
  restaurants,
  view,
  surface,
}: ExploreResultsProps) {
  const listSurface = surface ?? "explore_list";
  const gridSurface = surface ?? "explore_grid";

  if (view === "list") {
    return (
      <ul className="divide-y divide-border border border-border bg-bg-elevated/40 px-4 sm:px-5">
        {restaurants.map((restaurant) => (
          <li key={restaurant.slug}>
            <RestaurantCompactCard
              restaurant={restaurant}
              surface={listSurface}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {restaurants.map((restaurant) => (
        <li key={restaurant.slug}>
          <RestaurantDiscoveryCard
            restaurant={restaurant}
            surface={gridSurface}
          />
        </li>
      ))}
    </ul>
  );
}
