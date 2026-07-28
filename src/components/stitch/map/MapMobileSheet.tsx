"use client";

import type { CSSProperties } from "react";
import { MapSelectedRestaurant } from "./MapSelectedRestaurant";
import type { MapSelectedModel } from "./models";

type MapMobileSheetProps = {
  selected: MapSelectedModel;
  sheetExpanded: boolean;
  selectedIndex: number;
  totalFiltered: number;
  onToggleExpanded: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
};

export function MapMobileSheet({
  selected,
  sheetExpanded,
  selectedIndex,
  totalFiltered,
  onToggleExpanded,
  onPrevious,
  onNext,
  onClose,
}: MapMobileSheetProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 rounded-t-[var(--dp-radius-xl,12px)] border-t border-dp-border bg-dp-surface shadow-[0_-8px_32px_rgba(0,0,0,0.12)] lg:hidden"
      style={
        {
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        } as CSSProperties
      }
      role="dialog"
      aria-label="Selected restaurant preview"
      aria-modal="false"
      data-map-mobile-sheet
      data-expanded={sheetExpanded ? "true" : "false"}
    >
      <div
        className="mx-auto mt-2 h-1 w-10 rounded-full bg-dp-border"
        aria-hidden="true"
      />
      <div className="flex items-center justify-between gap-2 px-3 pt-2">
        <button
          type="button"
          className="min-h-11 px-2 font-sans text-sm text-dp-ink-muted"
          onClick={onToggleExpanded}
          aria-expanded={sheetExpanded}
        >
          {sheetExpanded ? "Collapse" : "Expand"}
        </button>
        <div className="flex gap-1">
          <button
            type="button"
            className="min-h-11 min-w-11 rounded-[var(--dp-radius-md)] border border-dp-border px-2 font-sans text-sm disabled:opacity-40"
            disabled={selectedIndex <= 0}
            onClick={onPrevious}
            aria-label="Previous restaurant"
          >
            Prev
          </button>
          <button
            type="button"
            className="min-h-11 min-w-11 rounded-[var(--dp-radius-md)] border border-dp-border px-2 font-sans text-sm disabled:opacity-40"
            disabled={selectedIndex < 0 || selectedIndex >= totalFiltered - 1}
            onClick={onNext}
            aria-label="Next restaurant"
          >
            Next
          </button>
          <button
            type="button"
            className="min-h-11 rounded-[var(--dp-radius-md)] border border-dp-border px-3 font-sans text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
      <div className={`px-4 pb-3 ${sheetExpanded ? "max-h-[70dvh] overflow-y-auto pt-2" : "pt-1"}`}>
        <MapSelectedRestaurant
          selected={selected}
          surface="map_mobile_sheet"
          showGoogle={sheetExpanded}
          showAddress={sheetExpanded}
        />
      </div>
    </div>
  );
}
