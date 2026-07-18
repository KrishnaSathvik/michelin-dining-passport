import { NotFoundState } from "@/components/stitch/system";

/**
 * Shared not-found language for restaurant detail recovery UIs.
 * Unknown slugs still use App Router `notFound()`.
 */
export function RestaurantDetailUnavailable() {
  return (
    <div data-restaurant-detail-unavailable>
      <NotFoundState />
    </div>
  );
}
