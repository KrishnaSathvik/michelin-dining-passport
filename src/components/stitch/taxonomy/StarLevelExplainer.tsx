import Link from "next/link";
import { PageContainer } from "@/components/stitch/PageContainer";
import type { StarPageViewModel } from "./models";

type StarLevelExplainerProps = {
  stars: 1 | 2 | 3;
  explainer: StarPageViewModel["explainer"];
};

export function StarLevelExplainer({
  stars,
  explainer,
}: StarLevelExplainerProps) {
  return (
    <section
      className="border-b border-dp-border py-[var(--dp-section)]"
      data-taxonomy-section="star-explainer"
      aria-labelledby="star-explainer-heading"
    >
      <PageContainer>
        <div className="mx-auto max-w-3xl">
          <p
            className="font-display text-[22px] leading-none tracking-[0.2em] text-[var(--dp-star-gold)]"
            aria-hidden="true"
          >
            {"★".repeat(stars)}
          </p>
          <h2
            id="star-explainer-heading"
            className="mt-4 font-display text-[28px] text-dp-primary md:text-[34px]"
          >
            {explainer.heading}
          </h2>
          <p className="mt-4 font-display text-[20px] italic leading-snug text-dp-primary md:text-[24px]">
            “{explainer.tagline}”
          </p>
          <div className="mt-5 space-y-4">
            {explainer.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="font-sans text-base leading-relaxed text-dp-ink-secondary md:text-[17px]"
              >
                {paragraph}
              </p>
            ))}
          </div>
          <Link
            href="/about-michelin-stars"
            className="mt-6 inline-flex items-center gap-1 font-sans text-sm font-semibold text-dp-primary underline underline-offset-4"
          >
            How Michelin stars work
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}
