import {
  RestaurantCardSkeleton,
  RestaurantRowSkeleton,
} from "@/components/stitch/restaurant";
import { PageContainer } from "@/components/stitch/PageContainer";
import { Skeleton } from "@/components/stitch/Skeleton";

type ExploreLoadingStateProps = {
  view?: "grid" | "list";
};

/**
 * Explore loading composition from dining_passport_system_states.
 * Toolbar silhouette stays stable; result area mirrors grid/list.
 */
export function ExploreLoadingState({
  view = "grid",
}: ExploreLoadingStateProps) {
  return (
    <div
      data-explore="loading"
      aria-busy="true"
      aria-live="polite"
      className="border-b border-dp-border"
    >
      <PageContainer className="pt-10 pb-6 md:pt-16 md:pb-8">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-4 h-12 w-full max-w-xl md:h-14" />
        <Skeleton className="mt-4 h-5 w-full max-w-2xl" />
        <Skeleton className="mt-3 h-4 w-40" />
      </PageContainer>

      <div className="sticky top-[var(--dp-header-height)] z-30 border-b border-dp-border bg-dp-surface/95 backdrop-blur-sm">
        <PageContainer className="flex flex-col gap-4 py-4 pb-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-12 w-full flex-1" />
            <Skeleton className="h-12 w-full sm:w-28" />
          </div>
          <div className="flex gap-3 overflow-hidden">
            <Skeleton className="h-11 w-28 shrink-0" />
            <Skeleton className="h-11 w-24 shrink-0" />
            <Skeleton className="h-11 w-24 shrink-0" />
            <Skeleton className="h-11 w-28 shrink-0" />
            <Skeleton className="h-11 w-20 shrink-0" />
          </div>
        </PageContainer>
      </div>

      <PageContainer className="py-6">
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-dp-border pb-4">
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-3">
            <Skeleton className="h-11 w-52" />
            <Skeleton className="h-11 w-24" />
          </div>
        </div>

        {view === "list" ? (
          <div className="flex flex-col" data-explore-loading="list">
            {Array.from({ length: 6 }, (_, index) => (
              <RestaurantRowSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div
            className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            data-explore-loading="grid"
          >
            {Array.from({ length: 8 }, (_, index) => (
              <RestaurantCardSkeleton key={index} />
            ))}
          </div>
        )}
      </PageContainer>
      <p className="sr-only">Loading restaurants…</p>
    </div>
  );
}
