"use client";

import { RestaurantMapRowSkeleton } from "@/components/stitch/restaurant";
import { Skeleton } from "@/components/stitch/Skeleton";

/**
 * Map loading composition — panel skeletons; map stage stays mounted by parent.
 */
export function MapLoadingState() {
  return (
    <div
      className="flex h-full min-h-0 flex-col bg-dp-surface lg:flex-row"
      data-map="loading"
      aria-busy="true"
      aria-live="polite"
    >
      <aside className="flex w-full flex-col border-r border-dp-outline-variant lg:w-[var(--dp-map-panel-width)] lg:shrink-0">
        <div className="space-y-4 border-b border-dp-outline-variant p-6">
          <Skeleton className="h-12 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-11 w-24" />
            <Skeleton className="h-11 w-24" />
            <Skeleton className="h-11 w-28" />
          </div>
        </div>
        <div className="flex-1 space-y-2 overflow-hidden p-4">
          {Array.from({ length: 6 }, (_, index) => (
            <RestaurantMapRowSkeleton key={index} />
          ))}
        </div>
      </aside>
      <div className="relative min-h-0 flex-1 bg-dp-soft">
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>
      <p className="sr-only">Loading map workspace…</p>
    </div>
  );
}
