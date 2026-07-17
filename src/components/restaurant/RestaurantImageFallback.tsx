import type { Restaurant } from "@/lib/data/types";

type RestaurantImageFallbackProps = {
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

/**
 * Premium designed non-photo fallback for named restaurants without approved imagery.
 * Must not resemble plated food or dining-room stock photography.
 */
export function RestaurantImageFallback({
  restaurant,
  className = "",
  priorityVisual = false,
}: RestaurantImageFallbackProps) {
  const mark = initials(restaurant.name);

  return (
    <div
      className={`relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-forest ${className}`}
      role="img"
      aria-label={`${restaurant.name} — image coming soon`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 20% 15%, rgba(184,138,42,0.35), transparent 55%), radial-gradient(ellipse 70% 60% at 90% 90%, rgba(255,255,255,0.08), transparent 50%)",
        }}
        aria-hidden="true"
      />

      <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <p
            className={`font-display text-4xl text-white/95 sm:text-5xl ${
              priorityVisual ? "rise-in" : ""
            }`}
          >
            {mark}
          </p>
          <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-white/55">
            {"★".repeat(restaurant.stars)}
            <span className="sr-only">
              {restaurant.stars === 1
                ? "One Michelin star"
                : restaurant.stars === 2
                  ? "Two Michelin stars"
                  : "Three Michelin stars"}
            </span>
          </p>
        </div>

        <div className="max-w-[18rem]">
          <p className="font-display text-xl leading-tight text-white sm:text-2xl">
            {restaurant.name}
          </p>
          <p className="mt-2 font-sans text-sm text-white/70">
            {restaurant.city}
          </p>
        </div>
      </div>
    </div>
  );
}
