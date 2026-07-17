import type { ReactNode } from "react";

type AuthSuccessStateProps = {
  title: string;
  description: string;
  icon?: "mail" | "check";
  children?: ReactNode;
};

export function AuthSuccessState({
  title,
  description,
  icon = "mail",
  children,
}: AuthSuccessStateProps) {
  return (
    <div
      className="flex flex-col items-stretch gap-6 text-center"
      data-auth-success="true"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--dp-star-gold)_35%,var(--dp-surface))] text-dp-primary">
        {icon === "check" ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.1 14.2-3.6-3.6 1.4-1.4 2.2 2.2 5-5 1.4 1.4-6.4 6.4Z" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
          </svg>
        )}
      </div>
      <div className="space-y-2">
        <h1 className="dp-headline-sm text-dp-ink">{title}</h1>
        <p className="mx-auto max-w-[320px] font-sans text-[16px] leading-relaxed text-dp-ink-muted">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}
