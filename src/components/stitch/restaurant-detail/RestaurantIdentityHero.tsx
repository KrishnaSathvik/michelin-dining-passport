import type { RestaurantDetailModel } from "./models";
import { RestaurantGallery } from "./RestaurantGallery";
import { RestaurantIdentityContent } from "./RestaurantIdentityContent";

type RestaurantIdentityHeroProps = {
  restaurant: RestaurantDetailModel;
};

/**
 * Stable 7/5 editorial split. The gallery selects finite sparse-media states,
 * so the identity never depends on a five-image minimum.
 */
export function RestaurantIdentityHero({
  restaurant,
}: RestaurantIdentityHeroProps) {
  return (
    <section
      className="mb-[var(--dp-section)] grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10"
      aria-labelledby="restaurant-identity-heading"
      data-restaurant-hero="identity"
    >
      <div className="min-w-0 lg:col-span-7">
        <RestaurantGallery restaurant={restaurant} />
      </div>
      <div className="min-w-0 lg:col-span-5">
        <RestaurantIdentityContent restaurant={restaurant} />
      </div>
    </section>
  );
}
