"use client";

import type { ReactNode, RefObject } from "react";
import type { MapQuery } from "@/lib/map/query";
import type { RestaurantMapRowModel } from "@/components/stitch/restaurant";
import { MapResultsPanel } from "./MapResultsPanel";
import { MapFloatingControls } from "./MapFloatingControls";
import { SearchThisAreaButton } from "./SearchThisAreaButton";
import { MapMobileSheet } from "./MapMobileSheet";
import type {
  MapActiveFilterChip,
  MapFacetOptions,
  MapSelectedModel,
} from "./models";

type MapWorkspaceViewProps = {
  query: MapQuery;
  facets: MapFacetOptions;
  rows: RestaurantMapRowModel[];
  resultCountLabel: string;
  isPending: boolean;
  activeFilters: MapActiveFilterChip[];
  selected: MapSelectedModel | null;
  selectedIndex: number;
  totalFiltered: number;
  showSearchArea: boolean;
  hasAreaFilter: boolean;
  mapFailed: boolean;
  isDesktopViewport: boolean;
  sheetExpanded: boolean;
  attribution: string;
  providerName: string;
  listRef: RefObject<HTMLDivElement | null>;
  itemRefs: RefObject<Record<string, HTMLDivElement | null>>;
  mapStage: ReactNode;
  onQueryChange: (q: string) => void;
  onFilterChange: (patch: Partial<MapQuery>) => void;
  onSelect: (slug: string) => void;
  onClearAllFilters: () => void;
  onFit: () => void;
  onReset: () => void;
  onClearArea: () => void;
  onSearchThisArea: () => void;
  onTogglePanel: () => void;
  onToggleSheetExpanded: () => void;
  onSheetPrevious: () => void;
  onSheetNext: () => void;
  onSheetClose: () => void;
};

/**
 * Stitch dining_passport_map_workspace composition.
 * MapCanvas is injected as mapStage — domain logic stays in the controller.
 */
export function MapWorkspaceView({
  query,
  facets,
  rows,
  resultCountLabel,
  isPending,
  activeFilters,
  selected,
  selectedIndex,
  totalFiltered,
  showSearchArea,
  hasAreaFilter,
  mapFailed,
  isDesktopViewport,
  sheetExpanded,
  attribution,
  providerName,
  listRef,
  itemRefs,
  mapStage,
  onQueryChange,
  onFilterChange,
  onSelect,
  onClearAllFilters,
  onFit,
  onReset,
  onClearArea,
  onSearchThisArea,
  onTogglePanel,
  onToggleSheetExpanded,
  onSheetPrevious,
  onSheetNext,
  onSheetClose,
}: MapWorkspaceViewProps) {
  const panelVisible = query.panel === "list";

  return (
    <div
      className="relative flex h-full min-h-0 flex-col bg-dp-surface lg:flex-row"
      data-map="stitch-workspace"
    >
      <h1 className="sr-only">Map</h1>
      <MapResultsPanel
        query={query}
        facets={facets}
        rows={rows}
        resultCountLabel={resultCountLabel}
        isPending={isPending}
        activeFilters={activeFilters}
        selected={selected}
        showSelectedDetail={Boolean(selected && isDesktopViewport)}
        hasAreaFilter={hasAreaFilter}
        listRef={listRef}
        itemRefs={itemRefs}
        panelVisible={panelVisible}
        onQueryChange={onQueryChange}
        onFilterChange={onFilterChange}
        onSelect={onSelect}
        onClearAllFilters={onClearAllFilters}
        onFit={onFit}
      />

      <div
        className={`relative min-h-0 min-w-0 flex-1 ${
          query.panel === "list" ? "hidden lg:block" : "block"
        }`}
        data-map-stage
      >
        <div className="absolute inset-0">{mapStage}</div>

        <SearchThisAreaButton
          visible={showSearchArea}
          onSearch={onSearchThisArea}
        />

        <MapFloatingControls
          onFit={onFit}
          onReset={onReset}
          onClearArea={onClearArea}
          hasAreaFilter={hasAreaFilter}
          showListToggle
          panel={query.panel}
          onTogglePanel={onTogglePanel}
        />

        {mapFailed ? (
          <p
            className="absolute bottom-4 left-4 right-4 z-10 rounded-[var(--dp-radius-md)] bg-dp-surface/95 p-3 font-sans text-sm text-dp-ink-muted shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
            role="status"
          >
            Map tiles failed to load. Use the result list to browse restaurants.
          </p>
        ) : (
          <p className="pointer-events-none absolute bottom-2 left-3 z-10 hidden font-sans text-[10px] text-dp-ink-muted lg:block">
            {providerName} · {attribution}
          </p>
        )}
      </div>

      {selected && query.panel !== "list" ? (
        <MapMobileSheet
          selected={selected}
          sheetExpanded={sheetExpanded}
          selectedIndex={selectedIndex}
          totalFiltered={totalFiltered}
          onToggleExpanded={onToggleSheetExpanded}
          onPrevious={onSheetPrevious}
          onNext={onSheetNext}
          onClose={onSheetClose}
        />
      ) : null}
    </div>
  );
}
