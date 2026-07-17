import Link from "next/link";
import { buildExploreHref, type ExploreQuery } from "@/lib/data/explore";

type ExploreEmptyStateProps = {
  query: ExploreQuery;
};

export function ExploreEmptyState({ query }: ExploreEmptyStateProps) {
  return (
    <div className="border border-border bg-bg-elevated/50 px-5 py-10 text-center">
      <h2 className="font-display text-2xl text-ink">No restaurants matched</h2>
      <p className="mx-auto mt-3 max-w-lg font-sans text-base leading-relaxed text-ink-muted">
        Try a broader search, remove a filter, or browse the full roster. Filters
        and search are combined — clearing one at a time can help.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={buildExploreHref({
            sort: query.sort,
            view: query.view,
          })}
          className="inline-flex min-h-11 items-center bg-forest px-5 font-sans text-sm font-medium text-bg-elevated"
        >
          Clear all filters
        </Link>
        <Link
          href="/explore"
          className="inline-flex min-h-11 items-center border border-border px-5 font-sans text-sm text-ink"
        >
          Browse all restaurants
        </Link>
      </div>
    </div>
  );
}
