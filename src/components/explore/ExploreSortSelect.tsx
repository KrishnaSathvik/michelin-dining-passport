"use client";

import {
  EXPLORE_SORT_LABELS,
  EXPLORE_SORT_OPTIONS,
  type ExploreQuery,
} from "@/lib/data/explore";

type ExploreSortSelectProps = {
  query: ExploreQuery;
};

export function ExploreSortSelect({ query }: ExploreSortSelectProps) {
  return (
    <form action="/explore" method="get" className="flex flex-col gap-2">
      <label
        htmlFor="explore-sort"
        className="font-sans text-xs uppercase tracking-[0.16em] text-ink-muted"
      >
        Sort
      </label>
      <div className="flex gap-2">
        {query.q ? <input type="hidden" name="q" value={query.q} /> : null}
        {query.stars !== null ? (
          <input type="hidden" name="stars" value={query.stars} />
        ) : null}
        {query.state ? (
          <input type="hidden" name="state" value={query.state} />
        ) : null}
        {query.city ? (
          <input type="hidden" name="city" value={query.city} />
        ) : null}
        {query.cuisine ? (
          <input type="hidden" name="cuisine" value={query.cuisine} />
        ) : null}
        {query.price ? (
          <input type="hidden" name="price" value={query.price} />
        ) : null}
        <input type="hidden" name="view" value={query.view} />
        <select
          id="explore-sort"
          name="sort"
          defaultValue={query.sort}
          className="min-h-11 min-w-52 border border-border bg-bg-elevated px-3 font-sans text-sm text-ink"
          onChange={(event) => {
            event.currentTarget.form?.requestSubmit();
          }}
        >
          {EXPLORE_SORT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {EXPLORE_SORT_LABELS[option]}
            </option>
          ))}
        </select>
        <noscript>
          <button
            type="submit"
            className="min-h-11 border border-border px-3 font-sans text-sm"
          >
            Apply
          </button>
        </noscript>
      </div>
    </form>
  );
}
