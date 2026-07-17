import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { CuisineLabel } from "@/components/restaurant/CuisineLabel";
import { ExternalTextLink } from "@/components/restaurant/ExternalTextLink";
import { LocationLine } from "@/components/restaurant/LocationLine";
import { PriceMark } from "@/components/restaurant/PriceMark";
import { StarMark } from "@/components/restaurant/StarMark";
import { SearchForm } from "@/components/search/SearchForm";
import { getTotals } from "@/lib/data/restaurants";
import { searchRestaurants } from "@/lib/data/search";

type ExplorePageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export const metadata = {
  title: "Explore",
};

function readQuery(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const query = readQuery(params.q).trim();
  const totals = getTotals();
  const results = query ? searchRestaurants(query) : [];

  return (
    <div className="border-b border-border">
      <Container className="py-10 sm:py-14">
        <p className="font-sans text-xs uppercase tracking-[0.18em] text-burgundy">
          Phase 1 · Minimal explore
        </p>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
          Explore restaurants
        </h1>
        <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink-muted">
          Search the {totals.restaurants} restaurants in the current roster.
          Complete filters arrive in Phase 2 — this page only reads the{" "}
          <code className="text-ink">q</code> parameter.
        </p>

        <div className="mt-8 max-w-2xl">
          <SearchForm defaultQuery={query} idPrefix="explore" />
        </div>

        <p className="mt-6 font-sans text-sm text-ink-muted">
          <Link href="/" className="text-forest underline underline-offset-4">
            Back to homepage
          </Link>
        </p>

        <div className="mt-10">
          {!query ? (
            <p className="font-sans text-base text-ink-muted">
              Enter a restaurant, city, state, or cuisine to see matching
              listings from the local dataset.
            </p>
          ) : results.length === 0 ? (
            <p className="font-sans text-base text-ink-muted">
              No restaurants matched{" "}
              <span className="text-ink">&ldquo;{query}&rdquo;</span>. Try a
              city, state, cuisine, or part of a restaurant name.
            </p>
          ) : (
            <>
              <p className="font-sans text-sm text-ink-muted">
                {results.length} result{results.length === 1 ? "" : "s"} for{" "}
                <span className="text-ink">&ldquo;{query}&rdquo;</span>
              </p>
              <ul className="mt-6 divide-y divide-border border-y border-border">
                {results.map((restaurant) => (
                  <li key={restaurant.slug} className="py-5">
                    <h2 className="font-display text-2xl text-ink">
                      {restaurant.name}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <StarMark stars={restaurant.stars} size="sm" />
                      <CuisineLabel cuisine={restaurant.cuisine} />
                      <LocationLine
                        city={restaurant.city}
                        state={restaurant.state}
                        stateCode={restaurant.stateCode}
                      />
                      <PriceMark price={restaurant.price} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-sans text-sm">
                      <ExternalTextLink href={restaurant.michelinGuideUrl}>
                        Michelin Guide listing
                      </ExternalTextLink>
                      {restaurant.website ? (
                        <ExternalTextLink href={restaurant.website}>
                          Restaurant website
                        </ExternalTextLink>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </Container>
    </div>
  );
}
