import Link from "next/link";
import type { RestaurantEditorialCardModel } from "./models";
import { MichelinDistinction } from "./MichelinDistinction";
import { ReservationAction } from "./ReservationAction";
import { RestaurantMedia } from "./RestaurantMedia";
import { RestaurantMeta } from "./RestaurantMeta";
import { SaveAction } from "./SaveAction";

type RestaurantEditorialCardProps = {
  model: RestaurantEditorialCardModel;
  className?: string;
  priority?: boolean;
};

/**
 * Larger editorial card for homepage featured / distinction modules.
 * Horizontal on desktop; stacks deliberately on mobile.
 */
export function RestaurantEditorialCard({
  model,
  className = "",
  priority = true,
}: RestaurantEditorialCardProps) {
  const href = `/restaurants/${model.slug}`;
  const detailLabel = `View ${model.name}`;

  return (
    <article
      className={`group grid gap-6 overflow-hidden rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface-low md:grid-cols-2 md:gap-0 ${className}`}
      data-restaurant-card="editorial"
      data-slug={model.slug}
    >
      <div className="relative min-h-[16rem] md:min-h-[22rem]">
        <Link
          href={href}
          aria-label={detailLabel}
          className="absolute inset-0 block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        >
          <RestaurantMedia
            name={model.name}
            seed={model.id}
            city={model.location}
            stars={model.distinction}
            imageUrl={model.image?.url}
            objectPosition={model.image?.objectPosition}
            alt={model.image?.alt}
            priority={priority}
            ratioClass="aspect-auto h-full min-h-[16rem] md:min-h-[22rem]"
            className="rounded-none"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </Link>
        <div className="absolute right-3 top-3 z-10">
          <SaveAction restaurantSlug={model.slug} variant="overlay" />
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-8 md:px-10 md:py-10">
        {model.eyebrow ? (
          <p className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-dp-ink-muted">
            {model.eyebrow}
          </p>
        ) : null}
        <h3 className="mt-3 font-display text-3xl leading-tight text-dp-ink sm:text-4xl lg:text-[2.75rem]">
          <Link
            href={href}
            className="no-underline transition-colors hover:text-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          >
            {model.name}
          </Link>
        </h3>
        <div className="mt-5">
          <MichelinDistinction
            stars={model.distinction}
            variant="editorial"
            showLabel
          />
        </div>
        <RestaurantMeta
          cuisine={model.cuisine}
          location={model.location}
          price={model.price}
          className="mt-4"
        />
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <ReservationAction
            restaurantSlug={model.slug}
            action={model.reservation}
            surface={model.surface}
            variant="editorial"
          />
          <SaveAction restaurantSlug={model.slug} variant="editorial" />
        </div>
      </div>
    </article>
  );
}
