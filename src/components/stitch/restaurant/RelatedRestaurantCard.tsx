import type { RestaurantCardModel } from "./models";
import { RestaurantDiscoveryCard } from "./RestaurantDiscoveryCard";

type RelatedRestaurantCardProps = {
  model: RestaurantCardModel;
  className?: string;
};

/**
 * Related section card — distinct contract, reuses discovery presentation.
 * No Google content.
 */
export function RelatedRestaurantCard({
  model,
  className = "",
}: RelatedRestaurantCardProps) {
  return (
    <div data-restaurant-card="related">
      <RestaurantDiscoveryCard
        model={{ ...model, surface: model.surface || "related_restaurant" }}
        className={className}
      />
    </div>
  );
}
