import Link from "next/link";
import { ExploreActiveFilters } from "@/components/explore/ExploreActiveFilters";
import { ExploreEmptyState } from "@/components/explore/ExploreEmptyState";
import { ExploreFilterDrawer } from "@/components/explore/ExploreFilterDrawer";
import { ExploreFilterFields } from "@/components/explore/ExploreFilterFields";
import { ExplorePagination } from "@/components/explore/ExplorePagination";
import { ExploreResults } from "@/components/explore/ExploreResults";
import { ExploreToolbar } from "@/components/explore/ExploreToolbar";
import { Container } from "@/components/layout/Container";
import { homepageConfig } from "@/config/homepage";
import {
  exploreQueryHasFilters,
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
      <Container className="py-10 sm:py-14">
        <p className="font-sans text-xs uppercase tracking-[0.18em] text-burgundy">
          Directory
        </p>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
          Explore restaurants
        </h1>
        <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink-muted">
          Browse all {totals.restaurants} starred restaurants in the current
          roster. Filters sync to the URL so results stay shareable and work with
          browser back and forward.
        </p>

        <div className="mt-8 lg:hidden">
          <ExploreFilterDrawer
            query={query}
            facets={facets}
            activeCount={activeCount}
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
          <aside className="hidden lg:block">
            <form
              action="/explore"
              method="get"
              className="sticky top-6 space-y-5 border border-border bg-bg-elevated/50 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl text-ink">Filters</h2>
                {exploreQueryHasFilters(query) ? (
                  <Link
                    href="/explore"
                    className="font-sans text-xs text-forest underline underline-offset-4"
                  >
                    Clear
                  </Link>
                ) : null}
              </div>
              <ExploreFilterFields
                query={query}
                facets={facets}
                idPrefix="explore-desktop"
              />
              <button
                type="submit"
                className="min-h-11 w-full bg-forest px-4 font-sans text-sm font-medium text-bg-elevated"
              >
                Apply filters
              </button>
            </form>
          </aside>

          <div className="space-y-5">
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
        </div>
      </Container>
    </div>
  );
}
