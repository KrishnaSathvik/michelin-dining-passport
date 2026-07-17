import { RestaurantFallback } from "./RestaurantFallback";

type RestaurantMediaProps = {
  name: string;
  city?: string;
  stars?: 1 | 2 | 3;
  /** Approved first-party image URL only — never unrelated stock. */
  imageUrl?: string | null;
  className?: string;
  priority?: boolean;
  sizes?: string;
  alt?: string;
};

/**
 * Named-restaurant media: approved photo or designed fallback.
 * Always 4:3 unless overridden by className.
 */
export function RestaurantMedia({
  name,
  city,
  stars,
  imageUrl,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 33vw",
  alt,
}: RestaurantMediaProps) {
  const url = imageUrl?.trim() || null;

  if (!url) {
    return (
      <RestaurantFallback
        name={name}
        city={city}
        stars={stars}
        className={className}
      />
    );
  }

  return (
    <div
      className={`relative aspect-[4/3] overflow-hidden rounded-[var(--dp-radius-lg)] bg-dp-soft ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- optional external approved URLs */}
      <img
        src={url}
        alt={alt ?? ""}
        sizes={sizes}
        className="h-full w-full object-cover"
        loading={priority ? "eager" : "lazy"}
      />
      <span className="sr-only">Photograph of {name}</span>
    </div>
  );
}
