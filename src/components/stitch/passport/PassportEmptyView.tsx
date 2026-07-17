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
    title: "Visit",
    body: "Record visit dates, favorite dishes, and private notes after a meal.",
  },
] as const;

export function PassportEmptyView({ model }: PassportEmptyViewProps) {
  return (
    <div className="bg-dp-bg" data-passport-view="empty">
      <PageContainer className="pb-[var(--dp-section)] pt-[104px]">
        <section className="mx-auto mb-[120px] flex max-w-3xl flex-col items-center text-center">
          <h1 className="font-display text-[36px] leading-[1.1] tracking-[-0.01em] text-dp-primary-deep md:text-[48px] md:tracking-[-0.02em]">
            {model.title}
          </h1>
          <p className="dp-body-lg mt-6 max-w-2xl text-dp-ink-secondary">
            {model.supporting}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href={model.exploreHref}
              className="inline-flex h-12 min-h-11 items-center justify-center rounded-[var(--dp-radius-md)] bg-dp-primary px-8 font-sans text-[14px] font-semibold text-dp-on-primary no-underline transition-colors hover:bg-dp-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
            >
              Explore restaurants
            </Link>
            <Link
              href={model.mapHref}
              className="inline-flex h-12 min-h-11 items-center justify-center rounded-[var(--dp-radius-md)] border border-dp-outline-variant bg-dp-surface px-8 font-sans text-[14px] font-semibold text-dp-primary-deep no-underline transition-colors hover:bg-dp-surface-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
            >
              Open map
            </Link>
          </div>
        </section>

        <section
          className="relative mb-[120px] overflow-hidden rounded-[var(--dp-radius-xl)] border border-dp-outline-variant bg-dp-surface-low"
          aria-hidden="true"
        >
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-8 px-6 py-12 md:min-h-[280px] md:flex-row md:gap-12">
            <div className="flex items-center gap-3 md:gap-4">
              {(["Save", "Plan", "Visit"] as const).map((label, index) => (
                <div key={label} className="flex items-center gap-3 md:gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dp-outline-variant bg-dp-surface font-sans text-sm font-semibold text-dp-primary-deep">
                      {index + 1}
                    </div>
                    <span className="dp-label-caps text-dp-ink-muted">
                      {label}
                    </span>
                  </div>
                  {index < 2 ? (
                    <div className="mb-6 h-[2px] w-8 bg-dp-outline-variant md:w-12" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-[120px] grid grid-cols-1 gap-[var(--dp-gutter)] md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.title}>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-[var(--dp-radius-md)] bg-dp-surface-highest font-sans text-sm font-semibold text-dp-primary-deep">
                {step.title.slice(0, 1)}
              </div>
              <h2 className="dp-headline-sm mb-3 text-dp-primary-deep">
                {step.title}
              </h2>
              <p className="dp-body-md text-dp-ink-secondary">{step.body}</p>
            </div>
          ))}
        </section>

        <PassportSyncNotice sync={model.sync} />
      </PageContainer>
    </div>
  );
}
