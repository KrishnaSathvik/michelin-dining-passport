import Link from "next/link";
import type { EducationStarCardModel } from "./models";

type EducationStarCardProps = {
  model: EducationStarCardModel;
};

export function EducationStarCard({ model }: EducationStarCardProps) {
  const featured = Boolean(model.featured);

  return (
    <article
      className={`flex h-full flex-col rounded-[var(--dp-radius-xl)] border p-6 md:p-8 ${
        featured
          ? "border-dp-primary bg-dp-primary text-dp-on-primary"
          : "border-dp-border bg-dp-surface text-dp-ink"
      }`}
      data-education-star={model.stars}
    >
      <p
        className={`font-display text-[28px] tracking-[0.18em] ${
          featured ? "text-[var(--dp-star-gold)]" : "text-[var(--dp-star-gold)]"
        }`}
        aria-hidden="true"
      >
        {"★".repeat(model.stars)}
      </p>
      <h3
        className={`mt-4 font-display text-[24px] ${
          featured ? "text-dp-on-primary" : "text-dp-primary"
        }`}
      >
        {model.title}
      </h3>
      <p
        className={`mt-3 flex-1 font-sans text-sm leading-relaxed ${
          featured ? "text-dp-on-primary/85" : "text-dp-ink-secondary"
        }`}
      >
        {model.summary}
      </p>
      <p
        className={`mt-4 font-sans text-[12px] font-semibold uppercase tracking-[0.08em] ${
          featured ? "text-dp-on-primary/70" : "text-dp-ink-muted"
        }`}
      >
        {model.count} in this U.S. roster
      </p>
      <Link
        href={model.href}
        className={`mt-6 inline-flex min-h-12 items-center justify-center rounded-[var(--dp-radius-md)] px-4 font-sans text-sm font-semibold no-underline ${
          featured
            ? "bg-[var(--dp-star-gold)] text-dp-ink"
            : "bg-dp-primary text-dp-on-primary"
        }`}
      >
        {model.cta}
      </Link>
    </article>
  );
}
