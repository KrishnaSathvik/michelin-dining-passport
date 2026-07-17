import Link from "next/link";
import { PageContainer } from "@/components/stitch/PageContainer";
import type { ExplorePageHeaderModel } from "./models";

type ExplorePageHeaderProps = {
  model: ExplorePageHeaderModel;
};

export function ExplorePageHeader({ model }: ExplorePageHeaderProps) {
  return (
    <PageContainer as="header" className="pt-10 pb-6 md:pt-16 md:pb-8">
      <nav
        className="dp-meta text-dp-ink-secondary"
        aria-label="Breadcrumb"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="no-underline hover:text-dp-primary">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-dp-ink-muted">
            /
          </li>
          <li className="text-dp-primary">Explore</li>
        </ol>
      </nav>
      <div className="mt-4 flex flex-col gap-3">
        <h1 className="font-display text-4xl leading-[1.1] text-dp-primary md:text-5xl lg:text-[56px]">
          {model.title}
        </h1>
        <p className="dp-body-lg max-w-2xl text-dp-ink-secondary">
          {model.supportText}
        </p>
        <p
          className="dp-meta mt-1 text-dp-ink-secondary"
          aria-live="polite"
          data-explore-result-count
        >
          {model.resultCountLabel}
        </p>
      </div>
    </PageContainer>
  );
}
