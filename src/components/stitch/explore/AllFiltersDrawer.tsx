"use client";

import { useId, useRef, useState } from "react";
import { Drawer } from "@/components/stitch/Drawer";
import { Button } from "@/components/stitch/Button";
import { Select } from "@/components/stitch/Select";
import { SearchInput } from "@/components/stitch/SearchInput";
import {
  buildExploreHref,
  type ExploreFacets,
  type ExploreQuery,
} from "@/lib/data/explore";

type AllFiltersDrawerProps = {
  query: ExploreQuery;
  facets: ExploreFacets;
  activeCount: number;
};

const sectionLabel =
  "dp-label-caps mb-4 block text-dp-ink-muted";

const radioRow =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--dp-radius-md)] px-1 font-sans text-[15px] text-dp-ink";

const priceButton =
  "inline-flex min-h-11 flex-1 items-center justify-center rounded-[var(--dp-radius-md)] border border-dp-border bg-dp-surface px-3 font-sans text-[14px] text-dp-ink transition-colors hover:border-dp-primary has-[:checked]:border-dp-primary has-[:checked]:bg-dp-soft has-[:checked]:font-medium has-[:checked]:text-dp-primary";

export function AllFiltersDrawer({
  query,
  facets,
  activeCount,
}: AllFiltersDrawerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const formId = useId();

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 min-h-11 shrink-0 items-center gap-2 rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface-low px-4 font-sans text-[14px] font-medium text-dp-ink transition-colors hover:border-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus data-[open=true]:border-dp-primary data-[open=true]:bg-dp-soft"
        aria-haspopup="dialog"
        aria-expanded={open}
        data-open={open ? "true" : "false"}
        data-explore-all-filters
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 7h16M7 12h10M10 17h4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        All Filters
        {activeCount > 0 ? (
          <span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-[var(--dp-radius-md)] bg-dp-primary px-1.5 text-[12px] font-semibold text-dp-on-primary">
            {activeCount}
          </span>
        ) : null}
      </button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="All filters"
        returnFocusRef={triggerRef}
        footer={
          <div className="flex items-center justify-between gap-4">
            <a
              href={buildExploreHref({
                sort: query.sort,
                view: query.view,
              })}
              className="dp-meta text-dp-ink-secondary underline underline-offset-4 hover:text-dp-primary"
              onClick={() => setOpen(false)}
            >
              Clear filters
            </a>
            <Button
              type="submit"
              form={formId}
              className="min-w-[200px]"
              onClick={() => setOpen(false)}
            >
              Apply filters
            </Button>
          </div>
        }
      >
        <form
          id={formId}
          action="/explore"
          method="get"
          className="flex flex-col gap-8"
        >
          <input type="hidden" name="sort" value={query.sort} />
          <input type="hidden" name="view" value={query.view} />

          <section>
            <span className={sectionLabel}>Search within results</span>
            <SearchInput
              id="drawer-q"
              name="q"
              defaultValue={query.q}
              label="Search within results"
              placeholder="Restaurant, city, cuisine…"
              autoComplete="off"
            />
          </section>

          <fieldset className="border-0 p-0">
            <legend className={sectionLabel}>Michelin distinction</legend>
            <div className="flex flex-col gap-1">
              <label className={radioRow}>
                <input
                  type="radio"
                  name="stars"
                  value=""
                  defaultChecked={query.stars === null}
                  className="h-5 w-5 accent-[var(--dp-primary)]"
                />
                Any distinction
              </label>
              {facets.stars.map((star) => (
                <label key={star.value} className={radioRow}>
                  <input
                    type="radio"
                    name="stars"
                    value={star.value}
                    defaultChecked={query.stars === star.value}
                    className="h-5 w-5 accent-[var(--dp-primary)]"
                  />
                  {star.label}
                  <span className="text-dp-ink-muted">({star.count})</span>
                </label>
              ))}
            </div>
          </fieldset>

          <section className="flex flex-col gap-4">
            <span className={sectionLabel}>Location</span>
            <Select
              id="drawer-state"
              name="state"
              label="State"
              defaultValue={query.state}
            >
              <option value="">All states</option>
              {facets.states.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label} ({state.count})
                </option>
              ))}
            </Select>
            <Select
              id="drawer-city"
              name="city"
              label="City"
              defaultValue={query.city}
            >
              <option value="">All cities</option>
              {facets.cities.map((city) => (
                <option key={city.value} value={city.value}>
                  {city.label}, {city.stateCode} ({city.count})
                </option>
              ))}
            </Select>
          </section>

          <section>
            <Select
              id="drawer-cuisine"
              name="cuisine"
              label="Cuisine"
              defaultValue={query.cuisine}
            >
              <option value="">All cuisines</option>
              {facets.cuisines.map((cuisine) => (
                <option key={cuisine.value} value={cuisine.value}>
                  {cuisine.label} ({cuisine.count})
                </option>
              ))}
            </Select>
          </section>

          <fieldset className="border-0 p-0">
            <legend className={sectionLabel}>Price</legend>
            <div className="flex gap-2">
              <label className={priceButton}>
                <input
                  type="radio"
                  name="price"
                  value=""
                  defaultChecked={!query.price}
                  className="sr-only"
                />
                Any
              </label>
              {facets.prices.map((price) => (
                <label key={price.value} className={priceButton}>
                  <input
                    type="radio"
                    name="price"
                    value={price.value}
                    defaultChecked={query.price === price.value}
                    className="sr-only"
                  />
                  {price.label}
                </label>
              ))}
            </div>
          </fieldset>
        </form>
      </Drawer>
    </>
  );
}
