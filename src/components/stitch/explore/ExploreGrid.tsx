import { RestaurantDiscoveryCard } from "@/components/stitch/restaurant";
import type { RestaurantCardModel } from "@/components/stitch/restaurant";
import { PageContainer } from "@/components/stitch/PageContainer";

type ExploreGridProps = {
  cards: RestaurantCardModel[];
};

/**
 * Wide desktop: 4 columns when card width stays ~280px+.
 * Content width 1152px → ~270px cards at 4-col (Stitch). Prefer fidelity over forcing 4-col at narrower widths.
 */
export function ExploreGrid({ cards }: ExploreGridProps) {
  return (
    <PageContainer className="mb-12 md:mb-16">
      <ul
        className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        data-explore-results="grid"
      >
        {cards.map((card, index) => (
          <li key={card.slug}>
            <RestaurantDiscoveryCard model={card} priority={index < 4} />
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
