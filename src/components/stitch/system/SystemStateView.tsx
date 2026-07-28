import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/stitch/Button";
import { PageContainer } from "@/components/stitch/PageContainer";

export type SystemStateAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
};

type SystemStateViewProps = {
  title: string;
  description: string;
  /** Use h1 for full-page recovery surfaces (404, route error). */
  headingLevel?: 1 | 2;
  icon?: ReactNode;
  primaryAction?: SystemStateAction;
  secondaryAction?: SystemStateAction;
  children?: ReactNode;
  className?: string;
  /** data-* marker for tests */
  testId?: string;
};

function ActionControl({ action }: { action: SystemStateAction }) {
  const variant = action.variant ?? "primary";
  const className =
    variant === "primary"
      ? "inline-flex h-[var(--dp-control-height)] items-center justify-center rounded-[var(--dp-radius-lg)] bg-dp-primary px-6 font-sans text-sm font-semibold text-dp-on-primary no-underline transition-colors hover:bg-dp-primary-hover"
      : variant === "secondary"
        ? "inline-flex h-[var(--dp-control-height)] items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface px-6 font-sans text-sm font-semibold text-dp-primary no-underline transition-colors hover:bg-dp-soft"
        : "inline-flex h-[var(--dp-control-height)] items-center justify-center px-2 font-sans text-sm font-semibold text-dp-primary underline decoration-1 underline-offset-4";

  if (action.href) {
    return (
      <Link href={action.href} className={className}>
        {action.label}
      </Link>
    );
  }

  return (
    <Button type="button" variant={variant} onClick={action.onClick}>
      {action.label}
    </Button>
  );
}

const defaultIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M12 8v4M12 16h.01"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Shared Stitch empty/error/not-found presentation (system_states language).
 */
export function SystemStateView({
  title,
  description,
  headingLevel = 2,
  icon = defaultIcon,
  primaryAction,
  secondaryAction,
  children,
  className = "",
  testId,
}: SystemStateViewProps) {
  const HeadingTag = headingLevel === 1 ? "h1" : "h2";

  return (
    <PageContainer
      className={`flex flex-col items-center justify-center px-6 py-20 text-center md:py-28 ${className}`}
    >
      <div
        className="flex w-full max-w-lg flex-col items-center"
        data-system-state={testId ?? "generic"}
      >
        <div
          className="mb-6 flex h-14 w-14 items-center justify-center rounded-[var(--dp-radius-lg)] bg-dp-soft text-dp-ink-muted"
          aria-hidden="true"
        >
          {icon}
        </div>
        <HeadingTag className="dp-headline-sm text-dp-ink md:text-[28px]">
          {title}
        </HeadingTag>
        <p className="dp-body-md mt-3 max-w-md text-dp-ink-secondary">
          {description}
        </p>
        {primaryAction || secondaryAction ? (
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            {primaryAction ? <ActionControl action={primaryAction} /> : null}
            {secondaryAction ? (
              <ActionControl
                action={{ ...secondaryAction, variant: secondaryAction.variant ?? "secondary" }}
              />
            ) : null}
          </div>
        ) : null}
        {children ? <div className="mt-6 w-full">{children}</div> : null}
      </div>
    </PageContainer>
  );
}
