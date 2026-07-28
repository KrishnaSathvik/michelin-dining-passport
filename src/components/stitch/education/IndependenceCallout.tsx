import { PageContainer } from "@/components/stitch/PageContainer";

type IndependenceCalloutProps = {
  message: string;
};

export function IndependenceCallout({ message }: IndependenceCalloutProps) {
  return (
    <section
      className="py-10"
      aria-labelledby="independence-heading"
      data-education-section="independence"
    >
      <PageContainer>
        <div className="mx-auto max-w-3xl rounded-[var(--dp-radius-xl)] border border-dp-border bg-dp-surface px-6 py-6 md:px-8">
          <h2
            id="independence-heading"
            className="font-display text-[22px] text-dp-primary"
          >
            Independent platform
          </h2>
          <p className="mt-3 font-sans text-sm leading-relaxed text-dp-ink-secondary md:text-base">
            {message} Michelin distinctions shown here are sourced from the
            Guide; official references open externally. Coverage is limited to
            U.S. regions currently represented in the source roster.
          </p>
          <p className="mt-4 font-sans text-sm text-dp-ink-muted">
            Official source:{" "}
            <a
              href="https://guide.michelin.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dp-primary underline underline-offset-4"
            >
              Michelin Guide
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </div>
      </PageContainer>
    </section>
  );
}
