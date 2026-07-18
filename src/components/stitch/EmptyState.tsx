import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "./Button";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  children?: ReactNode;
  className?: string;
  /** Default h2; use h1 only for full-page recovery surfaces. */
  headingLevel?: 1 | 2;
};

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  actionHref,
  children,
  className = "",
  headingLevel = 2,
}: EmptyStateProps) {
  const HeadingTag = headingLevel === 1 ? "h1" : "h2";

  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-16 text-center ${className}`}
    >
      {icon ? (
        <div className="mb-6 text-dp-ink-muted" aria-hidden="true">
          {icon}
        </div>
      ) : (
        <div
          className="mb-6 flex h-14 w-14 items-center justify-center rounded-[var(--dp-radius-lg)] bg-dp-soft text-dp-ink-muted"
          aria-hidden="true"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M8 12h8M12 8v8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
      <HeadingTag className="dp-headline-sm text-dp-ink">{title}</HeadingTag>
      {description ? (
        <p className="dp-body-md mt-3 max-w-md text-dp-ink-secondary">
          {description}
        </p>
      ) : null}
      {actionLabel && actionHref ? (
        <div className="mt-8">
          <Link
            href={actionHref}
            className="inline-flex h-[var(--dp-control-height)] items-center justify-center rounded-[var(--dp-radius-lg)] bg-dp-primary px-5 font-sans text-[14px] font-semibold tracking-wide text-dp-on-primary no-underline transition-colors hover:bg-dp-primary-hover"
          >
            {actionLabel}
          </Link>
        </div>
      ) : actionLabel && onAction ? (
        <div className="mt-8">
          <Button type="button" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
