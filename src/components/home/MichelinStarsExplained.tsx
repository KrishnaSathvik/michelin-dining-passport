import Link from "next/link";
import { Section } from "@/components/layout/Section";

const tiers = [
  {
    stars: "★",
    title: "One star",
    meaning: "High-quality cooking worth a stop",
    detail:
      "A restaurant where the cooking is considered excellent for its category — refined technique and consistent quality that make a visit worthwhile.",
  },
  {
    stars: "★★",
    title: "Two stars",
    meaning: "Excellent cooking worth a detour",
    detail:
      "A restaurant whose cooking stands out more distinctly — often more ambition, personality, or precision — enough to justify going out of your way.",
  },
  {
    stars: "★★★",
    title: "Three stars",
    meaning: "Exceptional cuisine worth a special journey",
    detail:
      "The highest distinction in the Guide’s star system: cooking regarded as exceptional, typically prompting travel specifically for the experience.",
  },
] as const;

export function MichelinStarsExplained() {
  return (
    <Section
      id="michelin-stars"
      eyebrow="Distinctions"
      title="Michelin stars, explained"
      dek="A plain-language reading of the three star levels used in the Michelin Guide. This is an independent summary for travelers — not an official Michelin publication."
      className="border-t border-border"
    >
      <div className="border-y border-burgundy/30">
        {tiers.map((tier, index) => (
          <article
            key={tier.title}
            className={`grid gap-4 py-8 md:grid-cols-[8rem_minmax(0,1fr)] md:gap-10 ${
              index < tiers.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div>
              <p
                className="font-display text-2xl tracking-[0.2em] text-gold"
                aria-hidden="true"
              >
                {tier.stars}
              </p>
              <h3 className="mt-2 font-display text-2xl text-ink">
                {tier.title}
              </h3>
            </div>
            <div>
              <p className="font-sans text-base font-medium text-ink">
                {tier.meaning}
              </p>
              <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-ink-muted">
                {tier.detail}
              </p>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-8 max-w-3xl font-sans text-sm leading-relaxed text-ink-muted">
        Star awards and definitions originate with the Michelin Guide. This site
        summarizes publicly understood distinctions for orientation only and does
        not reproduce Michelin’s proprietary visual marks, logos, or Guide prose.{" "}
        <Link
          href="/about-michelin-stars"
          className="text-forest underline underline-offset-4"
        >
          Read the full explanation
        </Link>
        , including coverage limits, Bib Gourmand, and Green Star.
      </p>
    </Section>
  );
}
