import type { ReactNode } from "react";
import Link from "next/link";
import {
  MichelinDistinction,
  ReservationAction,
} from "@/components/stitch/restaurant";
import type { RestaurantDetailModel } from "./models";
import { RestaurantJourneyActions } from "./RestaurantJourneyActions";

type RestaurantIdentityContentProps = {
  restaurant: RestaurantDetailModel;
};

/**
 * Identity column (~42%): distinction, title, metadata, actions, journey.
 */
export function RestaurantIdentityContent({
  restaurant,
}: RestaurantIdentityContentProps) {
  const metaLinkClass =
    "text-dp-ink-secondary no-underline transition-colors hover:text-dp-primary hover:underline underline-offset-4";
  const metaItems: ReactNode[] = [];
  if (restaurant.cuisine) {
    metaItems.push(
      <Link
        key="cuisine"
        href={`/cuisines/${restaurant.cuisineSlug}`}
        className={metaLinkClass}
      >
        {restaurant.cuisine}
      </Link>,
    );
  }
  if (restaurant.locationLabel) {
    metaItems.push(
      <Link
        key="location"
        href={`/cities/${restaurant.citySlug}`}
        className={metaLinkClass}
      >
        {restaurant.locationLabel}
      </Link>,
    );
  }
  if (restaurant.price) {
    metaItems.push(<span key="price">{restaurant.price}</span>);
  }

  return (
    <div className="flex min-w-0 w-full flex-col py-2">
      <div className="mb-4">
        <Link
          href={`/stars/${restaurant.stars}`}
          className="inline-flex no-underline"
        >
          <MichelinDistinction
            stars={restaurant.stars}
            variant="detail"
            showLabel
          />
        </Link>
      </div>

      <h1
        id="restaurant-identity-heading"
        className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em] text-dp-ink"
      >
        {restaurant.name}
      </h1>

      {metaItems.length > 0 ? (
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-base text-dp-ink-secondary">
          {metaItems.map((item, index) => (
            <span key={index} className="inline-flex items-center gap-x-2">
              {index > 0 ? (
                <span aria-hidden="true" className="text-dp-ink-muted">
                  •
                </span>
              ) : null}
              {item}
            </span>
          ))}
        </p>
      ) : null}

      {restaurant.address ? (
        <p className="mt-6 max-w-md font-sans text-base leading-relaxed text-dp-ink-secondary">
          {restaurant.address}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {restaurant.reservation.isDirectBooking ? (
          <ReservationAction
            restaurantSlug={restaurant.slug}
            action={restaurant.reservation}
            surface="restaurant_detail"
            variant="primary"
            analyticsProvider={restaurant.reservationProvider}
            labelOverride="Reserve a table"
            showProvider
            className="h-12 min-h-12 w-full px-8 sm:w-auto sm:min-w-[11rem]"
          />
        ) : null}
        {restaurant.showOfficialWebsite && restaurant.officialWebsite ? (
          <a
            href={restaurant.officialWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 min-h-12 w-full items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface px-8 font-sans text-base text-dp-primary no-underline transition-colors hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus sm:w-auto"
          >
            Official website
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : null}
        {restaurant.address ? (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.name}, ${restaurant.address}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-[var(--dp-radius-lg)] px-4 font-sans text-sm font-semibold text-dp-primary no-underline hover:bg-dp-soft sm:w-auto"
          >
            Get directions
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : null}
      </div>

      {restaurant.showMichelinGuide && restaurant.michelinGuideUrl ? (
        <p className="mt-4 font-sans text-sm text-dp-ink-muted">
          <a
            href={restaurant.michelinGuideUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:text-dp-primary hover:underline"
          >
            Michelin Guide reference
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      ) : null}

      <RestaurantJourneyActions
        restaurantSlug={restaurant.slug}
        restaurantName={restaurant.name}
      />
    </div>
  );
}
