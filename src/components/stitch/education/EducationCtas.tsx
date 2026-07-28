import Link from "next/link";
import { PageContainer } from "@/components/stitch/PageContainer";

type EducationCtasProps = {
  coverage: string;
};

export function EducationCtas({ coverage }: EducationCtasProps) {
  return (
    <section
      className="py-[var(--dp-section)]"
      aria-labelledby="education-cta-heading"
      data-education-section="ctas"
    >
      <PageContainer className="text-center">
        <h2
          id="education-cta-heading"
          className="font-display text-[24px] text-dp-primary"
        >
          Continue exploring
        </h2>
        <p
          className="mx-auto mt-4 max-w-2xl font-sans text-sm leading-relaxed text-dp-ink-muted"
          data-education-section="coverage-note"
        >
          {coverage}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/explore"
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--dp-radius-md)] bg-dp-primary px-5 font-sans text-sm font-semibold text-dp-on-primary no-underline"
          >
            Explore restaurants
          </Link>
          <Link
            href="/map"
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--dp-radius-md)] border border-dp-border px-5 font-sans text-sm font-semibold text-dp-primary no-underline"
          >
            Open map
          </Link>
          <Link
            href="/stars/3"
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--dp-radius-md)] border border-dp-border px-5 font-sans text-sm font-semibold text-dp-primary no-underline"
          >
            Browse three-star
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}
