import Link from "next/link";
import type { RestaurantCardModel } from "./models";
import { MichelinDistinction } from "./MichelinDistinction";
import { RestaurantMedia } from "./RestaurantMedia";
import { RestaurantMeta } from "./RestaurantMeta";
import { SaveAction } from "./SaveAction";

type RelatedRestaurantCardProps = {
  model: RestaurantCardModel;
  className?: string;
  /** Approved Google place ID, supplied by server components (off the model). */
  placeId?: string | null;
};

/**
 * Editorial related card with only Save and detail navigation.
 */
export function RelatedRestaurantCard({
  model,
  className = "",
  placeId,
}: RelatedRestaurantCardProps) {
  const href = `/restaurants/${model.slug}`;
  return (
    <article
      className={`group min-w-0 overflow-hidden rounded-[var(--dp-radius-xl)] border border-dp-border bg-dp-surface ${className}`}
      data-restaurant-card="related"
      data-slug={model.slug}
    >
      <div className="relative">
        <Link
          href={href}
          aria-label={`Open ${model.name}`}
          className="block"
        >
          <RestaurantMedia
            name={model.name}
            seed={model.slug}
            slug={model.slug}
            city={model.location}
            stars={model.distinction}
            imageUrl={model.image?.url}
            placeId={placeId}
            page={model.surface}
            objectPosition={model.image?.objectPosition}
            alt={model.image?.alt}
            ratioClass="aspect-[4/3]"
            className="rounded-none transition-transform duration-500 group-hover:scale-[1.015]"
          />
        </Link>
        <div className="absolute right-3 top-3">
          <SaveAction restaurantSlug={model.slug} variant="overlay" />
        </div>
      </div>
      <div className="p-5">
        <MichelinDistinction
          stars={model.distinction}
          variant="compact"
          showLabel
        />
        <h3 className="mt-3 font-display text-2xl leading-tight text-dp-ink">
          <Link
            href={href}
            className="no-underline hover:text-dp-primary"
          >
            {model.name}
          </Link>
        </h3>
        <RestaurantMeta
          cuisine={model.cuisine}
          location={model.location}
          price={model.price}
          className="mt-3"
        />
        <Link
          href={href}
          className="mt-5 inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-primary no-underline hover:underline"
        >
          Open details
        </Link>
      </div>
    </article>
  );
}
