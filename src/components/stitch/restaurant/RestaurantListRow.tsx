import Link from "next/link";
import type { RestaurantCardModel } from "./models";
import { MichelinDistinction } from "./MichelinDistinction";
import { ReservationAction } from "./ReservationAction";
import { RestaurantMedia } from "./RestaurantMedia";
import { RestaurantMeta } from "./RestaurantMeta";
import { SaveAction } from "./SaveAction";

type RestaurantListRowProps = {
  model: RestaurantCardModel;
  className?: string;
};

/**
 * Explore list row — horizontal on desktop, deliberate stacked composition on mobile.
 */
export function RestaurantListRow({
  model,
  className = "",
}: RestaurantListRowProps) {
  const href = `/restaurants/${model.slug}`;
  const detailLabel = `View ${model.name}`;

  return (
    <article
      className={`group flex flex-col gap-4 border-b border-dp-border py-5 last:border-b-0 sm:flex-row sm:items-center sm:gap-6 ${className}`}
      data-restaurant-card="list-row"
      data-slug={model.slug}
    >
      <Link
        href={href}
        aria-label={detailLabel}
        className="block w-full shrink-0 overflow-hidden rounded-[var(--dp-radius-lg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus sm:w-[120px] md:w-[132px]"
      >
        <RestaurantMedia
          name={model.name}
          seed={model.id}
          city={model.location}
          stars={model.distinction}
          imageUrl={model.image?.url}
          objectPosition={model.image?.objectPosition}
          alt={model.image?.alt}
          ratioClass="aspect-[4/3] sm:aspect-square"
          className="rounded-[var(--dp-radius-lg)]"
          sizes="(max-width: 640px) 100vw, 132px"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <MichelinDistinction stars={model.distinction} variant="row" showLabel />
        <h3 className="mt-2 font-display text-xl leading-tight text-dp-ink sm:text-2xl">
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
          className="mt-2"
          compact
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
        <SaveAction restaurantSlug={model.slug} variant="compact" />
        <ReservationAction
          restaurantSlug={model.slug}
          action={model.reservation}
          surface={model.surface}
          variant="compact"
        />
      </div>
    </article>
  );
}
