"use client";

import { useEffect, useState } from "react";
import { ReservationAction, SaveAction } from "@/components/stitch/restaurant";
import type { RestaurantDetailModel } from "./models";

type RestaurantDetailStickyBarProps = {
  restaurant: RestaurantDetailModel;
};

/**
 * Mobile sticky reservation + save bar. Hidden on lg+ and while dialogs open.
 */
export function RestaurantDetailStickyBar({
  restaurant,
}: RestaurantDetailStickyBarProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      setDialogOpen(Boolean(document.querySelector('[role="dialog"][aria-modal="true"]')));
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-modal", "open"],
    });
    return () => observer.disconnect();
  }, []);

  if (dialogOpen) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-dp-border bg-dp-surface/95 px-4 py-3 backdrop-blur-sm lg:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      data-restaurant-sticky-bar
    >
      <div className="mx-auto flex max-w-lg items-center gap-2">
        <ReservationAction
          restaurantSlug={restaurant.slug}
          action={restaurant.reservation}
          surface="restaurant_detail"
          variant="primary"
          showProvider={false}
          analyticsProvider={restaurant.reservationProvider}
          className="min-w-0 flex-1"
        />
        <SaveAction restaurantSlug={restaurant.slug} variant="compact" />
      </div>
    </div>
  );
}
