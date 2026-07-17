"use client";

import Link from "next/link";
import {
  EXPLORE_SORT_LABELS,
  EXPLORE_SORT_OPTIONS,
  buildExploreHref,
  type ExploreQuery,
} from "@/lib/data/explore";
import { ExploreHiddenInputs } from "./filters";
import { PageContainer } from "@/components/stitch/PageContainer";

type ExploreResultsToolbarProps = {
  query: ExploreQuery;
  total: number;
  page: number;
  totalPages: number;
};

export function ExploreResultsToolbar({
  query,
  total,
  page,
  totalPages,
}: ExploreResultsToolbarProps) {
  const rangeLabel =
    total === 0
      ? "0 restaurants"
      : totalPages > 1
        ? `Page ${page} of ${totalPages} · ${total} restaurant${total === 1 ? "" : "s"}`
        : `${total} restaurant${total === 1 ? "" : "s"}`;

  return (
    <PageContainer className="pb-6">
      <div className="flex flex-col gap-4 border-b border-dp-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <p
          className="dp-meta text-dp-ink-secondary"
          aria-live="polite"
          data-explore-results-meta
        >
          {rangeLabel}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <form action="/explore" method="get" className="flex flex-col gap-2">
            <label
              htmlFor="explore-sort"
              className="dp-label-caps text-dp-ink-muted"
            >
              Sort
            </label>
            <ExploreHiddenInputs query={query} omit={["sort", "page"]} />
            <select
              id="explore-sort"
              name="sort"
              defaultValue={query.sort}
              className="h-11 min-h-11 min-w-52 appearance-none rounded-[var(--dp-radius-md)] border border-dp-border bg-dp-surface bg-[length:12px] bg-[position:right_14px_center] bg-no-repeat px-4 pr-10 font-sans text-[15px] text-dp-ink outline-none focus-visible:border-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' stroke='%23717975' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
              }}
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
            >
              {EXPLORE_SORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {EXPLORE_SORT_LABELS[option]}
                </option>
              ))}
            </select>
            <noscript>
              <button
                type="submit"
                className="mt-2 h-11 border border-dp-border px-3 font-sans text-sm"
              >
                Apply sort
              </button>
            </noscript>
          </form>

          <div
            className="inline-flex overflow-hidden rounded-[var(--dp-radius-lg)] border border-dp-border"
            role="group"
            aria-label="Result view"
          >
            <Link
              href={buildExploreHref({ ...query, view: "grid", page: 1 })}
              className={`inline-flex h-11 min-h-11 min-w-11 items-center justify-center px-4 font-sans text-[14px] no-underline transition-colors focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus ${
                query.view === "grid"
                  ? "bg-dp-soft font-semibold text-dp-primary"
                  : "bg-dp-surface text-dp-ink-secondary hover:text-dp-primary"
              }`}
              aria-current={query.view === "grid" ? "true" : undefined}
              aria-label="Grid view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4" y="4" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
                <rect x="14" y="4" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
                <rect x="4" y="14" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
                <rect x="14" y="14" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span className="ml-2 hidden sm:inline">Grid</span>
            </Link>
            <Link
              href={buildExploreHref({ ...query, view: "list", page: 1 })}
              className={`inline-flex h-11 min-h-11 min-w-11 items-center justify-center border-l border-dp-border px-4 font-sans text-[14px] no-underline transition-colors focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus ${
                query.view === "list"
                  ? "bg-dp-soft font-semibold text-dp-primary"
                  : "bg-dp-surface text-dp-ink-secondary hover:text-dp-primary"
              }`}
              aria-current={query.view === "list" ? "true" : undefined}
              aria-label="List view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="ml-2 hidden sm:inline">List</span>
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
