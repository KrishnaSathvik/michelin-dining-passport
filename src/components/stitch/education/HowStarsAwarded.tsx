import { PageContainer } from "@/components/stitch/PageContainer";
import type { EducationPageViewModel } from "./models";

type HowStarsAwardedProps = {
  awarding: EducationPageViewModel["awarding"];
};

export function HowStarsAwarded({ awarding }: HowStarsAwardedProps) {
  return (
    <section
      className="border-y border-dp-border bg-dp-soft py-[var(--dp-section)]"
      aria-labelledby="awarding-heading"
      data-education-section="awarding"
    >
      <PageContainer>
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="awarding-heading"
            className="font-display text-[28px] text-dp-primary md:text-[34px]"
          >
            {awarding.heading}
          </h2>
          <p className="mt-4 font-sans text-base leading-relaxed text-dp-ink-secondary">
            {awarding.intro}
          </p>
        </div>

        <ol className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2">
          {awarding.process.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-[var(--dp-radius-xl)] border border-dp-border bg-dp-surface p-6"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dp-primary font-display text-[15px] text-dp-on-primary"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="font-display text-[19px] text-dp-primary">
                  {step.title}
                </h3>
                <p className="mt-2 font-sans text-sm leading-relaxed text-dp-ink-secondary">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mx-auto mt-8 max-w-5xl rounded-[var(--dp-radius-xl)] bg-dp-primary px-6 py-8 text-dp-on-primary md:px-10 md:py-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <h3 className="font-display text-[24px] text-dp-on-primary md:text-[28px]">
              {awarding.criteriaHeading}
            </h3>
            <p className="font-sans text-sm text-dp-on-primary/70">
              Every star is judged on these — and nothing else.
            </p>
          </div>
          <ol className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-5">
            {awarding.criteria.map((criterion, index) => (
              <li
                key={criterion}
                className="border-t border-dp-on-primary/25 pt-4"
              >
                <span
                  className="font-display text-[34px] leading-none tabular-nums text-[var(--dp-star-gold)]"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 font-sans text-[14px] leading-snug text-dp-on-primary/90">
                  {criterion}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </PageContainer>
    </section>
  );
}
