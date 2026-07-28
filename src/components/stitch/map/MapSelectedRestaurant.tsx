"use client";

import Link from "next/link";
import {
  ReservationAction,
  SaveAction,
  MichelinDistinction,
} from "@/components/stitch/restaurant";
import { MapSelectedGoogleSection } from "./MapSelectedGoogleSection";
import type { MapSelectedModel } from "./models";

type MapSelectedRestaurantProps = {
  selected: MapSelectedModel;
  surface: "map_marker" | "map_mobile_sheet";
  showGoogle: boolean;
  showAddress?: boolean;
};

export function MapSelectedRestaurant({
  selected,
  surface,
  showGoogle,
  showAddress = false,
}: MapSelectedRestaurantProps) {
  const { restaurant, reservation, googlePlaceId, locationPending } = selected;

  return (
    <div data-map-selected className="flex flex-col">
      <div className="mb-2 flex items-center justify-between gap-2">
        <MichelinDistinction stars={restaurant.stars} variant="row" showLabel />
        <span className="dp-label-caps tracking-widest text-dp-ink-muted">
          Selected
        </span>
      </div>
      <h2 className="font-display text-[1.75rem] leading-none text-dp-primary md:text-[2rem]">
        {restaurant.name}
      </h2>
      <p className="dp-body-md mt-2 text-dp-ink-secondary">
        {restaurant.cuisine} · {restaurant.city}, {restaurant.stateCode}
        {restaurant.price ? ` · ${restaurant.price}` : ""}
      </p>
      {locationPending ? (
        <p className="mt-2 font-sans text-xs text-dp-burgundy">
          Location verification pending — listed without a map marker.
        </p>
      ) : null}
      {showAddress ? (
        <p className="mt-2 font-sans text-sm text-dp-ink-muted">
          {restaurant.address}
        </p>
      ) : null}

      <div className="mt-4 mb-4 flex flex-wrap items-center gap-3">
        <ReservationAction
          restaurantSlug={restaurant.slug}
          action={reservation}
          surface={surface}
          variant="primary"
          className="min-w-0 flex-1"
        />
        <SaveAction restaurantSlug={restaurant.slug} variant="compact" />
        <Link
          href={`/restaurants/${restaurant.slug}`}
          className="inline-flex h-12 min-h-11 items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-outline-variant px-6 font-sans text-[14px] font-semibold text-dp-primary no-underline transition-colors hover:border-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        >
          Details
        </Link>
      </div>

      {showGoogle ? (
        <MapSelectedGoogleSection
          restaurantSlug={restaurant.slug}
          placeId={googlePlaceId}
          enabled
        />
      ) : null}
    </div>
  );
}
