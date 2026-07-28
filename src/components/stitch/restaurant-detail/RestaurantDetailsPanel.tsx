import type { ReactNode } from "react";
import Link from "next/link";
import {
  MichelinDistinction,
  ReservationAction,
} from "@/components/stitch/restaurant";
import type { RestaurantDetailModel } from "./models";
import { DirectionsIcon, GlobeIcon } from "./ActionIcons";
import { RestaurantGoogleInfo } from "./RestaurantGoogleInfo";
import { RestaurantJourneyActions } from "./RestaurantJourneyActions";

type RestaurantDetailsPanelProps = {
  restaurant: RestaurantDetailModel;
};

const tileClass = "min-w-0 border-b border-dp-border py-5 sm:pr-6";
const labelClass = "dp-label-caps text-dp-ink-muted";
const valueClass = "mt-2 font-sans text-base leading-relaxed text-dp-ink";

/**
 * Below-hero identity + details. Name and stars first, then actions, then a
 * single "Details" grid that combines first-party facts with live Google
 * facts (rating, hours, phone).
 */
export function RestaurantDetailsPanel({
  restaurant,
}: RestaurantDetailsPanelProps) {
  const metaLinkClass =
    "text-dp-ink-secondary no-underline transition-colors hover:text-dp-primary hover:underline underline-offset-4";
  const metaItems: ReactNode[] = [];
  if (restaurant.cuisine) {
    metaItems.push(
      <Link key="cuisine" href={`/cuisines/${restaurant.cuisineSlug}`} className={metaLinkClass}>
        {restaurant.cuisine}
      </Link>,
    );
  }
  if (restaurant.locationLabel) {
    metaItems.push(
      <Link key="location" href={`/cities/${restaurant.citySlug}`} className={metaLinkClass}>
        {restaurant.locationLabel}
      </Link>,
    );
  }
  if (restaurant.price) {
    metaItems.push(<span key="price">{restaurant.price}</span>);
  }

  const directionsHref = restaurant.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${restaurant.name}, ${restaurant.address}`,
      )}`
    : null;

  return (
    <section
      className="mb-[var(--dp-section)]"
      aria-labelledby="restaurant-identity-heading"
      data-restaurant-detail-panel
    >
      <div className="mb-4">
        <Link href={`/stars/${restaurant.stars}`} className="inline-flex no-underline">
          <MichelinDistinction stars={restaurant.stars} variant="detail" showLabel />
        </Link>
      </div>

      <h1
        id="restaurant-identity-heading"
        className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] tracking-[-0.02em] text-dp-ink"
      >
        {restaurant.name}
      </h1>

      {metaItems.length > 0 ? (
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-lg text-dp-ink-secondary">
          {metaItems.map((item, index) => (
            <span key={index} className="inline-flex items-center gap-x-2">
              {index > 0 ? (
                <span aria-hidden className="text-dp-ink-muted">
                  •
                </span>
              ) : null}
              {item}
            </span>
          ))}
        </p>
      ) : null}

      {/* Primary actions */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
            className="inline-flex h-12 min-h-12 w-full items-center justify-center gap-2 rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface px-6 font-sans text-base font-medium text-dp-primary no-underline transition-colors hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus sm:w-auto"
          >
            <GlobeIcon />
            Official website
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : null}
        {directionsHref ? (
          <a
            href={directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 min-h-12 w-full items-center justify-center gap-2 rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface px-6 font-sans text-base font-medium text-dp-primary no-underline transition-colors hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus sm:w-auto"
          >
            <DirectionsIcon />
            Get directions
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : null}
      </div>

      <RestaurantJourneyActions
        restaurantSlug={restaurant.slug}
        restaurantName={restaurant.name}
      />

      {/* Details */}
      <div className="mt-[var(--dp-section)] border-t border-dp-border pt-8">
        <h2 className="dp-headline-md text-dp-primary-deep">Details</h2>
        <dl className="mt-6 grid min-w-0 grid-cols-1 border-t border-dp-border sm:grid-cols-2 lg:grid-cols-3">
          {restaurant.address ? (
            <Fact label="Address">
              <span className="whitespace-pre-line">{restaurant.address}</span>
            </Fact>
          ) : null}
          {restaurant.reservation.isDirectBooking &&
          restaurant.reservation.providerLabel ? (
            <Fact label="Reservations">
              {restaurant.reservation.providerLabel}
            </Fact>
          ) : null}
          {restaurant.showMichelinGuide && restaurant.michelinGuideUrl ? (
            <Fact label="Michelin Guide">
              <a
                href={restaurant.michelinGuideUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dp-primary underline underline-offset-4"
              >
                View reference
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </Fact>
          ) : null}

          <RestaurantGoogleInfo placeId={restaurant.googlePlaceId} />
        </dl>
      </div>
    </section>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={tileClass}>
      <dt className={labelClass}>{label}</dt>
      <dd className={valueClass}>{children}</dd>
    </div>
  );
}
