import type { ReactNode } from "react";
import Link from "next/link";

type SectionHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actionHref?: string;
  actionLabel?: string;
  titleAs?: "h1" | "h2" | "h3";
  className?: string;
  children?: ReactNode;
};

export function SectionHeader({
  title,
  description,
  eyebrow,
  actionHref,
  actionLabel = "View All",
  titleAs: TitleTag = "h2",
  className = "",
  children,
}: SectionHeaderProps) {
  return (
    <header
      className={`mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between ${className}`}
    >
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="dp-label-caps mb-3 text-dp-ink-muted">{eyebrow}</p>
        ) : null}
        <TitleTag className="dp-headline-md text-dp-ink md:text-[32px]">
          {title}
        </TitleTag>
        {description ? (
          <p className="dp-body-md mt-3 text-dp-ink-secondary">{description}</p>
        ) : null}
        {children}
      </div>
      {actionHref ? (
        <Link
          href={actionHref}
          className="dp-meta shrink-0 font-medium text-dp-primary transition-colors hover:text-dp-primary-hover"
        >
          {actionLabel} →
        </Link>
      ) : null}
    </header>
  );
}
