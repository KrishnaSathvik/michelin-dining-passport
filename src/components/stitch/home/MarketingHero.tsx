import Link from "next/link";
import type { HomepageHeroModel } from "./models";

type MarketingHeroProps = {
  model: HomepageHeroModel;
};

/**
 * Full-bleed atmospheric homepage hero from Stitch explore_feed.
 * Brand-led first viewport: eyebrow, headline, supporting copy, CTA pair.
 * Height grows with content on short phones so copy never clips.
 */
export function MarketingHero({ model }: MarketingHeroProps) {
  return (
    <section
      className="relative flex min-h-[min(100svh,640px)] w-full items-center justify-center py-16 sm:min-h-[520px] sm:py-20 md:min-h-[560px] md:py-24 lg:min-h-[614px]"
      data-homepage-section="hero"
      aria-labelledby="homepage-hero-heading"
    >
      <div className="absolute inset-0 z-0">
        {/* Decorative atmospheric photography — not attached to a named restaurant */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={model.imageSrc}
          alt=""
          className="h-full w-full object-cover object-center"
          decoding="async"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--dp-primary)_55%,transparent)_0%,color-mix(in_srgb,var(--dp-primary)_48%,transparent)_45%,color-mix(in_srgb,var(--dp-primary)_62%,transparent)_100%)]"
          aria-hidden="true"
        />
        <span className="sr-only">{model.imageAlt}</span>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[var(--dp-content-max)] flex-col items-center px-[var(--dp-margin-mobile)] text-center md:px-[var(--dp-margin-desktop)]">
        {model.eyebrow ? (
          <p className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-dp-on-primary/85 drop-shadow-sm sm:mb-4 sm:text-[12px] md:text-[13px]">
            {model.eyebrow}
          </p>
        ) : null}
        <h1
          id="homepage-hero-heading"
          className="w-full text-pretty font-display text-[clamp(1.875rem,1.15rem+2.6vw,3.75rem)] leading-[1.15] tracking-[-0.015em] text-dp-on-primary drop-shadow-md sm:max-w-[30rem] sm:leading-[1.12] md:max-w-[38rem] md:leading-[1.1] lg:max-w-[46rem]"
        >
          {model.headline}
        </h1>
        <p className="mt-4 w-full text-pretty font-sans text-[0.9375rem] leading-[1.55] text-dp-on-primary/90 drop-shadow-sm sm:mt-5 sm:max-w-[32rem] sm:text-base md:mt-6 md:max-w-[36rem] md:text-lg md:leading-[1.55]">
          {model.supporting}
        </p>
        {model.primaryCta || model.secondaryCta ? (
          <div className="mt-7 flex w-full max-w-sm flex-col items-stretch gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
            {model.primaryCta ? (
              <Link
                href={model.primaryCta.href}
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--dp-radius-md)] bg-dp-on-primary px-6 font-sans text-[14px] font-semibold text-dp-primary no-underline shadow-sm transition-opacity hover:opacity-95 sm:min-w-[10.5rem]"
              >
                {model.primaryCta.label}
              </Link>
            ) : null}
            {model.secondaryCta ? (
              <Link
                href={model.secondaryCta.href}
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--dp-radius-md)] border border-dp-on-primary/70 bg-transparent px-6 font-sans text-[14px] font-semibold text-dp-on-primary no-underline transition-colors hover:bg-dp-on-primary/10 sm:min-w-[10.5rem]"
              >
                {model.secondaryCta.label}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
