import { RestaurantListRow } from "@/components/stitch/restaurant";
import type { RestaurantCardModel } from "@/components/stitch/restaurant";
import { PageContainer } from "@/components/stitch/PageContainer";
import { getApprovedGooglePlaceId } from "@/lib/google-places/place-ids";

type ExploreListProps = {
  cards: RestaurantCardModel[];
};

export function ExploreList({ cards }: ExploreListProps) {
  return (
    <PageContainer className="mb-12 md:mb-16">
      <ul className="flex flex-col" data-explore-results="list">
        {cards.map((card) => (
          <li key={card.slug}>
            <RestaurantListRow
              model={card}
              placeId={getApprovedGooglePlaceId(card.slug)}
            />
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
