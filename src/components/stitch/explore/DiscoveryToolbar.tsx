import { PageContainer } from "@/components/stitch/PageContainer";
import { ExploreSearchForm } from "./ExploreSearchForm";
import { ExploreQuickFilters } from "./ExploreQuickFilters";
import type { ExploreFacets, ExploreQuery } from "@/lib/data/explore";

type DiscoveryToolbarProps = {
  query: ExploreQuery;
  facets: ExploreFacets;
  activeCount: number;
};

export function DiscoveryToolbar({
  query,
  facets,
  activeCount,
}: DiscoveryToolbarProps) {
  return (
    <section
      className="sticky top-[var(--dp-header-height)] z-30 mb-6 border-b border-dp-border bg-dp-surface/95 pt-4 pb-6 backdrop-blur-sm md:mb-8"
      data-explore-toolbar
      aria-label="Search and filters"
    >
      <PageContainer className="flex flex-col gap-4">
        <ExploreSearchForm query={query} />
        <ExploreQuickFilters
          query={query}
          facets={facets}
          activeCount={activeCount}
        />
      </PageContainer>
    </section>
  );
}
