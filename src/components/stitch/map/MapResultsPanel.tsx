"use client";

import type { RefObject } from "react";
import type { MapQuery } from "@/lib/map/query";
import type { RestaurantMapRowModel } from "@/components/stitch/restaurant";
import { MapSearch } from "./MapSearch";
import { MapQuickFilters } from "./MapQuickFilters";
import { MapActiveFilters } from "./MapActiveFilters";
import { MapResultsHeader } from "./MapResultsHeader";
import { MapResultsList } from "./MapResultsList";
import { MapSelectedRestaurant } from "./MapSelectedRestaurant";
import { MapEmptyState } from "./MapEmptyState";
import type {
  MapActiveFilterChip,
  MapFacetOptions,
  MapSelectedModel,
} from "./models";

type MapResultsPanelProps = {
  query: MapQuery;
  facets: MapFacetOptions;
  rows: RestaurantMapRowModel[];
  resultCountLabel: string;
  isPending: boolean;
  activeFilters: MapActiveFilterChip[];
  selected: MapSelectedModel | null;
  showSelectedDetail: boolean;
  hasAreaFilter: boolean;
  listRef: RefObject<HTMLDivElement | null>;
  itemRefs: RefObject<Record<string, HTMLDivElement | null>>;
  panelVisible: boolean;
  onQueryChange: (q: string) => void;
  onFilterChange: (patch: Partial<MapQuery>) => void;
  onSelect: (slug: string) => void;
  onClearAllFilters: () => void;
  onFit: () => void;
};

export function MapResultsPanel({
  query,
  facets,
  rows,
  resultCountLabel,
  isPending,
  activeFilters,
  selected,
  showSelectedDetail,
  hasAreaFilter,
  listRef,
  itemRefs,
  panelVisible,
  onQueryChange,
  onFilterChange,
  onSelect,
  onClearAllFilters,
  onFit,
}: MapResultsPanelProps) {
  return (
    <aside
      className={`z-20 flex w-full flex-col border-dp-outline-variant bg-dp-surface shadow-[4px_0_24px_rgba(0,0,0,0.02)] lg:w-[360px] lg:shrink-0 lg:border-r xl:w-[var(--dp-map-panel-width)] ${
        panelVisible ? "flex min-h-0 flex-1" : "hidden lg:flex"
      }`}
      data-map-results-panel
      aria-label="Map results"
    >
      <div className="sticky top-0 z-10 border-b border-dp-outline-variant bg-dp-surface p-6">
        <MapSearch query={query} onQueryChange={onQueryChange} />
        <MapQuickFilters
          query={query}
          facets={facets}
          onChange={onFilterChange}
        />
        <MapActiveFilters
          chips={activeFilters}
          onClearAll={
            activeFilters.length > 0 ? onClearAllFilters : undefined
          }
        />
        <MapResultsHeader
          resultCountLabel={resultCountLabel}
          isPending={isPending}
        />
      </div>

      {rows.length === 0 ? (
        <MapEmptyState
          hasAreaFilter={hasAreaFilter}
          onFit={onFit}
          onClearFilters={onClearAllFilters}
        />
      ) : (
        <MapResultsList
          rows={rows}
          listRef={listRef}
          itemRefs={itemRefs}
          onSelect={onSelect}
        />
      )}

      {selected && showSelectedDetail ? (
        <div className="sticky bottom-0 z-10 border-t border-dp-outline-variant bg-dp-surface p-6 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
          <MapSelectedRestaurant
            selected={selected}
            surface="map_marker"
            showGoogle
          />
        </div>
      ) : null}
    </aside>
  );
}
