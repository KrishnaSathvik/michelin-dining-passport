import { MichelinDistinction } from "./MichelinDistinction";

type RestaurantFallbackProps = {
  name: string;
  /** Stable seed for deterministic palette variation (slug or id). */
  seed?: string;
  city?: string;
  stars?: 1 | 2 | 3;
  className?: string;
};

type FallbackPalette = {
  base: string;
  accent: string;
  geometry: string;
};

const PALETTES: readonly FallbackPalette[] = [
  {
    base: "var(--dp-primary)",
    accent: "color-mix(in srgb, var(--dp-star-gold) 32%, transparent)",
    geometry: "rgba(255,255,255,0.1)",
  },
  {
    base: "var(--dp-primary-deep)",
    accent: "color-mix(in srgb, var(--dp-burgundy) 28%, transparent)",
    geometry: "rgba(245,246,244,0.12)",
  },
  {
    base: "#1a4a3c",
    accent: "color-mix(in srgb, var(--dp-soft) 22%, transparent)",
    geometry: "color-mix(in srgb, var(--dp-star-gold) 18%, transparent)",
  },
  {
    base: "#2a3d36",
    accent: "color-mix(in srgb, var(--dp-star-gold) 24%, transparent)",
    geometry: "rgba(255,255,255,0.08)",
  },
  {
    base: "#3d2a2e",
    accent: "color-mix(in srgb, var(--dp-soft) 18%, transparent)",
    geometry: "color-mix(in srgb, var(--dp-burgundy) 22%, transparent)",
  },
] as const;

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function initials(name: string): string {
  const parts = name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "·";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}

/**
 * Designed non-photo fallback for named restaurants without approved imagery.
 * Variation derives from stable first-party seed (slug/id). Cohesive Stitch palette.
 */
export function RestaurantFallback({
  name,
  seed,
  city,
  stars,
  className = "",
}: RestaurantFallbackProps) {
  const mark = initials(name);
  const palette = PALETTES[hashSeed(seed ?? name) % PALETTES.length]!;
  const geometryShift = (hashSeed(seed ?? name) % 40) - 20;

  return (
    <div
      className={`relative overflow-hidden rounded-[var(--dp-radius-lg)] ${
        className.includes("aspect-") ? "" : "aspect-[4/3]"
      } ${className}`}
      style={{ background: palette.base }}
      role="img"
      aria-label={`${name}${city ? ` in ${city}` : ""}`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 75% 65% at ${22 + geometryShift}% 18%, ${palette.accent}, transparent 55%), radial-gradient(ellipse 55% 50% at ${88 - geometryShift}% 92%, ${palette.geometry}, transparent 50%)`,
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full border border-white/15"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-8 left-8 h-24 w-24 rotate-12 border border-white/10"
        aria-hidden="true"
      />
      <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="font-display text-4xl text-white/95 sm:text-5xl" aria-hidden="true">
            {mark}
          </p>
          {stars ? (
            <MichelinDistinction stars={stars} variant="row" />
          ) : null}
        </div>
        <div className="max-w-[18rem]">
          <p className="font-display text-xl leading-tight text-white sm:text-2xl" aria-hidden="true">
            {name}
          </p>
          {city ? (
            <p className="mt-2 font-sans text-sm text-white/70" aria-hidden="true">
              {city}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
