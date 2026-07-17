import type { Restaurant } from "@/lib/data/types";
import { RestaurantImageFallback } from "./RestaurantImageFallback";

/**
 * @deprecated Prefer RestaurantMedia / RestaurantImageFallback.
 * Kept as a thin alias so existing imports keep working during the rebuild.
 */
export function RestaurantImagePlaceholder({
  restaurant,
  className = "",
  priorityVisual = false,
}: {
  restaurant: Pick<Restaurant, "name" | "city" | "stars">;
  className?: string;
  priorityVisual?: boolean;
}) {
  return (
    <RestaurantImageFallback
      restaurant={restaurant}
      className={className}
      priorityVisual={priorityVisual}
    />
  );
}
