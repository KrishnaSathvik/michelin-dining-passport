import Link from "next/link";
import type { RestaurantNearbyRowModel } from "./models";
import { MichelinDistinction } from "./MichelinDistinction";
import { ReservationAction } from "./ReservationAction";
import { RestaurantMeta } from "./RestaurantMeta";
import { SaveAction } from "./SaveAction";

type NearbyRestaurantRowProps = {
  model: RestaurantNearbyRowModel;
  className?: string;
};

/**
 * Quieter Nearby section row — text-forward, no invented distance.
 */
export function NearbyRestaurantRow({
  model,
  className = "",
}: NearbyRestaurantRowProps) {
  const href = `/restaurants/${model.slug}`;

  return (
    <article
      className={`flex flex-col gap-3 border-b border-dp-border py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${className}`}
      data-restaurant-card="nearby-row"
      data-slug={model.slug}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <MichelinDistinction stars={model.distinction} variant="row" />
          {model.distanceLabel ? (
            <span className="font-sans text-xs text-dp-ink-muted">
              {model.distanceLabel}
            </span>
          ) : null}
        </div>
        <h3 className="mt-1 font-display text-lg leading-tight text-dp-ink">
          <Link
            href={href}
            className="no-underline transition-colors hover:text-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          >
            {model.name}
          </Link>
        </h3>
        <RestaurantMeta
          cuisine={model.cuisine}
          location={model.location}
          className="mt-1"
          compact
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SaveAction restaurantSlug={model.slug} variant="compact" />
        <ReservationAction
          restaurantSlug={model.slug}
          action={model.reservation}
          surface={model.surface}
          variant="text"
        />
      </div>
    </article>
  );
}
