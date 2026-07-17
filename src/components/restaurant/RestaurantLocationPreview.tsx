import Link from "next/link";
import type { MapRestaurant } from "@/lib/data/geocodes";

type RestaurantLocationPreviewProps = {
  restaurant: MapRestaurant;
};

export function RestaurantLocationPreview({
  restaurant,
}: RestaurantLocationPreviewProps) {
  const mapHref = `/map?selected=${encodeURIComponent(restaurant.slug)}`;
  const hasCoords =
    restaurant.hasApprovedCoordinates &&
    restaurant.latitude != null &&
    restaurant.longitude != null;

  const embedSrc = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${(
        restaurant.longitude! - 0.02
      ).toFixed(5)}%2C${(restaurant.latitude! - 0.015).toFixed(5)}%2C${(
        restaurant.longitude! + 0.02
      ).toFixed(5)}%2C${(restaurant.latitude! + 0.015).toFixed(5)}&layer=mapnik&marker=${restaurant.latitude!.toFixed(
        5,
      )}%2C${restaurant.longitude!.toFixed(5)}`
    : null;

  return (
    <section className="mt-12 border-t border-border pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-ink sm:text-3xl">
            Location
          </h2>
          <p className="mt-2 max-w-xl font-sans text-sm leading-relaxed text-ink-muted">
            {restaurant.address}
          </p>
        </div>
        <Link
          href={mapHref}
          className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-border px-4 font-sans text-sm text-ink no-underline hover:border-forest hover:text-forest"
        >
          View on map
        </Link>
      </div>

      {embedSrc ? (
        <div className="mt-5 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface-soft">
          <iframe
            title={`Map preview for ${restaurant.name}`}
            src={embedSrc}
            className="h-56 w-full border-0 sm:h-72"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <p className="mt-4 rounded-[var(--radius-lg)] border border-border bg-surface-soft px-4 py-6 font-sans text-sm text-ink-muted">
          Location verification is pending for this restaurant. Address is
          listed above; open the map workspace to browse nearby starred dining.
        </p>
      )}
    </section>
  );
}
