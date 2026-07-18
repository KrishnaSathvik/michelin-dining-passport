type GooglePlaceSkeletonProps = {
  variant?: "full" | "compact";
  className?: string;
};

export function GooglePlaceSkeleton({
  variant = "full",
  className = "",
}: GooglePlaceSkeletonProps) {
  const height = variant === "full" ? "min-h-[28rem]" : "min-h-[5.5rem]";
  return (
    <div
      className={`animate-pulse rounded-[var(--dp-radius-md)] border border-dp-border bg-dp-soft ${height} ${className}`}
      role="status"
      aria-label="Loading Google place details"
      data-google-places-skeleton={variant}
    >
      <div className="space-y-3 p-4">
        <div className="h-3 w-2/5 rounded bg-border" />
        <div className="h-3 w-4/5 rounded bg-border" />
        <div className="h-3 w-3/5 rounded bg-border" />
        {variant === "full" ? (
          <>
            <div className="mt-6 aspect-[4/3] w-full rounded bg-border" />
            <div className="h-3 w-full rounded bg-border" />
            <div className="h-3 w-5/6 rounded bg-border" />
          </>
        ) : null}
      </div>
      <span className="sr-only">Loading Google place details…</span>
    </div>
  );
}
