import {
  RelatedRestaurantCard,
  type RestaurantCardModel,
} from "@/components/stitch/restaurant";

type RelatedRestaurantsSectionProps = {
  title: string;
  restaurants: RestaurantCardModel[];
};

export function RelatedRestaurantsSection({
  title,
  restaurants,
}: RelatedRestaurantsSectionProps) {
  if (restaurants.length === 0) return null;

  return (
    <section
      className="mb-[var(--dp-section)] border-t border-dp-border pt-[var(--dp-section)]"
      aria-labelledby="related-restaurants-heading"
      data-related-section
    >
      <h2
        id="related-restaurants-heading"
        className="dp-headline-md mb-8 text-dp-ink"
      >
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {restaurants.map((model) => (
          <RelatedRestaurantCard key={model.slug} model={model} />
        ))}
      </div>
    </section>
  );
}
