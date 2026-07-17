import Link from "next/link";
import { PageContainer } from "@/components/stitch/PageContainer";

export function CollectionDetailMissing() {
  return (
    <div
      className="border-b border-dp-outline-variant bg-dp-bg"
      data-collections-state="missing"
    >
      <PageContainer className="pb-[var(--dp-section)] pt-[104px]">
        <div className="rounded-[var(--dp-radius-lg)] border border-dp-outline-variant px-6 py-14 text-center">
          <h1 className="dp-headline-md text-dp-primary-deep">
            Collection not found
          </h1>
          <p className="mx-auto mt-3 max-w-md font-sans text-[16px] text-dp-ink-muted">
            This collection is not available in your current Passport.
          </p>
          <Link
            href="/collections"
            className="mt-8 inline-flex h-[var(--dp-control-height)] items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-outline-variant px-5 font-sans text-[14px] font-semibold text-dp-primary no-underline hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          >
            Back to collections
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}
