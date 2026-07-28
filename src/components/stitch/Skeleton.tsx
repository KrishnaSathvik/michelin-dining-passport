import { RestaurantCardSkeleton } from "./restaurant/RestaurantCardSkeleton";

export { RestaurantCardSkeleton };

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
