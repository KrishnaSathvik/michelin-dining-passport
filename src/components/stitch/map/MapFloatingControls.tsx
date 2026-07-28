"use client";

type MapFloatingControlsProps = {
  onFit: () => void;
  onReset: () => void;
  onClearArea?: () => void;
  hasAreaFilter: boolean;
  showListToggle?: boolean;
  panel: "map" | "list";
  onTogglePanel?: () => void;
};

const controlClass =
  "inline-flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface text-dp-ink shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-colors hover:border-dp-primary hover:text-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus";

export function MapFloatingControls({
  onFit,
  onReset,
  onClearArea,
  hasAreaFilter,
  showListToggle = false,
  panel,
  onTogglePanel,
}: MapFloatingControlsProps) {
  return (
    <div
      className="absolute bottom-28 right-4 z-10 flex flex-col gap-3 lg:bottom-6 lg:right-20"
      role="toolbar"
      aria-label="Map controls"
      data-map-floating-controls
    >
      {showListToggle && onTogglePanel ? (
        <button
          type="button"
          className={`${controlClass} w-auto px-4 font-sans text-[13px] font-semibold lg:hidden`}
          aria-pressed={panel === "list"}
          onClick={onTogglePanel}
        >
          {panel === "list" ? "Map" : "List"}
        </button>
      ) : null}
      <button
        type="button"
        className={controlClass}
        onClick={onFit}
        title="Fit"
        aria-label="Fit"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <button
        type="button"
        className={controlClass}
        onClick={onReset}
        title="Reset"
        aria-label="Reset"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 12a8 8 0 0 1 14.5-4.5M20 12a8 8 0 0 1-14.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M18 3v5h-5M6 21v-5h5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {hasAreaFilter && onClearArea ? (
        <button
          type="button"
          className={`${controlClass} w-auto px-3 font-sans text-[12px] font-semibold`}
          onClick={onClearArea}
          aria-label="Clear area"
        >
          Clear area
        </button>
      ) : null}
    </div>
  );
}
