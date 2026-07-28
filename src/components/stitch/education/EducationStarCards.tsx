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
          className="font-display text-[28px] text-dp-primary md:text-[34px]"
        >
          One, two, and three stars
        </h2>
        <p className="mt-3 max-w-2xl font-sans text-base leading-relaxed text-dp-ink-secondary">
          The number of stars reflects how good the cooking is — not how expensive,
          formal, or famous a restaurant is. Michelin defines each level like this.
        </p>
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
