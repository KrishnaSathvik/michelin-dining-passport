import Link from "next/link";
import {
  buildExploreHref,
  exploreQueryHasFilters,
  type ActiveFilterChip,
  type ExploreQuery,
} from "@/lib/data/explore";

type ExploreActiveFiltersProps = {
  query: ExploreQuery;
  chips: ActiveFilterChip[];
};

export function ExploreActiveFilters({
  query,
  chips,
}: ExploreActiveFiltersProps) {
  if (!exploreQueryHasFilters(query)) return null;

  return (
    <div className="flex flex-col gap-3 border border-border bg-bg-elevated/70 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2" aria-label="Active filters">
        {chips.map((chip) => (
          <Link
            key={chip.key}
            href={chip.href}
            className="inline-flex min-h-9 items-center gap-2 border border-border bg-bg px-3 font-sans text-sm text-ink transition-colors hover:border-burgundy hover:text-burgundy"
          >
            <span>{chip.label}</span>
            <span aria-hidden="true">×</span>
            <span className="sr-only">Remove {chip.label} filter</span>
          </Link>
        ))}
      </div>
      <Link
        href={buildExploreHref({
          sort: query.sort,
          view: query.view,
        })}
        className="font-sans text-sm text-forest underline underline-offset-4"
      >
        Clear all filters
      </Link>
    </div>
  );
}
