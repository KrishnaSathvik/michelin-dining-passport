"use client";

import Link from "next/link";
import type { ExploreFacets, ExploreQuery } from "@/lib/data/explore";
import { buildExploreHref } from "@/lib/data/explore";
import { ExploreHiddenInputs } from "./filters";
import { AllFiltersDrawer } from "./AllFiltersDrawer";

type ExploreQuickFiltersProps = {
  query: ExploreQuery;
  facets: ExploreFacets;
  activeCount: number;
};

const selectClass =
  "inline-flex h-11 min-h-11 min-w-[7.5rem] appearance-none items-center rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface bg-[length:12px] bg-[position:right_12px_center] bg-no-repeat px-4 pr-9 font-sans text-[14px] text-dp-ink outline-none transition-colors hover:border-dp-primary focus-visible:border-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus data-[selected=true]:border-dp-primary data-[selected=true]:bg-dp-soft data-[selected=true]:font-medium";

export function ExploreQuickFilters({
  query,
  facets,
  activeCount,
}: ExploreQuickFiltersProps) {
  return (
    <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative min-w-0 flex-1">
        <div
          className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
            >
              <option value="">Michelin Stars</option>
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

          <div
            className="mx-1 hidden h-6 w-px shrink-0 self-center bg-dp-border sm:block"
            aria-hidden="true"
          />

          <AllFiltersDrawer
            query={query}
            facets={facets}
            activeCount={activeCount}
          />
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-dp-surface to-transparent sm:hidden"
          aria-hidden="true"
        />
      </div>

      {activeCount > 0 ? (
        <Link
          href={buildExploreHref({ sort: query.sort, view: query.view })}
          className="dp-meta shrink-0 text-dp-ink-muted no-underline hover:text-dp-ink"
        >
          Clear filters
        </Link>
      ) : null}
    </div>
  );
}
