import { PageContainer } from "@/components/stitch/PageContainer";
import { PassportCollectionsPreview } from "./PassportCollectionsPreview";
import { PassportHero } from "./PassportHero";
import { PassportJourneySummary } from "./PassportJourneySummary";
import { PassportSyncNotice } from "./PassportSyncNotice";
import { PassportUpcomingPlan } from "./PassportUpcomingPlan";
import { PassportRecentVisits } from "./PassportRecentVisits";
import { PassportSavedSection } from "./PassportSavedSection";
import type { PassportActiveModel } from "./models";

type PassportActiveViewProps = {
  model: PassportActiveModel;
};

export function PassportActiveView({ model }: PassportActiveViewProps) {
  return (
    <div className="bg-dp-bg" data-passport-view="active">
      <PageContainer className="pb-[var(--dp-section)] pt-[104px]">
        <PassportHero model={model.hero} />
        <PassportSyncNotice sync={model.sync} compact />
        <PassportUpcomingPlan model={model.featuredPlan} />
        <PassportRecentVisits visits={model.recentVisits} />
        <PassportSavedSection restaurants={model.savedRestaurants} />
        <PassportCollectionsPreview collections={model.collections} />
        <PassportJourneySummary metrics={model.summary} />
        <aside className="flex flex-col items-start justify-between gap-5 rounded-[var(--dp-radius-xl)] bg-dp-primary px-6 py-8 text-dp-on-primary sm:flex-row sm:items-center sm:px-8">
          <div>
            <p className="dp-label-caps text-white/70">Keep discovering</p>
            <p className="mt-2 font-display text-2xl">
              Find the next restaurant for your list.
            </p>
          </div>
          <a
            href="/explore"
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-[var(--dp-radius-lg)] bg-white px-5 font-sans text-sm font-semibold text-dp-primary no-underline"
          >
            Explore more
          </a>
        </aside>
      </PageContainer>
    </div>
  );
}
