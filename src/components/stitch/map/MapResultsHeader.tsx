"use client";

type MapResultsHeaderProps = {
  resultCountLabel: string;
  isPending?: boolean;
};

export function MapResultsHeader({
  resultCountLabel,
  isPending = false,
}: MapResultsHeaderProps) {
  return (
    <div className="mt-4 flex items-center justify-between gap-2">
      <p
        className="dp-meta text-dp-ink-secondary"
        aria-live="polite"
        data-map-result-count
      >
        {resultCountLabel}
        {isPending ? " · updating" : ""}
      </p>
    </div>
  );
}
