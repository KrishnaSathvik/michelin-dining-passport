"use client";

import { RestaurantMapRow } from "@/components/stitch/restaurant";
import type { RestaurantMapRowModel } from "@/components/stitch/restaurant";
import type { RefObject } from "react";

type MapResultsListProps = {
  rows: RestaurantMapRowModel[];
  listRef: RefObject<HTMLDivElement | null>;
  itemRefs: RefObject<Record<string, HTMLDivElement | null>>;
  onSelect: (slug: string) => void;
};

export function MapResultsList({
  rows,
  listRef,
  itemRefs,
  onSelect,
}: MapResultsListProps) {
  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label="Map restaurant results"
      className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4"
      data-map-results-list
    >
      {rows.map((row) => (
        <div
          key={row.slug}
          ref={(node) => {
            itemRefs.current[row.slug] = node;
          }}
        >
          <RestaurantMapRow model={row} onSelect={onSelect} />
        </div>
      ))}
    </div>
  );
}
