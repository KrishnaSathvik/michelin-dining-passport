import Link from "next/link";
import { RestaurantDiscoveryCard } from "@/components/stitch/restaurant";
import type { RestaurantCardModel } from "@/components/stitch/restaurant";
import { PageContainer } from "@/components/stitch/PageContainer";
import { getApprovedGooglePlaceId } from "@/lib/google-places/place-ids";

type DistinctionBentoGridProps = {
  restaurants: RestaurantCardModel[];
  exploreHref: string;
  remainingCount: number;
};

/**
 * Uniform discovery grid for three-star (and adaptable low-count) pages.
 * Every card is the same size; order follows the data loader sort.
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
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((card, index) => (
            <li key={card.slug}>
              <RestaurantDiscoveryCard
                model={card}
                priority={index === 0}
                placeId={getApprovedGooglePlaceId(card.slug)}
              />
            </li>
          ))}
          {remainingCount > 0 ? (
            <li className="flex min-h-[16rem] flex-col items-start justify-center rounded-[var(--dp-radius-xl)] border border-dp-border bg-dp-soft p-6">
              <p className="font-display text-[22px] text-dp-primary">
                View {remainingCount} more
              </p>
              <Link
                href={exploreHref}
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-[var(--dp-radius-md)] bg-dp-primary px-5 font-sans text-sm font-semibold text-dp-on-primary no-underline"
              >
                Open in Explore
              </Link>
            </li>
          ) : null}
        </ul>
      </PageContainer>
    </section>
  );
}
