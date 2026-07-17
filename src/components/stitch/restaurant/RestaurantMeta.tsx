type RestaurantMetaProps = {
  cuisine?: string;
  location: string;
  price?: string;
  className?: string;
  /** Compact single-line meta for rows. */
  compact?: boolean;
};

/**
 * Cuisine · location · price rhythm for cards and rows.
 * Omits missing fields without inventing placeholders.
 */
export function RestaurantMeta({
  cuisine,
  location,
  price,
  className = "",
  compact = false,
}: RestaurantMetaProps) {
  const parts = [cuisine, location, price].filter(Boolean) as string[];

  if (parts.length === 0) return null;

  return (
    <p
      className={`font-sans text-dp-ink-secondary ${
        compact ? "text-[13px] leading-snug" : "text-sm leading-relaxed"
      } ${className}`}
    >
      {parts.map((part, index) => (
        <span key={`${part}-${index}`}>
          {index > 0 ? (
            <span className="text-dp-ink-muted" aria-hidden="true">
              {" "}
              ·{" "}
            </span>
          ) : null}
          <span>{part}</span>
        </span>
      ))}
    </p>
  );
}
