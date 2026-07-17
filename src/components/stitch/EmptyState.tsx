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
};

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  children,
  className = "",
}: EmptyStateProps) {
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
      <h2 className="dp-headline-sm text-dp-ink">{title}</h2>
      {description ? (
        <p className="dp-body-md mt-3 max-w-md text-dp-ink-secondary">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
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
