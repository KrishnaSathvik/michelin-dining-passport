import { PageContainer } from "@/components/stitch/PageContainer";

type EducationHeroProps = {
  title: string;
  introduction: string;
  imageSrc: string;
};

export function EducationHero({
  title,
  introduction,
  imageSrc,
}: EducationHeroProps) {
  return (
    <header
      className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-dp-soft md:min-h-[560px]"
      data-education-section="hero"
      aria-labelledby="education-hero-heading"
    >
      <div className="absolute inset-0 z-0">
        {/* Decorative atmosphere — not a named restaurant */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt=""
          className="h-full w-full object-cover object-center opacity-30"
          decoding="async"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-dp-soft/70" aria-hidden="true" />
      </div>
      <PageContainer className="relative z-10 py-16 text-center">
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-dp-ink-muted">
          Understanding the distinctions
        </p>
        <h1
          id="education-hero-heading"
          className="mx-auto mt-4 max-w-3xl font-display text-[36px] leading-[1.1] tracking-[-0.01em] text-dp-primary md:text-[48px]"
        >
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl font-sans text-base leading-relaxed text-dp-ink-secondary md:text-lg">
          {introduction}
        </p>
      </PageContainer>
    </header>
  );
}
