import { Skeleton } from "../Skeleton";

type SkeletonProps = {
  className?: string;
};

/** Discovery card skeleton — matches 4:3 media + meta + CTA proportions. */
export function RestaurantCardSkeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`flex min-w-[min(100%,280px)] flex-col gap-3 ${className}`}
      data-skeleton="discovery-card"
      aria-hidden="true"
    >
      <Skeleton className="aspect-[4/3] w-full rounded-[var(--dp-radius-lg)]" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="mt-1 h-[var(--dp-control-height)] w-full rounded-[var(--dp-radius-lg)]" />
    </div>
  );
}

/** Editorial card skeleton — split media + copy. */
export function RestaurantEditorialCardSkeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`grid gap-6 overflow-hidden rounded-[var(--dp-radius-lg)] border border-dp-border md:grid-cols-2 md:gap-0 ${className}`}
      data-skeleton="editorial-card"
      aria-hidden="true"
    >
      <Skeleton className="min-h-[16rem] rounded-none md:min-h-[22rem]" />
      <div className="flex flex-col justify-center gap-3 px-6 py-8 md:px-10">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-4 flex gap-3">
          <Skeleton className="h-12 w-40 rounded-[var(--dp-radius-lg)]" />
          <Skeleton className="h-12 w-28 rounded-[var(--dp-radius-lg)]" />
        </div>
      </div>
    </div>
  );
}

/** List row skeleton — ~120px media + identity + actions. */
export function RestaurantRowSkeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`flex flex-col gap-4 border-b border-dp-border py-5 sm:flex-row sm:items-center sm:gap-6 ${className}`}
      data-skeleton="list-row"
      aria-hidden="true"
    >
      <Skeleton className="aspect-[4/3] w-full rounded-[var(--dp-radius-lg)] sm:aspect-square sm:h-[120px] sm:w-[120px]" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-11 w-11 rounded-[var(--dp-radius-lg)]" />
        <Skeleton className="h-11 w-36 rounded-[var(--dp-radius-lg)]" />
      </div>
    </div>
  );
}

/** Compact map panel row skeleton. */
export function RestaurantMapRowSkeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-[var(--dp-radius-lg)] border border-dp-border p-4 ${className}`}
      data-skeleton="map-row"
      aria-hidden="true"
    >
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
    </div>
  );
}
