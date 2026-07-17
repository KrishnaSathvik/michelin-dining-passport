import { ExploreActiveFilters } from "@/components/explore/ExploreActiveFilters";
import { ExploreEmptyState } from "@/components/explore/ExploreEmptyState";
import { ExplorePagination } from "@/components/explore/ExplorePagination";
import { ExploreQuickFilters } from "@/components/explore/ExploreQuickFilters";
import { ExploreResults } from "@/components/explore/ExploreResults";
import { ExploreSearchBar } from "@/components/explore/ExploreSearchBar";
import { ExploreToolbar } from "@/components/explore/ExploreToolbar";
import { Container } from "@/components/layout/Container";
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
  const activeCount = chips.length;

  return (
    <div className="border-b border-border">
      <Container className="py-10 sm:py-12">
        <div className="sticky top-16 z-30 -mx-4 space-y-4 border-b border-border bg-bg/95 px-4 py-4 backdrop-blur-sm sm:top-[4.5rem] sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-4xl text-ink sm:text-5xl">
                Explore
              </h1>
              <p className="mt-2 font-sans text-base text-ink-secondary">
                {totals.restaurants} restaurants in the current roster
              </p>
            </div>
          </div>

          <div className="sm:pt-4">
            <ExploreSearchBar
              defaultQuery={query.q}
              sort={query.sort}
              view={query.view}
              stars={query.stars}
              state={query.state}
              city={query.city}
              cuisine={query.cuisine}
              price={query.price}
            />
          </div>

          <ExploreQuickFilters
            query={query}
            facets={facets}
            activeCount={activeCount}
          />
        </div>

        <div className="mt-6 space-y-5">
          <ExploreActiveFilters query={query} chips={chips} />
          <ExploreToolbar
            query={query}
            total={pageResult.total}
            page={pageResult.page}
            totalPages={pageResult.totalPages}
          />

          {pageResult.total === 0 ? (
            <ExploreEmptyState query={query} />
          ) : (
            <>
              <ExploreResults
                restaurants={pageResult.items}
                view={query.view}
              />
              <ExplorePagination
                query={{ ...query, page: pageResult.page }}
                page={pageResult.page}
                totalPages={pageResult.totalPages}
              />
            </>
          )}
        </div>
      </Container>
    </div>
  );
}
