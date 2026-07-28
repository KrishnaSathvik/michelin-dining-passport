import {
  RelatedRestaurantCard,
  type RestaurantCardModel,
} from "@/components/stitch/restaurant";
import { getApprovedGooglePlaceId } from "@/lib/google-places/place-ids";

type NearbyRestaurantsSectionProps = {
  title: string;
  restaurants: RestaurantCardModel[];
};

export function NearbyRestaurantsSection({
  title,
  restaurants,
}: NearbyRestaurantsSectionProps) {
  if (restaurants.length === 0) return null;

  return (
    <section
      className="mb-[var(--dp-section)] border-t border-dp-border pt-[var(--dp-section)]"
      aria-labelledby="nearby-restaurants-heading"
      data-nearby-section
      data-destination-section
    >
      <h2 id="nearby-restaurants-heading" className="dp-headline-md text-dp-ink">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl font-sans text-sm text-dp-ink-muted">
        Continue exploring Michelin-starred restaurants in the same destination.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {restaurants.map((model) => (
          <RelatedRestaurantCard
            key={model.slug}
            model={model}
            placeId={getApprovedGooglePlaceId(model.slug)}
          />
        ))}
      </div>
    </section>
  );
}
