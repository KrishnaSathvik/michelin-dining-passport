import { getRestaurantDescriptionRecord } from "@/lib/data/descriptions";

type RestaurantAboutSectionProps = {
  slug: string;
  name: string;
};

/**
 * Editorial "About" section. Renders only when an original, source-backed
 * description exists for this restaurant — otherwise nothing (per the
 * no-empty-enrichment rule). Descriptions are written from public reporting,
 * never copied from the Michelin Guide.
 */
export function RestaurantAboutSection({
  slug,
  name,
}: RestaurantAboutSectionProps) {
  const record = getRestaurantDescriptionRecord(slug);
  if (!record) return null;

  return (
    <section
      className="mb-[var(--dp-section)] border-t border-dp-border pt-[var(--dp-section)]"
      aria-labelledby="restaurant-about-heading"
      data-restaurant-about
    >
      <p className="dp-label-caps text-dp-ink-muted">The experience</p>
      <h2
        id="restaurant-about-heading"
        className="dp-headline-md mt-2 text-dp-primary-deep"
      >
        About {name}
      </h2>
      <p className="mt-5 max-w-3xl font-sans text-lg leading-relaxed text-dp-ink-secondary">
        {record.text}
      </p>
      <p className="mt-4 font-sans text-xs text-dp-ink-muted">
        Written by Orellin from public reporting; not affiliated with or copied
        from the Michelin Guide.
      </p>
    </section>
  );
}
