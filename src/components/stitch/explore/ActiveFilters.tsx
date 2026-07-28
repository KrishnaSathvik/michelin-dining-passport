import Link from "next/link";
import {
  buildExploreHref,
  exploreQueryHasFilters,
  type ActiveFilterChip,
  type ExploreQuery,
} from "@/lib/data/explore";
import { PageContainer } from "@/components/stitch/PageContainer";

type ActiveFiltersProps = {
  query: ExploreQuery;
  chips: ActiveFilterChip[];
};

export function ActiveFilters({ query, chips }: ActiveFiltersProps) {
  if (!exploreQueryHasFilters(query) || chips.length === 0) return null;

  return (
    <PageContainer className="pb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Active filters"
        >
          {chips.map((chip) => (
            <Link
              key={chip.key}
              href={chip.href}
              className="inline-flex h-11 min-h-11 shrink-0 items-center gap-2 rounded-[var(--dp-radius-md)] border border-dp-border bg-dp-soft px-3 font-sans text-[13px] font-medium text-dp-ink no-underline transition-colors hover:border-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
            >
              <span>{chip.label}</span>
              <span aria-hidden="true" className="text-dp-ink-muted">
                ×
              </span>
              <span className="sr-only">Remove {chip.label} filter</span>
            </Link>
          ))}
        </div>
        <Link
          href={buildExploreHref({
            sort: query.sort,
            view: query.view,
          })}
          className="dp-meta shrink-0 text-dp-ink-muted no-underline hover:text-dp-ink"
        >
          Clear all
        </Link>
      </div>
    </PageContainer>
  );
}
