import Link from "next/link";
import {
  MichelinDistinction,
  ReservationAction,
} from "@/components/stitch/restaurant";
import type { RestaurantDetailModel } from "./models";
import { JourneyControls } from "./JourneyControls";

type RestaurantIdentityContentProps = {
  restaurant: RestaurantDetailModel;
};

/**
 * Identity column (~42%): distinction, title, metadata, actions, journey.
 */
export function RestaurantIdentityContent({
  restaurant,
}: RestaurantIdentityContentProps) {
  const metaParts = [
    restaurant.cuisine,
    restaurant.locationLabel,
    restaurant.price,
  ].filter(Boolean);

  return (
    <div className="flex w-full flex-col justify-center py-2 md:w-[42%]">
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

      {metaParts.length > 0 ? (
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-base text-dp-ink-secondary">
          {metaParts.map((part, index) => (
            <span key={`${part}-${index}`} className="inline-flex items-center gap-x-2">
              {index > 0 ? (
                <span aria-hidden="true" className="text-dp-ink-muted">
                  •
                </span>
              ) : null}
              <span>{part}</span>
            </span>
          ))}
        </p>
      ) : null}

      {restaurant.address ? (
        <p className="mt-6 max-w-md font-sans text-base leading-relaxed text-dp-ink-secondary">
          {restaurant.address}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
        <ReservationAction
          restaurantSlug={restaurant.slug}
          action={restaurant.reservation}
          surface="restaurant_detail"
          variant="primary"
          analyticsProvider={restaurant.reservationProvider}
          className="h-12 min-h-12 w-full px-8 sm:w-auto sm:min-w-[10rem]"
        />
        {restaurant.showOfficialWebsite && restaurant.officialWebsite ? (
          <a
            href={restaurant.officialWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 min-h-12 w-full items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface px-8 font-sans text-base text-dp-primary no-underline transition-colors hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus sm:w-auto"
          >
            Website
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

      <JourneyControls
        restaurantSlug={restaurant.slug}
        restaurantName={restaurant.name}
        stars={restaurant.stars}
      />
    </div>
  );
}
