"use client";

import { FilterChip } from "@/components/stitch/FilterChip";
import type { MapQuery } from "@/lib/map/query";
import type { MapFacetOptions } from "./models";

type MapQuickFiltersProps = {
  query: MapQuery;
  facets: MapFacetOptions;
  onChange: (patch: Partial<MapQuery>) => void;
};

const selectClass =
  "inline-flex h-11 min-h-11 min-w-[6.5rem] shrink-0 appearance-none items-center rounded-full border border-dp-outline-variant bg-dp-surface bg-[length:12px] bg-[position:right_10px_center] bg-no-repeat px-4 pr-8 font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-dp-ink-secondary outline-none transition-colors hover:border-dp-primary hover:text-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus data-[selected=true]:border-dp-primary data-[selected=true]:bg-dp-soft data-[selected=true]:text-dp-primary";

export function MapQuickFilters({
  query,
  facets,
  onChange,
}: MapQuickFiltersProps) {
  return (
    <div
      className="relative flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="group"
      aria-label="Map filters"
    >
      <label className="sr-only" htmlFor="map-stars">
        Michelin stars
      </label>
      <select
        id="map-stars"
        aria-label="Michelin stars"
        value={query.stars ?? ""}
        data-selected={query.stars !== null ? "true" : "false"}
        className={selectClass}
        onChange={(event) => {
          const value = event.target.value;
          onChange({
            stars:
              value === "1" || value === "2" || value === "3"
                ? (Number(value) as 1 | 2 | 3)
                : null,
          });
        }}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' stroke='%23717975' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
        }}
      >
        <option value="">Stars</option>
        <option value="1">1 Michelin Star</option>
        <option value="2">2 Michelin Stars</option>
        <option value="3">3 Michelin Stars</option>
      </select>

      <label className="sr-only" htmlFor="map-state">
        State
      </label>
      <select
        id="map-state"
        aria-label="State"
        value={query.state}
        data-selected={query.state ? "true" : "false"}
        className={selectClass}
        onChange={(event) => onChange({ state: event.target.value })}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' stroke='%23717975' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
        }}
      >
        <option value="">State</option>
        {facets.states.map((state) => (
          <option key={state.value} value={state.value}>
            {state.label}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="map-cuisine">
        Cuisine
      </label>
      <select
        id="map-cuisine"
        aria-label="Cuisine"
        value={query.cuisine}
        data-selected={query.cuisine ? "true" : "false"}
        className={selectClass}
        onChange={(event) => onChange({ cuisine: event.target.value })}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' stroke='%23717975' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
        }}
      >
        <option value="">Cuisine</option>
        {facets.cuisines.map((cuisine) => (
          <option key={cuisine.value} value={cuisine.value}>
            {cuisine.label}
          </option>
        ))}
      </select>

      <FilterChip
        selected={query.savedOnly}
        aria-pressed={query.savedOnly}
        onClick={() => onChange({ savedOnly: !query.savedOnly })}
        className="h-11 min-h-11 shrink-0 rounded-full px-4 text-[12px] font-semibold uppercase tracking-[0.08em]"
      >
        Saved
      </FilterChip>
      <FilterChip
        selected={query.visitedOnly}
        aria-pressed={query.visitedOnly}
        onClick={() => onChange({ visitedOnly: !query.visitedOnly })}
        className="h-11 min-h-11 shrink-0 rounded-full px-4 text-[12px] font-semibold uppercase tracking-[0.08em]"
      >
        Visited
      </FilterChip>
    </div>
  );
}
