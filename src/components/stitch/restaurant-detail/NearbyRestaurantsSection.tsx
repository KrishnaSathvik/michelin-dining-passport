import {
  NearbyRestaurantRow,
  type RestaurantNearbyRowModel,
} from "@/components/stitch/restaurant";

type NearbyRestaurantsSectionProps = {
  title: string;
  restaurants: RestaurantNearbyRowModel[];
};

export function NearbyRestaurantsSection({
  title,
  restaurants,
}: NearbyRestaurantsSectionProps) {
  if (restaurants.length === 0) return null;

  return (
    <section
      className="mb-[var(--dp-section)]"
      aria-labelledby="nearby-restaurants-heading"
      data-nearby-section
    >
      <h2
        id="nearby-restaurants-heading"
        className="font-display text-2xl text-dp-ink"
      >
        {title}
      </h2>
      <p className="mt-2 max-w-2xl font-sans text-sm text-dp-ink-muted">
        Other starred restaurants in the same city from the current roster.
      </p>
      <div className="mt-4">
        {restaurants.map((model) => (
          <NearbyRestaurantRow key={model.slug} model={model} />
        ))}
      </div>
    </section>
  );
}
