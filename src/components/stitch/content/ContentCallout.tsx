import type { ReactNode } from "react";

type ContentCalloutProps = {
  title?: string;
  children: ReactNode;
};

export function ContentCallout({ title, children }: ContentCalloutProps) {
  return (
    <aside
      data-testid="content-callout"
      className="rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-soft px-5 py-5 md:px-6"
    >
      {title ? (
        <p className="font-display text-[18px] text-dp-primary">{title}</p>
      ) : null}
      <div
        className={`dp-body-md text-dp-ink-secondary [&_a]:text-dp-primary [&_a]:underline [&_a]:underline-offset-4 ${
          title ? "mt-2" : ""
        }`}
      >
        {children}
      </div>
    </aside>
  );
}
