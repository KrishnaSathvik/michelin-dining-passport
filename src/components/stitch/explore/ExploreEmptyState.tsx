import Link from "next/link";
import { EmptyState } from "@/components/stitch/EmptyState";
import { PageContainer } from "@/components/stitch/PageContainer";
import { buildExploreHref, type ExploreQuery } from "@/lib/data/explore";
import type { ActiveFilterChip } from "@/lib/data/explore";

type ExploreEmptyStateProps = {
  query: ExploreQuery;
  chips: ActiveFilterChip[];
  clearAllHref: string;
};

export function ExploreEmptyState({
  query,
  chips,
  clearAllHref,
}: ExploreEmptyStateProps) {
  const filterContext =
    chips.length > 0
      ? `Currently filtering by: ${chips.map((chip) => chip.label).join(" · ")}`
      : "No restaurants matched this search. Try a broader query or clear filters.";

  return (
    <PageContainer className="mb-16">
      <div
        className="rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface px-8 py-[7.5rem]"
        data-explore-empty
      >
        <EmptyState
          title="No restaurants match these filters"
          description={filterContext}
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M20 20l-3.5-3.5M8.5 11h5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          }
        >
          <div className="flex flex-col items-center gap-6">
            <Link
              href={clearAllHref}
              className="inline-flex h-12 min-h-11 items-center justify-center rounded-[var(--dp-radius-lg)] bg-dp-primary px-6 font-sans text-[14px] font-semibold text-dp-on-primary no-underline hover:bg-dp-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
            >
              Clear all filters
            </Link>
            <div className="text-center">
              <p className="dp-label-caps mb-2 text-dp-ink-muted">Try instead</p>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    href={buildExploreHref({
                      sort: query.sort,
                      view: query.view,
                      stars: 3,
                    })}
                    className="dp-body-md text-dp-primary underline decoration-1 underline-offset-4"
                  >
                    Three Michelin Stars
                  </Link>
                </li>
                <li>
                  <Link
                    href={buildExploreHref({
                      sort: query.sort,
                      view: query.view,
                      state: "california",
                    })}
                    className="dp-body-md text-dp-primary underline decoration-1 underline-offset-4"
                  >
                    California
                  </Link>
                </li>
                <li>
                  <Link
                    href="/explore"
                    className="dp-body-md text-dp-primary underline decoration-1 underline-offset-4"
                  >
                    Browse all restaurants
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </EmptyState>
      </div>
    </PageContainer>
  );
}
