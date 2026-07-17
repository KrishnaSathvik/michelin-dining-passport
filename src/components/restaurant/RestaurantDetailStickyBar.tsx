"use client";

import type { Restaurant } from "@/lib/data/types";
import type { RestaurantReservation } from "@/lib/reservations/types";
import { ReservationButton } from "@/components/restaurant/ReservationButton";
import { SaveRestaurantButton } from "@/components/restaurant/SaveRestaurantButton";

type RestaurantDetailStickyBarProps = {
  restaurant: Restaurant;
  reservation: RestaurantReservation | null;
};

/** Mobile-only sticky reservation + save bar for restaurant detail. */
export function RestaurantDetailStickyBar({
  restaurant,
  reservation,
}: RestaurantDetailStickyBarProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 px-4 py-3 backdrop-blur-sm lg:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-lg items-center gap-2">
        <ReservationButton
          restaurant={restaurant}
          reservation={reservation}
          surface="restaurant_detail"
          variant="full"
          showProvider={false}
          className="min-w-0 flex-1 rounded-[var(--radius-md)]"
        />
        <SaveRestaurantButton restaurantSlug={restaurant.slug} />
      </div>
    </div>
  );
}
