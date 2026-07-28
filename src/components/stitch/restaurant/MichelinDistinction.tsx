import type { MichelinDistinctionVariant } from "./models";

type MichelinDistinctionProps = {
  stars: 1 | 2 | 3;
  variant?: MichelinDistinctionVariant;
  className?: string;
  /** Show visible text beside marks (detail / badge treatments). */
  showLabel?: boolean;
};

const variantClass: Record<MichelinDistinctionVariant, string> = {
  compact: "gap-1 text-[13px] tracking-[0.12em]",
  editorial: "gap-1.5 text-base tracking-[0.16em]",
  row: "gap-1 text-[12px] tracking-[0.14em]",
  detail: "gap-2 text-lg tracking-[0.18em]",
};

export function michelinDistinctionText(stars: 1 | 2 | 3): string {
  switch (stars) {
    case 1:
      return "1 Michelin star";
    case 2:
      return "2 Michelin stars";
    case 3:
      return "3 Michelin stars";
    default: {
      const _exhaustive: never = stars;
      return _exhaustive;
    }
  }
}

export function michelinDistinctionTitle(stars: 1 | 2 | 3): string {
  switch (stars) {
    case 1:
      return "One Michelin Star";
    case 2:
      return "Two Michelin Stars";
    case 3:
      return "Three Michelin Stars";
    default: {
      const _exhaustive: never = stars;
      return _exhaustive;
    }
  }
}

/**
 * Michelin star distinction mark.
 * Uses --dp-star-gold only. Never represents Google ratings or official marks.
 */
export function MichelinDistinction({
  stars,
  variant = "compact",
  className = "",
  showLabel = false,
}: MichelinDistinctionProps) {
  const text = michelinDistinctionText(stars);
  const title = michelinDistinctionTitle(stars);
  const showBadgeChrome = variant === "detail" || showLabel;

  const marks = (
    <span
      className={`inline-flex items-center text-dp-star-gold ${variantClass[variant]} ${
        showBadgeChrome ? "" : className
      }`}
      title={title}
    >
      <span aria-hidden="true">{"★".repeat(stars)}</span>
      <span className="sr-only">{text}</span>
    </span>
  );

  if (!showBadgeChrome) return marks;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-[var(--dp-radius-md)] bg-[color-mix(in_srgb,var(--dp-star-gold)_14%,white)] px-2.5 py-1 ${className}`}
    >
      {marks}
      <span className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-dp-ink-secondary">
        {title}
      </span>
    </span>
  );
}
