import { BeyondTheStars } from "./BeyondTheStars";
import { EducationCtas } from "./EducationCtas";
import { EducationHero } from "./EducationHero";
import { EducationStarCards } from "./EducationStarCards";
import { HowStarsAwarded } from "./HowStarsAwarded";
import { IndependenceCallout } from "./IndependenceCallout";
import { MichelinPrimer } from "./MichelinPrimer";
import { StarTimeline } from "./StarTimeline";
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
      <MichelinPrimer primer={model.primer} />
      <EducationStarCards cards={model.starCards} />
      <HowStarsAwarded awarding={model.awarding} />
      <StarTimeline items={model.timeline} />
      <BeyondTheStars items={model.beyond} />
      <IndependenceCallout message={model.independence} />
      <EducationCtas coverage={model.coverage} />
    </div>
  );
}
