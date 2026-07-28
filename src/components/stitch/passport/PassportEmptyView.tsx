import Link from "next/link";
import { PageContainer } from "@/components/stitch/PageContainer";
import { PassportSyncNotice } from "./PassportSyncNotice";
import type { PassportEmptyModel } from "./models";

type PassportEmptyViewProps = {
  model: PassportEmptyModel;
};

const STEPS = [
  {
    title: "Save",
    body: "Bookmark restaurants from Explore, Map, or any detail page.",
  },
  {
    title: "Plan",
    body: "Mark planned visits and keep private dates or confirmation notes.",
  },
  {
    title: "Remember",
    body: "Record each meal as its own private memory, including repeat visits.",
  },
] as const;

export function PassportEmptyView({ model }: PassportEmptyViewProps) {
  return (
    <div className="bg-dp-bg" data-passport-view="empty">
      <PageContainer className="pb-[var(--dp-section)] pt-[104px]">
        <section className="mx-auto mb-16 flex max-w-3xl flex-col items-center text-center md:mb-24">
          <h1 className="dp-display-lg-mobile text-dp-primary-deep md:text-[48px] md:leading-[1.1] md:tracking-[-0.02em]">
            {model.title}
          </h1>
          <p className="dp-body-lg mt-6 max-w-2xl text-dp-ink-secondary">
            {model.supporting}
          </p>
          <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
            <Link
              href={model.exploreHref}
              className="inline-flex h-12 min-h-11 w-full items-center justify-center rounded-[var(--dp-radius-md)] bg-dp-primary px-8 font-sans text-[14px] font-semibold text-dp-on-primary no-underline transition-colors hover:bg-dp-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus sm:w-auto"
            >
              Explore restaurants
            </Link>
            <Link
              href={model.mapHref}
              className="inline-flex h-12 min-h-11 w-full items-center justify-center rounded-[var(--dp-radius-md)] border border-dp-outline-variant bg-dp-surface px-8 font-sans text-[14px] font-semibold text-dp-primary-deep no-underline transition-colors hover:bg-dp-surface-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus sm:w-auto"
            >
              Open map
            </Link>
          </div>
        </section>

        <section
          className="mb-16 overflow-hidden rounded-[var(--dp-radius-xl)] border border-dp-outline-variant bg-dp-surface md:mb-24"
          aria-labelledby="passport-steps-heading"
        >
          <h2 id="passport-steps-heading" className="sr-only">
            How My Restaurants works
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="relative border-b border-dp-border p-6 last:border-b-0 md:border-b-0 md:border-r md:p-8 md:last:border-r-0"
              >
                <span className="font-display text-4xl text-dp-star-gold/70">
                  0{index + 1}
                </span>
                <h3 className="dp-headline-sm mt-6 text-dp-primary-deep">
                  {step.title}
                </h3>
                <p className="dp-body-md mt-3 text-dp-ink-secondary">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <PassportSyncNotice sync={model.sync} />
      </PageContainer>
    </div>
  );
}
