type SkeletonProps = {
  className?: string;
};

/** Soft shimmer block matching Stitch system_states. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-[var(--dp-radius-md)] bg-dp-soft ${className}`}
      aria-hidden="true"
    />
  );
}

export function RestaurantCardSkeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <Skeleton className="aspect-[4/3] w-full rounded-[var(--dp-radius-lg)]" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-[var(--dp-control-height)] w-full rounded-[var(--dp-radius-lg)]" />
    </div>
  );
}

export function SkeletonGrid({
  count = 8,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 ${className}`}
      aria-busy="true"
      aria-label="Loading"
    >
      {Array.from({ length: count }, (_, index) => (
        <RestaurantCardSkeleton key={index} />
      ))}
    </div>
  );
}
