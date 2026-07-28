"use client";

import Link from "next/link";
import { MichelinDistinction } from "@/components/stitch/restaurant";
import { RestaurantFallback } from "@/components/stitch/restaurant/RestaurantFallback";
import { GooglePlaceCardMedia } from "@/components/google-places/GooglePlaceCardMedia";
import type { MapRestaurant } from "@/lib/data/geocodes";

type MapPinCardProps = {
  restaurant: MapRestaurant;
  googlePlaceId: string | null;
  onClose: () => void;
};

/**
 * Single restaurant preview shown when a map pin is selected.
 * Photo + name + basic info; the whole card links to the detail page.
 * Deliberately minimal — no reservation/save actions, no live Google panel.
 */
export function MapPinCard({
  restaurant,
  googlePlaceId,
  onClose,
}: MapPinCardProps) {
  const meta = [
    restaurant.cuisine,
    `${restaurant.city}, ${restaurant.stateCode}`,
    restaurant.price || null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center p-4 sm:justify-start sm:p-6">
      <div
        className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
        data-map-pin-card
        role="dialog"
        aria-label="Selected restaurant preview"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <Link
          href={`/restaurants/${restaurant.slug}`}
          className="block no-underline focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-dp-focus"
          data-map-pin-card-link
        >
          {googlePlaceId ? (
            <GooglePlaceCardMedia
              placeId={googlePlaceId}
              restaurantSlug={restaurant.slug}
              page="/map"
              name={restaurant.name}
              seed={restaurant.slug}
              city={restaurant.city}
              stars={restaurant.stars}
              ratioClass="aspect-[16/9]"
              priority
            />
          ) : (
            <RestaurantFallback
              name={restaurant.name}
              seed={restaurant.slug}
              city={restaurant.city}
              stars={restaurant.stars}
              className="aspect-[16/9]"
            />
          )}

          <div className="p-4">
            <MichelinDistinction
              stars={restaurant.stars}
              variant="row"
              showLabel
            />
            <h2 className="mt-2 font-display text-[1.5rem] leading-tight text-dp-primary">
              {restaurant.name}
            </h2>
            <p className="dp-body-md mt-1 text-dp-ink-secondary">{meta}</p>
            <span className="mt-3 inline-flex items-center gap-1 font-sans text-[13px] font-semibold text-dp-primary">
              View details
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
