import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/seo/jsonld";

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="font-sans text-sm text-ink-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.path}-${item.name}`} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {isLast ? (
                <span aria-current="page" className="text-ink">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="underline-offset-4 hover:text-ink hover:underline"
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
