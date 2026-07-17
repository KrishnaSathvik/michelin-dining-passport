import type { HomepageHeroModel } from "./models";

type MarketingHeroProps = {
  model: HomepageHeroModel;
};

/**
 * Full-bleed atmospheric homepage hero from Stitch explore_feed.
 * No search form, no CTAs — headline + supporting sentence only.
 */
export function MarketingHero({ model }: MarketingHeroProps) {
  return (
    <section
      className="relative flex h-[min(614px,85vh)] min-h-[500px] w-full items-center justify-center"
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
        <div className="absolute inset-0 bg-dp-primary/40" aria-hidden="true" />
        <span className="sr-only">{model.imageAlt}</span>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[var(--dp-content-max)] px-[var(--dp-margin-mobile)] text-center md:px-[var(--dp-margin-desktop)]">
        <h1
          id="homepage-hero-heading"
          className="mx-auto max-w-4xl font-display text-[36px] leading-[1.1] tracking-[-0.01em] text-dp-on-primary drop-shadow-md md:text-[48px] lg:text-[64px] lg:tracking-[-0.02em]"
        >
          {model.headline}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl font-sans text-base leading-[1.6] text-dp-on-primary/90 drop-shadow-sm md:text-lg">
          {model.supporting}
        </p>
      </div>
    </section>
  );
}
