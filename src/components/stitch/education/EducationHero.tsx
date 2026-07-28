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
      className="relative flex min-h-[440px] items-center justify-center overflow-hidden bg-dp-primary md:min-h-[520px]"
      data-education-section="hero"
      aria-labelledby="education-hero-heading"
    >
      <div className="absolute inset-0 z-0">
        {/* Decorative atmosphere — not a named restaurant */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt=""
          className="h-full w-full object-cover object-center"
          decoding="async"
          fetchPriority="high"
        />
        {/* Dark green scrim so light text stays legible over the photo. */}
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,45,37,0.80)_0%,rgba(18,45,37,0.74)_45%,rgba(18,45,37,0.92)_100%)]"
          aria-hidden="true"
        />
      </div>
      <PageContainer className="relative z-10 py-20 text-center md:py-24">
        <p
          className="font-display text-[26px] leading-none tracking-[0.35em] text-[var(--dp-star-gold)] md:text-[30px]"
          aria-hidden="true"
        >
          ★★★
        </p>
        <p className="mt-6 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">
          An Orellin guide
        </p>
        <h1
          id="education-hero-heading"
          className="mx-auto mt-4 max-w-3xl font-display text-[38px] leading-[1.08] tracking-[-0.01em] text-white md:text-[54px]"
        >
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl font-sans text-base leading-relaxed text-white/85 md:text-lg">
          {introduction}
        </p>
      </PageContainer>
    </header>
  );
}
