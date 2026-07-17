import type { Restaurant } from "@/lib/data/types";
import { RestaurantImageFallback } from "./RestaurantImageFallback";

type RestaurantMediaProps = {
  restaurant: Pick<Restaurant, "name" | "city" | "stars"> & {
    /** Approved owned/licensed URL only — never unverified stock */
    heroImageUrl?: string | null;
  };
  className?: string;
  priorityVisual?: boolean;
  sizes?: string;
};

/**
 * Named-restaurant media surface.
 * Shows approved photography when present; otherwise a designed non-photo fallback.
 * Never assigns unrelated atmospheric stock to a named restaurant.
 */
export function RestaurantMedia({
  restaurant,
  className = "",
  priorityVisual = false,
  sizes = "(max-width: 768px) 100vw, 33vw",
}: RestaurantMediaProps) {
  const url = restaurant.heroImageUrl?.trim() || null;

  if (url) {
    return (
      <div
        className={`relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-surface-soft ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- optional external approved URLs; next/image remotePatterns not configured yet */}
        <img
          src={url}
          alt=""
          sizes={sizes}
          className="h-full w-full object-cover"
          loading={priorityVisual ? "eager" : "lazy"}
        />
        <span className="sr-only">
          Photograph of {restaurant.name}
        </span>
      </div>
    );
  }

  return (
    <RestaurantImageFallback
      restaurant={restaurant}
      className={className}
      priorityVisual={priorityVisual}
    />
  );
}
