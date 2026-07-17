import Link from "next/link";
import { Section } from "@/components/layout/Section";

const tiers = [
  {
    stars: "★",
    title: "One Michelin Star",
    meaning: "High-quality cooking worth a stop",
    href: "/explore?stars=1",
  },
  {
    stars: "★★",
    title: "Two Michelin Stars",
    meaning: "Excellent cooking worth a detour",
    href: "/explore?stars=2",
  },
  {
    stars: "★★★",
    title: "Three Michelin Stars",
    meaning: "Exceptional cuisine worth a special journey",
    href: "/explore?stars=3",
  },
] as const;

export function MichelinStarsExplained() {
  return (
    <Section
      id="michelin-stars"
      eyebrow="Distinctions"
      title="Michelin stars, explained"
      dek="A plain-language reading of the three star levels. Independent summary — not an official Michelin publication."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <article
            key={tier.title}
            className="rounded-[var(--radius-lg)] border border-border bg-bg p-6"
          >
            <p
              className="font-display text-3xl tracking-[0.2em] text-gold"
              aria-hidden="true"
            >
              {tier.stars}
            </p>
            <h3 className="mt-4 font-display text-2xl text-ink">{tier.title}</h3>
            <p className="mt-3 font-sans text-base text-ink-secondary">
              {tier.meaning}
            </p>
            <Link
              href={tier.href}
              className="mt-5 inline-flex font-sans text-[15px] font-medium text-forest no-underline hover:text-forest-deep"
            >
              Browse →
            </Link>
          </article>
        ))}
      </div>

      <p className="mt-8 max-w-3xl font-sans text-base leading-relaxed text-ink-secondary">
        Star awards originate with the Michelin Guide.{" "}
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
