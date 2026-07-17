import { MarketingHero } from "./MarketingHero";
import { HomepageFeaturedSection } from "./HomepageFeaturedSection";
import { HomepageStatsStrip } from "./HomepageStatsStrip";
import type { HomepageViewModel } from "./models";

type HomepageViewProps = {
  model: HomepageViewModel;
  featuredLoading?: boolean;
};

/**
 * Complete Stitch explore_feed homepage composition.
 * Header/footer come from AppChrome — not duplicated here.
 */
export function HomepageView({
  model,
  featuredLoading = false,
}: HomepageViewProps) {
  return (
    <div data-homepage="stitch-explore-feed">
      <MarketingHero model={model.hero} />
      <HomepageStatsStrip totals={model.totals} />
      <HomepageFeaturedSection
        model={model.featured}
        loading={featuredLoading}
      />
    </div>
  );
}
