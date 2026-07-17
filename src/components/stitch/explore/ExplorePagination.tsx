import Link from "next/link";
import { buildExploreHref, type ExploreQuery } from "@/lib/data/explore";
import { PageContainer } from "@/components/stitch/PageContainer";

type ExplorePaginationProps = {
  query: ExploreQuery;
  page: number;
  totalPages: number;
};

function pageWindow(current: number, total: number): number[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
    pages.add(total - 3);
  }
  return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

export function ExplorePagination({
  query,
  page,
  totalPages,
}: ExplorePaginationProps) {
  if (totalPages <= 1) return null;

  const previousPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  const pages = pageWindow(page, totalPages);

  return (
    <PageContainer className="mb-20 md:mb-24">
      <nav
        className="flex items-center justify-center gap-2"
        aria-label="Pagination"
      >
        {previousPage ? (
          <Link
            href={buildExploreHref({ ...query, page: previousPage })}
            className="inline-flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-full text-dp-primary no-underline hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
            aria-label="Previous page"
          >
            <span aria-hidden="true">‹</span>
          </Link>
        ) : (
          <span
            className="inline-flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-full text-dp-ink-muted"
            aria-disabled="true"
          >
            <span aria-hidden="true">‹</span>
            <span className="sr-only">Previous page unavailable</span>
          </span>
        )}

        {pages.map((pageNumber, index) => {
          const prev = pages[index - 1];
          const showEllipsis = prev !== undefined && pageNumber - prev > 1;
          return (
            <span key={pageNumber} className="contents">
              {showEllipsis ? (
                <span className="px-1 text-dp-ink-muted" aria-hidden="true">
                  …
                </span>
              ) : null}
              {pageNumber === page ? (
                <span
                  className="inline-flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-full bg-dp-primary font-sans text-[14px] font-semibold text-dp-on-primary"
                  aria-current="page"
                >
                  {pageNumber}
                </span>
              ) : (
                <Link
                  href={buildExploreHref({ ...query, page: pageNumber })}
                  className="inline-flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-full font-sans text-[14px] text-dp-ink-secondary no-underline hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
                >
                  {pageNumber}
                </Link>
              )}
            </span>
          );
        })}

        {nextPage ? (
          <Link
            href={buildExploreHref({ ...query, page: nextPage })}
            className="inline-flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-full text-dp-primary no-underline hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
            aria-label="Next page"
          >
            <span aria-hidden="true">›</span>
          </Link>
        ) : (
          <span
            className="inline-flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-full text-dp-ink-muted"
            aria-disabled="true"
          >
            <span aria-hidden="true">›</span>
            <span className="sr-only">Next page unavailable</span>
          </span>
        )}
      </nav>
    </PageContainer>
  );
}
