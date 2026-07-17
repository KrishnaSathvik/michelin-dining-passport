import type { Restaurant } from "@/lib/data/types";

type CardSkeletonProps = {
  count?: number;
  className?: string;
};

export function RestaurantCardSkeleton({
  count = 1,
  className = "",
}: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={`animate-pulse ${className}`}
          aria-hidden="true"
        >
          <div className="aspect-[4/3] rounded-[var(--radius-lg)] bg-surface-soft" />
          <div className="mt-4 h-3 w-16 rounded bg-surface-soft" />
          <div className="mt-3 h-6 w-3/4 rounded bg-surface-soft" />
          <div className="mt-2 h-4 w-1/2 rounded bg-surface-soft" />
          <div className="mt-4 h-11 w-full rounded-[var(--radius-md)] bg-surface-soft" />
        </div>
      ))}
    </>
  );
}

export function restaurantCardSkeletonKey(restaurant: Restaurant): string {
  return restaurant.slug;
}
