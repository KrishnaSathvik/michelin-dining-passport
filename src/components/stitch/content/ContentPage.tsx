import type { ReactNode } from "react";
import { PageContainer } from "@/components/stitch/PageContainer";

type ContentPageProps = {
  title: string;
  intro?: string;
  /** Short qualifier under the intro, e.g. "Last updated 27 July 2026". */
  meta?: string;
  /** Optional one-line purpose strip under the intro (About). */
  purpose?: string;
  children: ReactNode;
};

/**
 * Shared reading layout for the supporting pages linked from the footer
 * (About, Privacy, Terms, Contact, Sources). Single measured column —
 * these pages are read, not scanned.
 */
export function ContentPage({
  title,
  intro,
  meta,
  purpose,
  children,
}: ContentPageProps) {
  return (
    <PageContainer className="py-14 md:py-20">
      <div className="mx-auto w-full max-w-[68ch]">
        <header className="mb-10 md:mb-12">
          <h1 className="dp-headline-md text-dp-ink md:text-[36px]">{title}</h1>
          <div
            data-testid="content-brand-rule"
            aria-hidden="true"
            className="mt-5 h-px w-12 bg-dp-primary"
          />
          {intro ? (
            <p className="dp-body-md mt-5 text-dp-ink-secondary">{intro}</p>
          ) : null}
          {purpose ? (
            <p className="dp-meta mt-4 font-medium text-dp-primary">{purpose}</p>
          ) : null}
          {meta ? <p className="dp-meta mt-4 text-dp-ink-muted">{meta}</p> : null}
        </header>
        <div className="flex flex-col gap-12 md:gap-14">{children}</div>
      </div>
    </PageContainer>
  );
}

type ContentSectionProps = {
  heading: string;
  children: ReactNode;
};

export function ContentSection({ heading, children }: ContentSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="dp-headline-sm text-dp-ink">{heading}</h2>
      <div className="dp-body-md flex flex-col gap-3 text-dp-ink-secondary [&_a]:text-dp-primary [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
