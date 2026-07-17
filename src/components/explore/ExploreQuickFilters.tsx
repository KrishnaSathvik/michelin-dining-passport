"use client";

import Link from "next/link";
import { ExploreFilterDrawer } from "@/components/explore/ExploreFilterDrawer";
import {
  buildExploreHref,
  type ExploreFacets,
  type ExploreQuery,
} from "@/lib/data/explore";

type ExploreQuickFiltersProps = {
  query: ExploreQuery;
  facets: ExploreFacets;
  activeCount: number;
};

const controlClass =
  "min-h-11 rounded-full border border-border bg-bg px-4 font-sans text-sm text-ink outline-none focus-visible:border-forest";

export function ExploreQuickFilters({
  query,
  facets,
  activeCount,
}: ExploreQuickFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action="/explore" method="get" className="contents">
        <input type="hidden" name="q" value={query.q} />
        <input type="hidden" name="sort" value={query.sort} />
        <input type="hidden" name="view" value={query.view} />
        {query.city ? <input type="hidden" name="city" value={query.city} /> : null}

        <label className="sr-only" htmlFor="quick-stars">
          Michelin stars
        </label>
        <select
          id="quick-stars"
          name="stars"
          defaultValue={query.stars ?? ""}
          className={controlClass}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        >
          <option value="">Stars</option>
          {facets.stars.map((star) => (
            <option key={star.value} value={star.value}>
              {star.label} ({star.count})
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="quick-state">
          State
        </label>
        <select
          id="quick-state"
          name="state"
          defaultValue={query.state}
          className={controlClass}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        >
          <option value="">State</option>
          {facets.states.map((state) => (
            <option key={state.value} value={state.value}>
              {state.label} ({state.count})
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="quick-cuisine">
          Cuisine
        </label>
        <select
          id="quick-cuisine"
          name="cuisine"
          defaultValue={query.cuisine}
          className={controlClass}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        >
          <option value="">Cuisine</option>
          {facets.cuisines.map((cuisine) => (
            <option key={cuisine.value} value={cuisine.value}>
              {cuisine.label} ({cuisine.count})
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="quick-price">
          Price
        </label>
        <select
          id="quick-price"
          name="price"
          defaultValue={query.price}
          className={controlClass}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        >
          <option value="">Price</option>
          {facets.prices.map((price) => (
            <option key={price.value} value={price.value}>
              {price.label} ({price.count})
            </option>
          ))}
        </select>

        <noscript>
          <button type="submit" className={controlClass}>
            Apply
          </button>
        </noscript>
      </form>

      <ExploreFilterDrawer
        query={query}
        facets={facets}
        activeCount={activeCount}
      />

      {(query.stars ||
        query.state ||
        query.cuisine ||
        query.price ||
        query.q ||
        query.city) && (
        <Link
          href={buildExploreHref({ sort: query.sort, view: query.view })}
          className="font-sans text-sm text-ink-muted no-underline hover:text-ink"
        >
          Clear
        </Link>
      )}
    </div>
  );
}
