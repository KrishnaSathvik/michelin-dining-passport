import Link from "next/link";
import { AccountSection } from "./AccountSection";
import type { PassportSyncPresentation } from "./models";

type PassportSyncSectionProps = {
  sync: PassportSyncPresentation;
};

export function PassportSyncSection({ sync }: PassportSyncSectionProps) {
  return (
    <AccountSection
      id="sync"
      title="Passport Sync"
      description="How this signed-in account relates to your device Passport."
    >
      <div className="flex flex-col gap-5" data-account-section-body="sync">
        <p
          className={`font-sans text-[16px] ${
            sync.tone === "error" ? "text-dp-error" : "text-dp-ink"
          }`}
        >
          {sync.headline}
        </p>
        <p className="font-sans text-[14px] leading-relaxed text-dp-ink-muted">
          {sync.detail}
        </p>
        <p className="font-sans text-[14px] text-dp-ink-muted">
          Migration and merge run automatically after authentication. This page
          does not invent sync timestamps or device counts.
        </p>
        <div>
          <Link
            href="/passport"
            className="inline-flex h-[var(--dp-control-height)] items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface px-5 font-sans text-[14px] font-semibold text-dp-primary no-underline hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          >
            View Passport
          </Link>
        </div>
      </div>
    </AccountSection>
  );
}
