import Link from "next/link";
import { buildExploreHref, type ExploreQuery } from "@/lib/data/explore";

type ExplorePaginationProps = {
  query: ExploreQuery;
  page: number;
  totalPages: number;
};

export function ExplorePagination({
  query,
  page,
  totalPages,
}: ExplorePaginationProps) {
  if (totalPages <= 1) return null;

  const previousPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  return (
    <nav
      className="flex items-center justify-between gap-4 border border-border px-4 py-3"
      aria-label="Pagination"
    >
      {previousPage ? (
        <Link
          href={buildExploreHref({ ...query, page: previousPage })}
          className="font-sans text-sm text-forest underline underline-offset-4"
        >
          Previous
        </Link>
      ) : (
        <span className="font-sans text-sm text-ink-muted">Previous</span>
      )}

      <p className="font-sans text-sm text-ink-muted">
        Page {page} of {totalPages}
      </p>

      {nextPage ? (
        <Link
          href={buildExploreHref({ ...query, page: nextPage })}
          className="font-sans text-sm text-forest underline underline-offset-4"
        >
          Next
        </Link>
      ) : (
        <span className="font-sans text-sm text-ink-muted">Next</span>
      )}
    </nav>
  );
}
