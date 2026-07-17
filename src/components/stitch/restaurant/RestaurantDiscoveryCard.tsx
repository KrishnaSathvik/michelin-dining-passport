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
};

/**
 * Primary discovery card for Explore grid, saved grid, taxonomy, homepage support.
 * Card body links to detail; Save and Reservation do not navigate to detail.
 */
export function RestaurantDiscoveryCard({
  model,
  className = "",
  priority = false,
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
              city={model.location}
              stars={model.distinction}
              imageUrl={model.image?.url}
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
        <div className="mt-auto pt-3">
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
