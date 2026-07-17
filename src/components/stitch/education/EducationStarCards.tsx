import { PageContainer } from "@/components/stitch/PageContainer";
import { EducationStarCard } from "./EducationStarCard";
import type { EducationStarCardModel } from "./models";

type EducationStarCardsProps = {
  cards: EducationStarCardModel[];
};

export function EducationStarCards({ cards }: EducationStarCardsProps) {
  return (
    <section
      className="py-[var(--dp-section)]"
      aria-labelledby="education-stars-heading"
      data-education-section="star-cards"
    >
      <PageContainer>
        <h2
          id="education-stars-heading"
          className="font-display text-[28px] text-dp-primary md:text-[32px]"
        >
          Star distinctions
        </h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <li key={card.stars}>
              <EducationStarCard model={card} />
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
