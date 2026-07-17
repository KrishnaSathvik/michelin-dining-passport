import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/seo/jsonld";

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

/** Stitch breadcrumbs — Inter 14px, restrained separators, aria-current on page. */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="dp-meta text-dp-ink-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={`${item.path}-${item.name}`}
              className="flex items-center gap-2"
            >
              {index > 0 ? (
                <span aria-hidden="true" className="text-dp-ink-muted">
                  /
                </span>
              ) : null}
              {isLast ? (
                <span aria-current="page" className="text-dp-ink">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="min-h-11 inline-flex items-center text-dp-ink-secondary no-underline underline-offset-4 hover:text-dp-primary hover:underline"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
