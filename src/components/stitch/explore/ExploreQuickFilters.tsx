"use client";

import Link from "next/link";
import {
  buildExploreHref,
  EXPLORE_SORT_LABELS,
  EXPLORE_SORT_OPTIONS,
  type ExploreFacets,
  type ExploreQuery,
} from "@/lib/data/explore";
import { AllFiltersDrawer } from "./AllFiltersDrawer";
import { ExploreHiddenInputs } from "./filters";

type ExploreQuickFiltersProps = {
  query: ExploreQuery;
  facets: ExploreFacets;
  activeCount: number;
};

const selectClass =
  "inline-flex h-11 min-h-11 w-auto shrink-0 appearance-none items-center rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface bg-[length:12px] bg-[position:right_12px_center] bg-no-repeat px-3 pr-8 font-sans text-[14px] text-dp-ink outline-none transition-colors hover:border-dp-primary focus-visible:border-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus data-[selected=true]:border-dp-primary data-[selected=true]:bg-dp-soft data-[selected=true]:font-medium sm:min-w-[7.5rem] sm:px-4 sm:pr-9";

const sortSelectClass =
  "h-11 min-h-11 w-full min-w-0 flex-1 appearance-none rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface bg-[length:12px] bg-[position:right_12px_center] bg-no-repeat px-3 pr-9 font-sans text-[14px] text-dp-ink outline-none focus-visible:border-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus sm:max-w-[13rem] sm:flex-none";

const chevronStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' stroke='%23717975' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
} as const;

function ClearFiltersLink({ query }: { query: ExploreQuery }) {
  return (
    <Link
      href={buildExploreHref({ sort: query.sort, view: query.view })}
      className="dp-meta shrink-0 self-center text-dp-ink-muted no-underline hover:text-dp-ink"
    >
      Clear filters
    </Link>
  );
}

function ViewToggle({ query }: { query: ExploreQuery }) {
  return (
    <div
      className="inline-flex shrink-0 overflow-hidden rounded-[var(--dp-radius-lg)] border border-dp-border"
      role="group"
      aria-label="Result view"
    >
      <Link
        href={buildExploreHref({ ...query, view: "grid", page: 1 })}
        className={`inline-flex h-11 min-h-11 min-w-11 items-center justify-center px-3 font-sans text-[14px] no-underline transition-colors focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus sm:px-4 ${
          query.view === "grid"
            ? "bg-dp-soft font-semibold text-dp-primary"
            : "bg-dp-surface text-dp-ink-secondary hover:text-dp-primary"
        }`}
        aria-current={query.view === "grid" ? "true" : undefined}
        aria-label="Grid view"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
          <rect x="14" y="4" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
          <rect x="4" y="14" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
          <rect x="14" y="14" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="ml-2 hidden sm:inline">Grid</span>
      </Link>
      <Link
        href={buildExploreHref({ ...query, view: "list", page: 1 })}
        className={`inline-flex h-11 min-h-11 min-w-11 items-center justify-center border-l border-dp-border px-3 font-sans text-[14px] no-underline transition-colors focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus sm:px-4 ${
          query.view === "list"
            ? "bg-dp-soft font-semibold text-dp-primary"
            : "bg-dp-surface text-dp-ink-secondary hover:text-dp-primary"
        }`}
        aria-current={query.view === "list" ? "true" : undefined}
        aria-label="List view"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="ml-2 hidden sm:inline">List</span>
      </Link>
    </div>
  );
}

function SortControl({ query }: { query: ExploreQuery }) {
  return (
    <form action="/explore" method="get" className="flex min-w-0 flex-1 sm:flex-none">
      <label className="sr-only" htmlFor="explore-sort">
        Sort
      </label>
      <ExploreHiddenInputs query={query} omit={["sort", "page"]} />
      <select
        id="explore-sort"
        name="sort"
        defaultValue={query.sort}
        className={sortSelectClass}
        style={chevronStyle}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
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
          className="ml-2 h-11 border border-dp-border px-3 font-sans text-sm"
        >
          Apply sort
        </button>
      </noscript>
    </form>
  );
}

export function ExploreQuickFilters({
  query,
  facets,
  activeCount,
}: ExploreQuickFiltersProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="hidden min-w-0 lg:block">
        <div
          className="flex flex-wrap gap-3"
          role="group"
          aria-label="Quick filters"
        >
          <form action="/explore" method="get" className="contents">
            <ExploreHiddenInputs
              query={query}
              omit={["stars", "state", "city", "cuisine", "price", "page"]}
            />

            <label className="sr-only" htmlFor="quick-stars">
              Michelin stars
            </label>
            <select
              id="quick-stars"
              name="stars"
              defaultValue={query.stars ?? ""}
              data-selected={query.stars !== null ? "true" : "false"}
              className={selectClass}
              style={chevronStyle}
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
              data-selected={query.state ? "true" : "false"}
              className={selectClass}
              style={chevronStyle}
              onChange={(event) => {
                const form = event.currentTarget.form;
                const city = form?.elements.namedItem(
                  "city",
                ) as HTMLSelectElement | null;
                if (city) city.value = "";
                form?.requestSubmit();
              }}
            >
              <option value="">State</option>
              {facets.states.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label} ({state.count})
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="quick-city">
              City
            </label>
            <select
              id="quick-city"
              name="city"
              defaultValue={query.city}
              data-selected={query.city ? "true" : "false"}
              className={selectClass}
              style={chevronStyle}
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
            >
              <option value="">City</option>
              {facets.cities.map((city) => (
                <option key={city.value} value={city.value}>
                  {city.label}, {city.stateCode} ({city.count})
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
              data-selected={query.cuisine ? "true" : "false"}
              className={selectClass}
              style={chevronStyle}
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
              data-selected={query.price ? "true" : "false"}
              className={selectClass}
              style={chevronStyle}
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
              <button
                type="submit"
                className="inline-flex h-11 min-h-11 items-center rounded-[var(--dp-radius-lg)] border border-dp-border px-4 font-sans text-[14px]"
              >
                Apply
              </button>
            </noscript>
          </form>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <div className="shrink-0 lg:hidden">
          <AllFiltersDrawer
            query={query}
            facets={facets}
            activeCount={activeCount}
          />
        </div>
        <SortControl query={query} />
        <ViewToggle query={query} />
        {activeCount > 0 ? (
          <span className="hidden lg:inline-flex">
            <ClearFiltersLink query={query} />
          </span>
        ) : null}
      </div>
    </div>
  );
}
