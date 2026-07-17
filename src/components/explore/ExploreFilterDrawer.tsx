"use client";

import { useEffect, useId, useState } from "react";
import { ExploreFilterFields } from "@/components/explore/ExploreFilterFields";
import { buildExploreHref, type ExploreFacets, type ExploreQuery } from "@/lib/data/explore";

type ExploreFilterDrawerProps = {
  query: ExploreQuery;
  facets: ExploreFacets;
  activeCount: number;
};

export function ExploreFilterDrawer({
  query,
  facets,
  activeCount,
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
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 w-full items-center justify-center border border-border bg-bg-elevated px-4 font-sans text-sm font-medium text-ink"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Filters{activeCount > 0 ? ` (${activeCount})` : ""}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
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
            className="relative z-10 max-h-[90vh] w-full overflow-y-auto border border-border bg-bg p-5 shadow-lg sm:max-w-md"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 id={titleId} className="font-display text-2xl text-ink">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-10 border border-border px-3 font-sans text-sm text-ink"
              >
                Close
              </button>
            </div>

            <form action="/explore" method="get" className="space-y-5">
              <ExploreFilterFields
                query={query}
                facets={facets}
                idPrefix="explore-mobile"
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  className="min-h-11 flex-1 bg-forest px-4 font-sans text-sm font-medium text-bg-elevated"
                  onClick={() => setOpen(false)}
                >
                  Apply filters
                </button>
                <a
                  href={buildExploreHref({
                    sort: query.sort,
                    view: query.view,
                  })}
                  className="inline-flex min-h-11 flex-1 items-center justify-center border border-border px-4 font-sans text-sm text-ink"
                  onClick={() => setOpen(false)}
                >
                  Clear all
                </a>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
