import { PageContainer } from "@/components/stitch/PageContainer";
import type { EducationPageViewModel } from "./models";

type BeyondTheStarsProps = {
  items: EducationPageViewModel["beyond"];
};

export function BeyondTheStars({ items }: BeyondTheStarsProps) {
  return (
    <section
      className="border-y border-dp-border bg-dp-soft py-[var(--dp-section)]"
      aria-labelledby="beyond-stars-heading"
      data-education-section="beyond-stars"
    >
      <PageContainer>
        <h2
          id="beyond-stars-heading"
          className="text-center font-display text-[28px] text-dp-primary md:text-[32px]"
        >
          Beyond the Stars
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center font-sans text-sm text-dp-ink-muted">
          Educational context only — these distinctions are not part of the
          starred-restaurant roster totals on Dining Passport.
        </p>
        <ul className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-[var(--dp-radius-xl)] border border-dp-border bg-dp-surface p-6"
            >
              <h3 className="font-display text-[22px] text-dp-primary">
                {item.title}
              </h3>
              <p className="mt-3 font-sans text-sm leading-relaxed text-dp-ink-secondary">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
