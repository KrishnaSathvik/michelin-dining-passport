import Link from "next/link";
import { RestaurantDiscoveryCard } from "@/components/stitch/restaurant";
import type { RestaurantCardModel } from "@/components/stitch/restaurant";
import { PageContainer } from "@/components/stitch/PageContainer";

type DistinctionBentoGridProps = {
  restaurants: RestaurantCardModel[];
  exploreHref: string;
  remainingCount: number;
};

/**
 * Editorial mosaic for three-star (and adaptable low-count) pages.
 * No ranking language — order follows the data loader sort.
 */
export function DistinctionBentoGrid({
  restaurants,
  exploreHref,
  remainingCount,
}: DistinctionBentoGridProps) {
  if (restaurants.length === 0) {
    return (
      <PageContainer className="py-12">
        <p className="font-sans text-dp-ink-muted">
          No restaurants at this distinction in the current roster.
        </p>
      </PageContainer>
    );
  }

  const [featured, secondary, ...rest] = restaurants;

  return (
    <section
      className="py-[var(--dp-section)]"
      aria-labelledby="distinction-restaurants-heading"
      data-taxonomy-section="editorial-bento"
    >
      <PageContainer>
        <h2
          id="distinction-restaurants-heading"
          className="mb-8 font-display text-[28px] text-dp-primary md:text-[32px]"
        >
          Restaurants
        </h2>
        <div className="grid gap-6 md:grid-cols-12">
          {featured ? (
            <div className="md:col-span-8">
              <RestaurantDiscoveryCard model={featured} />
            </div>
          ) : null}
          {secondary ? (
            <div className="md:col-span-4">
              <RestaurantDiscoveryCard model={secondary} />
            </div>
          ) : null}
          {rest.map((card) => (
            <div key={card.slug} className="md:col-span-3">
              <RestaurantDiscoveryCard model={card} />
            </div>
          ))}
          {remainingCount > 0 ? (
            <div className="flex min-h-[16rem] flex-col items-start justify-center rounded-[var(--dp-radius-xl)] border border-dp-border bg-dp-soft p-6 md:col-span-3">
              <p className="font-display text-[22px] text-dp-primary">
                View {remainingCount} more
              </p>
              <Link
                href={exploreHref}
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-[var(--dp-radius-md)] bg-dp-primary px-5 font-sans text-sm font-semibold text-dp-on-primary no-underline"
              >
                Open in Explore
              </Link>
            </div>
          ) : null}
        </div>
      </PageContainer>
    </section>
  );
}
