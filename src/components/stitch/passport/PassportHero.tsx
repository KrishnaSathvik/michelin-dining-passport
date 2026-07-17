import Link from "next/link";
import type { PassportHeroModel } from "./models";

type PassportHeroProps = {
  model: PassportHeroModel;
};

export function PassportHero({ model }: PassportHeroProps) {
  return (
    <header
      className="mb-[var(--dp-section)]"
      data-passport-section="hero"
    >
      <p className="dp-label-caps text-dp-ink-muted">{model.eyebrow}</p>
      <h1 className="mt-3 font-display text-[36px] leading-[1.1] tracking-[-0.01em] text-dp-primary-deep md:text-[48px] md:tracking-[-0.02em]">
        {model.title}
      </h1>
      <p className="dp-body-lg mt-4 max-w-2xl text-dp-ink-secondary">
        {model.supporting}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
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
          View map
        </Link>
      </div>
    </header>
  );
}
