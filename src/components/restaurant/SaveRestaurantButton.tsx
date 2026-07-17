"use client";

import { usePassport } from "@/lib/passport/PassportProvider";

type SaveRestaurantButtonProps = {
  restaurantSlug: string;
  className?: string;
  /** Overlay style for image corners */
  overlay?: boolean;
};

export function SaveRestaurantButton({
  restaurantSlug,
  className = "",
  overlay = false,
}: SaveRestaurantButtonProps) {
  const { ready, getRecord, updateRestaurant } = usePassport();
  const saved = Boolean(getRecord(restaurantSlug)?.saved);

  const base = overlay
    ? "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-ink/55 text-white backdrop-blur-sm transition-colors hover:bg-ink/75"
    : "inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-md)] border border-border bg-bg text-ink transition-colors hover:border-forest hover:text-forest";

  return (
    <button
      type="button"
      className={`${base} ${saved ? "text-burgundy" : ""} ${className}`}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save to passport"}
      disabled={!ready}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        updateRestaurant(restaurantSlug, { saved: !saved });
      }}
    >
      <span aria-hidden="true" className="text-lg leading-none">
        {saved ? "♥" : "♡"}
      </span>
    </button>
  );
}
