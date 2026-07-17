import Link from "next/link";
import type { PassportListPageModel } from "./models";

type PassportListEmptyStateProps = {
  model: PassportListPageModel;
};

export function PassportListEmptyState({ model }: PassportListEmptyStateProps) {
  return (
    <div
      className="rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface px-6 py-14 text-center"
      data-passport-list-empty={model.mode}
      role="status"
    >
      <h2 className="dp-headline-sm text-dp-primary-deep">{model.emptyTitle}</h2>
      <p className="dp-body-md mx-auto mt-3 max-w-lg text-dp-ink-secondary">
        {model.emptyBody}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {model.emptyLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex h-12 min-h-11 items-center justify-center rounded-[var(--dp-radius-md)] border border-dp-outline-variant bg-dp-surface px-5 font-sans text-[14px] font-semibold text-dp-primary-deep no-underline transition-colors first:border-transparent first:bg-dp-primary first:text-dp-on-primary first:hover:bg-dp-primary-hover hover:bg-dp-surface-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
