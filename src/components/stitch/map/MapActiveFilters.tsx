"use client";

import type { MapActiveFilterChip } from "./models";

type MapActiveFiltersProps = {
  chips: MapActiveFilterChip[];
  onClearAll?: () => void;
};

export function MapActiveFilters({ chips, onClearAll }: MapActiveFiltersProps) {
  if (chips.length === 0) return null;

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div
        className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Active map filters"
      >
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={chip.onClear}
            className="inline-flex h-11 min-h-11 shrink-0 items-center gap-2 rounded-[var(--dp-radius-md)] border border-dp-border bg-dp-soft px-3 font-sans text-[13px] font-medium text-dp-ink transition-colors hover:border-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          >
            <span>{chip.label}</span>
            <span aria-hidden="true" className="text-dp-ink-muted">
              ×
            </span>
            <span className="sr-only">Remove {chip.label} filter</span>
          </button>
        ))}
      </div>
      {onClearAll ? (
        <button
          type="button"
          onClick={onClearAll}
          className="dp-meta self-start text-dp-ink-muted hover:text-dp-ink"
        >
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
