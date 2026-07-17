import Link from "next/link";
import type { PassportListPageModel } from "./models";

type PassportListHeaderProps = {
  model: PassportListPageModel;
};

export function PassportListHeader({ model }: PassportListHeaderProps) {
  return (
    <header
      className="mb-6 flex flex-col items-center text-center md:mb-8 md:items-start md:text-left"
      data-passport-list-header={model.mode}
    >
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center justify-center gap-2 font-sans text-[14px] text-dp-ink-muted md:justify-start">
          {model.breadcrumbs.map((crumb, index) => (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="no-underline underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <h1 className="font-display text-[36px] leading-[1.1] tracking-[-0.01em] text-dp-primary-deep md:text-[48px] md:tracking-[-0.02em]">
        {model.title}
      </h1>
      <p className="dp-body-lg mt-4 max-w-2xl text-dp-ink-secondary">
        {model.subtitle}
      </p>
    </header>
  );
}
