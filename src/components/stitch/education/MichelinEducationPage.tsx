import { BeyondTheStars } from "./BeyondTheStars";
import { EducationCtas } from "./EducationCtas";
import { EducationHero } from "./EducationHero";
import { EducationStarCards } from "./EducationStarCards";
import { IndependenceCallout } from "./IndependenceCallout";
import type { EducationPageViewModel } from "./models";

type MichelinEducationPageProps = {
  model: EducationPageViewModel;
};

export function MichelinEducationPage({ model }: MichelinEducationPageProps) {
  return (
    <div data-education="michelin-stars">
      <EducationHero
        title={model.title}
        introduction={model.introduction}
        imageSrc={model.heroImageSrc}
      />
      <IndependenceCallout message={model.independence} />
      <EducationStarCards cards={model.starCards} />
      <BeyondTheStars items={model.beyond} />
      <EducationCtas coverage={model.coverage} />
    </div>
  );
}
