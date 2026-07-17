import type { Restaurant } from "@/lib/data/types";

type RestaurantImagePlaceholderProps = {
  restaurant: Pick<Restaurant, "name" | "city" | "stars">;
  className?: string;
  priorityVisual?: boolean;
};

function initials(name: string): string {
  const parts = name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "·";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function RestaurantImagePlaceholder({
  restaurant,
  className = "",
  priorityVisual = false,
}: RestaurantImagePlaceholderProps) {
  const mark = initials(restaurant.name);

  return (
    <div
      className={`relative aspect-[4/3] overflow-hidden border border-border bg-bg-elevated paper-texture ${className}`}
      role="img"
      aria-label={`Editorial placeholder for ${restaurant.name}`}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full text-border"
        viewBox="0 0 400 300"
        aria-hidden="true"
      >
        <line
          x1="28"
          y1="36"
          x2="28"
          y2="264"
          stroke="currentColor"
          strokeWidth="1"
        />
        <line
          x1="28"
          y1="264"
          x2="372"
          y2="264"
          stroke="currentColor"
          strokeWidth="1"
        />
        <path
          d="M70 220 L140 120 L210 180 L280 90 L340 160"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.7"
        />
        <circle cx="340" cy="56" r="18" fill="none" stroke="currentColor" />
      </svg>

      <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <p
            className={`font-display text-4xl text-forest sm:text-5xl ${
              priorityVisual ? "rise-in" : ""
            }`}
          >
            {mark}
          </p>
          <p className="font-sans text-xs uppercase tracking-[0.16em] text-ink-muted">
            Placeholder
          </p>
        </div>

        <div className="max-w-[18rem]">
          <p className="font-display text-xl leading-tight text-ink sm:text-2xl">
            {restaurant.name}
          </p>
          <p className="mt-2 font-sans text-sm text-ink-muted">
            {restaurant.city}
            <span className="mx-2 text-border" aria-hidden="true">
              ·
            </span>
            <span className="text-gold">
              {"★".repeat(restaurant.stars)}
            </span>
            <span className="sr-only">
              {restaurant.stars === 1
                ? "One Michelin star"
                : restaurant.stars === 2
                  ? "Two Michelin stars"
                  : "Three Michelin stars"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
