"use client";

type SearchThisAreaButtonProps = {
  visible: boolean;
  onSearch: () => void;
};

export function SearchThisAreaButton({
  visible,
  onSearch,
}: SearchThisAreaButtonProps) {
  if (!visible) return null;

  return (
    <div className="absolute top-6 left-1/2 z-10 -translate-x-1/2">
      <button
        type="button"
        onClick={onSearch}
        className="inline-flex h-11 min-h-11 items-center gap-2 rounded-full border border-dp-outline-variant bg-dp-surface px-6 font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-dp-primary shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-colors hover:border-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        data-map-search-this-area
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
        Search this area
      </button>
    </div>
  );
}
