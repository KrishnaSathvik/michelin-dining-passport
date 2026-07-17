import Link from "next/link";
import { ExploreSortSelect } from "@/components/explore/ExploreSortSelect";
import { buildExploreHref, type ExploreQuery } from "@/lib/data/explore";

type ExploreToolbarProps = {
  query: ExploreQuery;
  total: number;
  page: number;
  totalPages: number;
};

export function ExploreToolbar({
  query,
  total,
  page,
  totalPages,
}: ExploreToolbarProps) {
  const rangeLabel =
    total === 0
      ? "0 restaurants"
      : totalPages > 1
        ? `Page ${page} of ${totalPages} · ${total} restaurant${total === 1 ? "" : "s"}`
        : `${total} restaurant${total === 1 ? "" : "s"}`;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <p className="font-sans text-base text-ink-secondary" aria-live="polite">
        {rangeLabel}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <ExploreSortSelect query={query} />

        <div
          className="inline-flex overflow-hidden rounded-[var(--radius-md)] border border-border"
          role="group"
          aria-label="Result view"
        >
          <Link
            href={buildExploreHref({ ...query, view: "grid", page: 1 })}
            className={`inline-flex min-h-11 items-center px-4 font-sans text-sm no-underline ${
              query.view === "grid"
                ? "bg-forest text-white"
                : "bg-bg text-ink hover:bg-surface-soft"
            }`}
            aria-current={query.view === "grid" ? "page" : undefined}
          >
            Grid
          </Link>
          <Link
            href={buildExploreHref({ ...query, view: "list", page: 1 })}
            className={`inline-flex min-h-11 items-center px-4 font-sans text-sm no-underline ${
              query.view === "list"
                ? "bg-forest text-white"
                : "bg-bg text-ink hover:bg-surface-soft"
            }`}
            aria-current={query.view === "list" ? "page" : undefined}
          >
            List
          </Link>
        </div>
      </div>
    </div>
  );
}
