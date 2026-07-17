type MichelinDistinctionProps = {
  stars: 1 | 2 | 3;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** When true, render as a soft badge chip (e.g. detail hero). */
  badge?: boolean;
};

const sizeClass = {
  sm: "text-sm tracking-[0.14em]",
  md: "text-base tracking-[0.16em]",
  lg: "text-lg tracking-[0.18em]",
} as const;

/**
 * Michelin star distinction mark.
 * Uses --dp-star-gold only (OD-13). Never represents Google ratings.
 */
export function MichelinDistinction({
  stars,
  size = "md",
  className = "",
  badge = false,
}: MichelinDistinctionProps) {
  const label =
    stars === 1
      ? "One Michelin star"
      : stars === 2
        ? "Two Michelin stars"
        : "Three Michelin stars";

  const marks = (
    <span
      className={`inline-flex items-center text-dp-star-gold ${sizeClass[size]} ${
        badge ? "" : className
      }`}
      aria-label={label}
      title={label}
    >
      <span aria-hidden="true">{"★".repeat(stars)}</span>
    </span>
  );

  if (!badge) return marks;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-[var(--dp-radius-md)] bg-[color-mix(in_srgb,var(--dp-star-gold)_14%,white)] px-2.5 py-1 ${className}`}
    >
      {marks}
      <span className="dp-label-caps text-dp-ink-secondary">
        {stars} {stars === 1 ? "Star" : "Stars"}
      </span>
    </span>
  );
}
