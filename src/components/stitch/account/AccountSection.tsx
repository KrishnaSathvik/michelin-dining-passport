import type { ReactNode } from "react";

type AccountSectionProps = {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  destructive?: boolean;
};

export function AccountSection({
  id,
  title,
  description,
  children,
  destructive = false,
}: AccountSectionProps) {
  return (
    <section
      id={id}
      className={`scroll-mt-28 border-t pt-10 ${
        destructive ? "mt-4 border-dp-error/20" : "border-dp-border"
      }`}
      data-account-section={id}
    >
      <div className="mb-6 max-w-2xl">
        <h2
          className={`dp-headline-sm ${
            destructive ? "text-dp-error" : "text-dp-ink"
          }`}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 font-sans text-[15px] leading-relaxed text-dp-ink-muted">
            {description}
          </p>
        ) : null}
      </div>
      <div
        className={`rounded-[var(--dp-radius-xl)] border p-6 sm:p-8 ${
          destructive
            ? "border-dp-error/30 bg-[color-mix(in_srgb,var(--dp-error)_6%,var(--dp-surface))]"
            : "border-dp-border bg-dp-surface"
        }`}
      >
        {children}
      </div>
    </section>
  );
}
