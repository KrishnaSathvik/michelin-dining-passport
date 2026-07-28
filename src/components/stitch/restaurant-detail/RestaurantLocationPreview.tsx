import Link from "next/link";
import type { RestaurantDetailModel } from "./models";

type RestaurantLocationPreviewProps = {
  restaurant: RestaurantDetailModel;
};

/**
 * First-party MapLibre/OSM location preview using canonical coordinates.
 * No Google Places query.
 */
export function RestaurantLocationPreview({
  restaurant,
}: RestaurantLocationPreviewProps) {
  const coords = restaurant.coordinates;
  const embedSrc = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${(
        coords.longitude - 0.02
      ).toFixed(5)}%2C${(coords.latitude - 0.015).toFixed(5)}%2C${(
        coords.longitude + 0.02
      ).toFixed(5)}%2C${(coords.latitude + 0.015).toFixed(5)}&layer=mapnik&marker=${coords.latitude.toFixed(
        5,
      )}%2C${coords.longitude.toFixed(5)}`
    : null;

  return (
    <div data-restaurant-location-preview>
      <div className="mb-4 h-48 w-full overflow-hidden rounded-[var(--dp-radius-md)] border border-dp-border bg-dp-soft">
        {embedSrc ? (
          <iframe
            title={`Map preview for ${restaurant.name}`}
            src={embedSrc}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-sans text-sm text-dp-ink-muted">
            Map preview unavailable
          </div>
        )}
      </div>
      {restaurant.mapHref ? (
        <Link
          href={restaurant.mapHref}
          className="inline-flex min-h-11 items-center gap-1 font-sans text-sm text-dp-primary no-underline underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        >
          View on map
          <span aria-hidden="true">↗</span>
        </Link>
      ) : null}
    </div>
  );
}
