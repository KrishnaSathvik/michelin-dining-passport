import Link from "next/link";
import type { RestaurantDetailModel } from "./models";
import { RestaurantDetailMapLazy } from "./RestaurantDetailMapLazy";

type RestaurantLocationSectionProps = {
  restaurant: RestaurantDetailModel;
};

function directionsHref(restaurant: RestaurantDetailModel): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [restaurant.name, restaurant.address, restaurant.locationLabel]
      .filter(Boolean)
      .join(", "),
  )}`;
}

export function RestaurantLocationSection({
  restaurant,
}: RestaurantLocationSectionProps) {
  return (
    <section
      className="mb-[var(--dp-section)] border-t border-dp-border pt-[var(--dp-section)]"
      aria-labelledby="restaurant-location-heading"
      data-restaurant-location
    >
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="dp-label-caps text-dp-ink-muted">Find the table</p>
          <h2
            id="restaurant-location-heading"
            className="dp-headline-md mt-2 text-dp-primary-deep"
          >
            Location
          </h2>
          <p className="mt-3 max-w-2xl whitespace-pre-line font-sans text-base leading-relaxed text-dp-ink-secondary">
            {restaurant.address ?? restaurant.locationLabel}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={directionsHref(restaurant)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-[var(--dp-radius-lg)] border border-dp-primary px-4 font-sans text-sm font-semibold text-dp-primary no-underline hover:bg-dp-soft"
          >
            Get directions
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <Link
            href={restaurant.mapHref ?? `/map?selected=${restaurant.slug}`}
            className="inline-flex min-h-11 items-center rounded-[var(--dp-radius-lg)] px-4 font-sans text-sm font-semibold text-dp-primary no-underline hover:bg-dp-soft"
          >
            Open full map
          </Link>
        </div>
      </div>

      {restaurant.coordinates ? (
        <>
          <p className="sr-only">
            Interactive map showing {restaurant.name} at{" "}
            {restaurant.address ?? restaurant.locationLabel}.
          </p>
          <RestaurantDetailMapLazy
            name={restaurant.name}
            stars={restaurant.stars}
            latitude={restaurant.coordinates.latitude}
            longitude={restaurant.coordinates.longitude}
          />
        </>
      ) : (
        <p className="max-w-2xl rounded-[var(--dp-radius-lg)] bg-dp-surface-low px-5 py-4 font-sans text-sm leading-relaxed text-dp-ink-secondary">
          An interactive map is not available for this restaurant yet. Use the
          verified address above to open directions.
        </p>
      )}
    </section>
  );
}
