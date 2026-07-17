import {
  ExploreLoadingState,
  ExplorePageView,
  toExploreViewModel,
} from "@/components/stitch/explore";
import { homepageConfig } from "@/config/homepage";
import {
  getActiveFilterChips,
  getExploreFacets,
  parseExploreSearchParams,
  runExploreQuery,
} from "@/lib/data/explore";
import { getRestaurants, getTotals } from "@/lib/data/restaurants";

type ExplorePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = {
  title: "Explore",
  description:
    "Search and filter Michelin-starred restaurants across the United States.",
};

/**
 * Explore — full Stitch directory composition (Phase 5).
 * Query contract preserved in `src/lib/data/explore.ts`.
 */
export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const query = parseExploreSearchParams(params);
  const restaurants = getRestaurants();
  const totals = getTotals();
  const facets = getExploreFacets(restaurants, query);
  const pageResult = runExploreQuery(
    restaurants,
    query,
    homepageConfig.featuredRestaurantSlugs,
  );
  const chips = getActiveFilterChips(query, facets);

  // Dev-only visual QA states for Phase 5 baselines — unavailable in production.
  const proof =
    process.env.NODE_ENV !== "production"
      ? typeof params.proof === "string"
        ? params.proof
        : undefined
      : undefined;

  if (proof === "loading") {
    return (
      <ExploreLoadingState view={query.view === "list" ? "list" : "grid"} />
    );
  }

  if (proof === "empty") {
    const emptyModel = toExploreViewModel({
      query,
      facets,
      chips,
      pageResult: {
        items: [],
        total: 0,
        page: 1,
        pageSize: pageResult.pageSize,
        totalPages: 0,
      },
      totalInRoster: totals.restaurants,
    });
    return <ExplorePageView model={emptyModel} />;
  }

  const model = toExploreViewModel({
    query,
    facets,
    chips,
    pageResult,
    totalInRoster: totals.restaurants,
  });

  return <ExplorePageView model={model} />;
}
