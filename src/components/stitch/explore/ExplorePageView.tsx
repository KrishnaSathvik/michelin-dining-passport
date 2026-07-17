import { ExplorePageHeader } from "./ExplorePageHeader";
import { DiscoveryToolbar } from "./DiscoveryToolbar";
import { ActiveFilters } from "./ActiveFilters";
import { ExploreResultsToolbar } from "./ExploreResultsToolbar";
import { ExploreGrid } from "./ExploreGrid";
import { ExploreList } from "./ExploreList";
import { ExplorePagination } from "./ExplorePagination";
import { ExploreEmptyState } from "./ExploreEmptyState";
import type { ExploreViewModel } from "./models";

type ExplorePageViewProps = {
  model: ExploreViewModel;
};

/**
 * Complete Stitch Explore composition (grid + list + drawer chrome).
 * Header/footer come from AppChrome — not duplicated here.
 */
export function ExplorePageView({ model }: ExplorePageViewProps) {
  const { query, facets, chips, header, results, clearAllHref } = model;

  return (
    <div data-explore="stitch-directory" className="border-b border-dp-border">
      <ExplorePageHeader model={header} />
      <DiscoveryToolbar
        query={query}
        facets={facets}
        activeCount={chips.length}
      />
      <ActiveFilters query={query} chips={chips} />
      <ExploreResultsToolbar
        query={query}
        total={results.total}
        page={results.page}
        totalPages={results.totalPages}
      />

      {results.total === 0 ? (
        <ExploreEmptyState
          query={query}
          chips={chips}
          clearAllHref={clearAllHref}
        />
      ) : (
        <>
          {results.view === "list" ? (
            <ExploreList cards={results.cards} />
          ) : (
            <ExploreGrid cards={results.cards} />
          )}
          <ExplorePagination
            query={{ ...query, page: results.page }}
            page={results.page}
            totalPages={results.totalPages}
          />
        </>
      )}
    </div>
  );
}
