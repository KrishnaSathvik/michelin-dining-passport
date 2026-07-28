import Link from "next/link";
import type { RestaurantCardModel } from "./models";
import { MichelinDistinction } from "./MichelinDistinction";
import { ReservationAction } from "./ReservationAction";
import { RestaurantMedia } from "./RestaurantMedia";
import { RestaurantMeta } from "./RestaurantMeta";
import { SaveAction } from "./SaveAction";

type RestaurantDiscoveryCardProps = {
  model: RestaurantCardModel;
  className?: string;
  priority?: boolean;
  /**
   * Approved Google place ID, supplied by server components (kept off the
   * Google-free card model). Enables a media-only Google photo when the
   * restaurant has no approved first-party image.
   */
  placeId?: string | null;
};

/**
 * Primary discovery card for Explore grid, saved grid, taxonomy, homepage support.
 * Explicit "View details" CTA navigates to the restaurant profile; Save and
 * Reservation do not.
 */
export function RestaurantDiscoveryCard({
  model,
  className = "",
  priority = false,
  placeId,
}: RestaurantDiscoveryCardProps) {
  const href = `/restaurants/${model.slug}`;
  const detailLabel = `View ${model.name}`;

  return (
    <article
      className={`group flex h-full min-w-[min(100%,280px)] flex-col ${className}`}
      data-restaurant-card="discovery"
      data-slug={model.slug}
    >
      <div className="relative">
        <Link
          href={href}
          aria-label={detailLabel}
          className="block overflow-hidden rounded-[var(--dp-radius-lg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        >
          <div className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[var(--dp-ease)] motion-safe:group-hover:scale-[1.02]">
            <RestaurantMedia
              name={model.name}
              seed={model.id}
              slug={model.slug}
              city={model.location}
              stars={model.distinction}
              imageUrl={model.image?.url}
              placeId={placeId}
              page={model.surface}
              objectPosition={model.image?.objectPosition}
              alt={model.image?.alt}
              priority={priority}
              className="rounded-[var(--dp-radius-lg)]"
            />
          </div>
        </Link>
        <div className="absolute right-3 top-3 z-10">
          <SaveAction restaurantSlug={model.slug} variant="overlay" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 pt-4">
        <MichelinDistinction stars={model.distinction} variant="compact" />
        <h3 className="font-display text-xl leading-tight text-dp-ink sm:text-[1.35rem]">
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
          price={model.price}
        />
        <div className="mt-auto flex flex-col gap-2 pt-3">
          <Link
            href={href}
            data-restaurant-action="view-detail"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface px-5 py-2.5 font-sans text-[14px] font-semibold tracking-wide text-dp-primary no-underline transition-colors hover:border-dp-primary hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          >
            View details
          </Link>
          <ReservationAction
            restaurantSlug={model.slug}
            action={model.reservation}
            surface={model.surface}
            variant="primary"
          />
        </div>
      </div>
    </article>
  );
}
