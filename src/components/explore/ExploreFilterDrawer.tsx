"use client";

import { useEffect, useId, useState } from "react";
import { ExploreFilterFields } from "@/components/explore/ExploreFilterFields";
import {
  buildExploreHref,
  type ExploreFacets,
  type ExploreQuery,
} from "@/lib/data/explore";

type ExploreFilterDrawerProps = {
  query: ExploreQuery;
  facets: ExploreFacets;
  activeCount: number;
  /** When true, only render the trigger for sticky bar layouts that already include search */
  triggerLabel?: string;
};

export function ExploreFilterDrawer({
  query,
  facets,
  activeCount,
  triggerLabel = "All filters",
}: ExploreFilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-bg px-4 font-sans text-sm font-medium text-ink transition-colors hover:border-forest"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {triggerLabel}
        {activeCount > 0 ? (
          <span className="rounded-full bg-forest px-2 py-0.5 text-xs text-white">
            {activeCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex h-full w-full max-w-md flex-col bg-bg shadow-[var(--shadow-float)] max-sm:mt-auto max-sm:h-[90vh] max-sm:max-w-none max-sm:rounded-t-[var(--radius-lg)] sm:ml-auto"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <h2 id={titleId} className="font-display text-2xl text-ink">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-10 rounded-[var(--radius-md)] border border-border px-3 font-sans text-sm text-ink"
              >
                Close
              </button>
            </div>

            <form
              action="/explore"
              method="get"
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
                <ExploreFilterFields
                  query={query}
                  facets={facets}
                  idPrefix="explore-drawer"
                />
                <input type="hidden" name="sort" value={query.sort} />
                <input type="hidden" name="view" value={query.view} />
              </div>
              <div className="sticky bottom-0 flex flex-col gap-3 border-t border-border bg-bg p-5 sm:flex-row">
                <button
                  type="submit"
                  className="min-h-12 flex-1 rounded-[var(--radius-md)] bg-forest px-4 font-sans text-[15px] font-medium text-white"
                  onClick={() => setOpen(false)}
                >
                  Apply filters
                </button>
                <a
                  href={buildExploreHref({
                    sort: query.sort,
                    view: query.view,
                  })}
                  className="inline-flex min-h-12 flex-1 items-center justify-center rounded-[var(--radius-md)] border border-border px-4 font-sans text-[15px] text-ink no-underline"
                  onClick={() => setOpen(false)}
                >
                  Clear all
                </a>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
