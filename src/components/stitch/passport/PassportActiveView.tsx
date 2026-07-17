import { PageContainer } from "@/components/stitch/PageContainer";
import { PassportCollectionsPreview } from "./PassportCollectionsPreview";
import { PassportHero } from "./PassportHero";
import { PassportJourneySummary } from "./PassportJourneySummary";
import { PassportSyncNotice } from "./PassportSyncNotice";
import { StarsCollected } from "./StarsCollected";
import { StatesExplored } from "./StatesExplored";
import type { PassportActiveModel } from "./models";

type PassportActiveViewProps = {
  model: PassportActiveModel;
};

export function PassportActiveView({ model }: PassportActiveViewProps) {
  return (
    <div className="bg-dp-bg" data-passport-view="active">
      <PageContainer className="pb-[var(--dp-section)] pt-[104px]">
        <PassportHero model={model.hero} />
        <PassportJourneySummary metrics={model.summary} />
        <div
          className="mb-[var(--dp-section)] grid grid-cols-1 gap-[var(--dp-gutter)] md:grid-cols-2"
          data-passport-section="progress"
        >
          <StarsCollected model={model.stars} />
          <StatesExplored model={model.states} />
        </div>
        <PassportCollectionsPreview collections={model.collections} />
        <PassportSyncNotice sync={model.sync} />
      </PageContainer>
    </div>
  );
}
