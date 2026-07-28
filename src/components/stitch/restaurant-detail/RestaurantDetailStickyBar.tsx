"use client";

import { useEffect, useState } from "react";
import { ReservationAction } from "@/components/stitch/restaurant";
import type { RestaurantDetailModel } from "./models";
import { RestaurantJourneySaveButton } from "./RestaurantJourneyActions";

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
  const [primaryActionsVisible, setPrimaryActionsVisible] = useState(true);

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

  // The primary actions only mount once the Passport store has loaded, so the
  // element can be absent on first paint. Re-run until it exists, otherwise the
  // observer never attaches and the sticky bar stays permanently hidden.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    let observer: IntersectionObserver | null = null;
    const attach = () => {
      const primaryActions = document.querySelector(
        "[data-restaurant-journey-actions]",
      );
      if (!primaryActions) return false;
      observer = new IntersectionObserver(
        ([entry]) => setPrimaryActionsVisible(entry.isIntersecting),
        { threshold: 0.1 },
      );
      observer.observe(primaryActions);
      return true;
    };

    if (attach()) return () => observer?.disconnect();

    const mutations = new MutationObserver(() => {
      if (attach()) mutations.disconnect();
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      mutations.disconnect();
      observer?.disconnect();
    };
  }, []);

  if (dialogOpen || primaryActionsVisible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-dp-border bg-dp-surface/95 px-4 py-3 backdrop-blur-sm lg:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      data-restaurant-sticky-bar
    >
      <div className="mx-auto flex max-w-lg items-center gap-2">
        {restaurant.reservation.isDirectBooking ? (
          <ReservationAction
            restaurantSlug={restaurant.slug}
            action={restaurant.reservation}
            surface="restaurant_detail"
            variant="primary"
            showProvider={false}
            analyticsProvider={restaurant.reservationProvider}
            labelOverride="Reserve a table"
            className="min-w-0 flex-1"
          />
        ) : null}
        <RestaurantJourneySaveButton
          restaurantSlug={restaurant.slug}
          restaurantName={restaurant.name}
          className={restaurant.reservation.isDirectBooking ? "" : "w-full"}
        />
      </div>
    </div>
  );
}
