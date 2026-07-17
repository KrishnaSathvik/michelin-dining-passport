"use client";

import {
  analyticsProviderFromAction,
  trackReservationClicked,
} from "@/lib/reservations/analytics";
import { getRestaurantReservationAction } from "@/lib/reservations/resolve";
import type {
  ReservationSurface,
  RestaurantReservation,
} from "@/lib/reservations/types";
import type { Restaurant } from "@/lib/data/types";

type ReservationButtonProps = {
  restaurant: Restaurant;
  reservation?: RestaurantReservation | null;
  variant?: "compact" | "full";
  showProvider?: boolean;
  surface: ReservationSurface;
  className?: string;
};

export function ReservationButton({
  restaurant,
  reservation = null,
  variant = "compact",
  showProvider = true,
  surface,
  className = "",
}: ReservationButtonProps) {
  const action = getRestaurantReservationAction(restaurant, reservation);

  const base =
    variant === "full"
      ? "inline-flex min-h-11 flex-col items-center justify-center border border-forest bg-forest px-5 py-2.5 text-white transition-colors hover:bg-forest-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      : "inline-flex min-h-11 min-w-11 flex-col items-center justify-center border border-border bg-bg px-4 py-2 text-ink transition-colors hover:border-forest hover:text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

  return (
    <a
      href={action.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} no-underline ${className}`}
      title={`${action.label}${action.providerLabel ? ` — ${action.providerLabel}` : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        trackReservationClicked({
          restaurantSlug: restaurant.slug,
          provider:
            action.isDirectBooking && reservation
              ? reservation.provider
              : analyticsProviderFromAction(action.source),
          surface,
          isDirectBooking: action.isDirectBooking,
        });
      }}
    >
      <span className="font-sans text-[15px] font-medium leading-tight">
        {action.label}
        <span aria-hidden="true"> ↗</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </span>
      {showProvider && action.providerLabel ? (
        <span
          className={`font-sans text-xs leading-tight ${
            variant === "full" ? "text-white/85" : "text-ink-muted"
          }`}
        >
          {action.providerLabel}
        </span>
      ) : null}
    </a>
  );
}
