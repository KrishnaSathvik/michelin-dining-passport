import { RestaurantMedia } from "@/components/stitch/restaurant";
import type { RestaurantDetailModel } from "./models";
import { RestaurantIdentityContent } from "./RestaurantIdentityContent";

type RestaurantIdentityHeroProps = {
  restaurant: RestaurantDetailModel;
};

/**
 * Canonical Benu hero: ~58% media / ~42% identity at desktop.
 * Media height locked to 500px on md+ to match Stitch silhouette.
 */
export function RestaurantIdentityHero({
  restaurant,
}: RestaurantIdentityHeroProps) {
  return (
    <section
      className="mb-[var(--dp-section)] flex flex-col gap-6 md:flex-row md:gap-6"
      aria-labelledby="restaurant-identity-heading"
      data-restaurant-hero="identity"
    >
      <div className="w-full overflow-hidden rounded-[var(--dp-radius-md)] md:h-[500px] md:w-[58%]">
        <RestaurantMedia
          name={restaurant.name}
          seed={restaurant.slug}
          city={restaurant.city}
          stars={restaurant.stars}
          imageUrl={restaurant.image?.url}
          objectPosition={restaurant.image?.objectPosition}
          alt={restaurant.image?.alt}
          priority
          ratioClass="aspect-[4/3] md:aspect-auto md:h-full"
          className="h-full rounded-[var(--dp-radius-md)]"
          sizes="(max-width: 768px) 100vw, 58vw"
        />
      </div>
      <RestaurantIdentityContent restaurant={restaurant} />
    </section>
  );
}
