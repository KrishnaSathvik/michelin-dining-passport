import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { PageContainer } from "@/components/stitch/PageContainer";
import type { TaxonomyHeroModel } from "./models";

type TaxonomyHeroProps = {
  model: TaxonomyHeroModel;
};

/**
 * Wide taxonomy hero — photo atmosphere or soft editorial band (stars).
 * Decorative imagery is never attached to a named restaurant.
 */
export function TaxonomyHero({ model }: TaxonomyHeroProps) {
  if (model.tone === "soft" || !model.imageSrc) {
    return (
      <header
        className="bg-dp-soft py-[var(--dp-section)]"
        data-taxonomy-section="hero"
      >
        <PageContainer>
          <Breadcrumbs items={model.breadcrumbs} />
          <div className="mt-8 max-w-3xl">
            {model.starMarks ? (
              <p
                className="font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--dp-star-gold)]"
                aria-hidden="true"
              >
                {"★".repeat(model.starMarks)}
              </p>
            ) : null}
            <h1 className="mt-4 font-display text-[36px] leading-[1.1] tracking-[-0.01em] text-dp-primary md:text-[48px]">
              {model.title}
            </h1>
            <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-dp-ink-secondary md:text-lg">
              {model.introduction}
            </p>
            <p className="mt-5 font-sans text-sm text-dp-ink-muted">
              {model.countLabel}
            </p>
          </div>
        </PageContainer>
      </header>
    );
  }

  const onDark = model.tone === "cuisine" || model.tone === "destination";

  return (
    <header
      className="relative flex min-h-[400px] w-full items-end overflow-hidden md:h-[min(614px,70vh)]"
      data-taxonomy-section="hero"
      aria-labelledby="taxonomy-hero-heading"
    >
      <div className="absolute inset-0 z-0">
        {/* Decorative atmosphere — not a named restaurant */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={model.imageSrc}
          alt=""
          className="h-full w-full object-cover object-center"
          decoding="async"
          fetchPriority="high"
        />
        <div
          className={
            model.tone === "cuisine"
              ? "absolute inset-0 bg-gradient-to-t from-dp-primary/90 via-dp-primary/50 to-dp-primary/20"
              : "absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20"
          }
          aria-hidden="true"
        />
        <span className="sr-only">{model.imageAlt}</span>
      </div>

      <PageContainer className="relative z-10 w-full pb-10 pt-24 md:pb-12">
        <div className={onDark ? "[&_a]:text-white/85 [&_nav]:text-white/80 [&_[aria-current]]:text-white" : ""}>
          <Breadcrumbs items={model.breadcrumbs} />
        </div>
        <h1
          id="taxonomy-hero-heading"
          className="mt-6 max-w-3xl font-display text-[36px] leading-[1.1] tracking-[-0.01em] text-white md:text-[48px] lg:text-[56px]"
        >
          {model.title}
        </h1>
        <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-white/90 md:text-lg">
          {model.introduction}
        </p>
        <p className="mt-5 inline-flex min-h-10 items-center rounded-[var(--dp-radius-md)] border border-white/25 bg-white/10 px-4 font-sans text-sm text-white">
          {model.countLabel}
        </p>
      </PageContainer>
    </header>
  );
}
