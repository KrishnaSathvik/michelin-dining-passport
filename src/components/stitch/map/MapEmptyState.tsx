"use client";

type MapEmptyStateProps = {
  hasAreaFilter: boolean;
  onFit: () => void;
  onClearFilters: () => void;
  filterContext?: string;
};

export function MapEmptyState({
  hasAreaFilter,
  onFit,
  onClearFilters,
  filterContext,
}: MapEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center px-8 py-10 text-center"
      data-map-empty
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        className="mb-4 text-dp-ink-muted"
        aria-hidden="true"
      >
        <path
          d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M9 10h6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <h2 className="dp-headline-sm text-dp-primary">
        No restaurants found in this area
      </h2>
      <p className="dp-body-md mt-2 max-w-sm text-dp-ink-secondary">
        {filterContext
          ? filterContext
          : hasAreaFilter
            ? "Try zooming out, clearing the area search, or removing filters."
            : "Try clearing filters or fitting the map to all restaurants."}
      </p>
      <div className="mt-8 flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={onFit}
          className="inline-flex h-12 min-h-11 w-full items-center justify-center rounded-[var(--dp-radius-lg)] bg-dp-primary px-6 font-sans text-[14px] font-semibold text-dp-on-primary"
        >
          Fit all restaurants to map
        </button>
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex h-12 min-h-11 w-full items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-outline-variant px-6 font-sans text-[14px] font-semibold text-dp-primary"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}
