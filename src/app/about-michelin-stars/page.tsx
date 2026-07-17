import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { getTotals } from "@/lib/data/restaurants";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "About Michelin stars",
  description:
    "An independent explanation of Michelin star levels, coverage limits, Bib Gourmand, Green Star, and how this atlas relates to the Michelin Guide.",
  path: "/about-michelin-stars",
});

const breadcrumbs = [
  { name: "Home", path: "/" },
  { name: "About Michelin stars", path: "/about-michelin-stars" },
];

export default function AboutMichelinStarsPage() {
  const totals = getTotals();

  const starCards = [
    {
      stars: 1 as const,
      title: "One Michelin Star",
      summary:
        "High-quality cooking worth a stop — technique and consistency that rise above the ordinary for its category.",
      href: "/stars/1",
      count: totals.oneStar,
      cta: `Browse ${totals.oneStar} one-star restaurants`,
    },
    {
      stars: 2 as const,
      title: "Two Michelin Stars",
      summary:
        "Excellent cooking worth a detour — a clearer culinary point of view that many diners will go out of their way for.",
      href: "/stars/2",
      count: totals.twoStar,
      cta: `Browse ${totals.twoStar} two-star restaurants`,
    },
    {
      stars: 3 as const,
      title: "Three Michelin Stars",
      summary:
        "Exceptional cuisine worth a special journey — the Guide’s highest star distinction.",
      href: "/stars/3",
      count: totals.threeStar,
      cta: "Browse three-star restaurants",
    },
  ];

  return (
    <div className="border-b border-border">
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <Container className="py-8 sm:py-12">
        <Breadcrumbs items={breadcrumbs} />

        <header className="mt-6 overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br from-ink via-[#1c1c1c] to-forest px-6 py-10 text-white sm:px-10 sm:py-14">
          <p className="font-sans text-xs uppercase tracking-[0.18em] text-white/60">
            Education
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
            Michelin stars, explained independently
          </h1>
          <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-white/80">
            How travelers commonly understand Michelin Guide star levels and
            related distinctions. Original wording for {siteConfig.productName} —
            not an official Michelin publication.
          </p>
        </header>

        <section className="mt-12">
          <h2 className="font-display text-3xl text-ink">Star distinctions</h2>
          <p className="mt-3 max-w-2xl font-sans text-base text-ink-muted">
            This atlas currently lists {totals.restaurants} starred restaurants
            in the United States roster.
          </p>
          <ul className="mt-8 grid gap-5 lg:grid-cols-3">
            {starCards.map((card) => (
              <li
                key={card.stars}
                className="flex flex-col rounded-[var(--radius-lg)] border border-border bg-bg p-6"
              >
                <p
                  className="font-display text-3xl tracking-[0.2em] text-gold"
                  aria-hidden="true"
                >
                  {"★".repeat(card.stars)}
                </p>
                <h3 className="mt-4 font-display text-2xl text-ink">
                  {card.title}
                </h3>
                <p className="mt-3 flex-1 font-sans text-sm leading-relaxed text-ink-muted">
                  {card.summary}
                </p>
                <p className="mt-4 font-sans text-xs uppercase tracking-[0.14em] text-ink-muted">
                  {card.count} in this roster
                </p>
                <Link
                  href={card.href}
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] bg-forest px-4 font-sans text-sm font-medium text-white no-underline hover:bg-forest-deep"
                >
                  {card.cta}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <section className="rounded-[var(--radius-lg)] border border-border p-6">
            <h2 className="font-display text-2xl text-ink">
              Coverage limitations
            </h2>
            <p className="mt-3 font-sans text-sm leading-relaxed text-ink-muted">
              {siteConfig.coverageNote} A blank state on this site is not
              evidence that Michelin inspected the region and found nothing; it
              usually means the Guide’s current coverage does not include that
              territory in the imported roster.
            </p>
          </section>

          <section className="rounded-[var(--radius-lg)] border border-border p-6">
            <h2 className="font-display text-2xl text-ink">
              Bib Gourmand comparison
            </h2>
            <p className="mt-3 font-sans text-sm leading-relaxed text-ink-muted">
              Bib Gourmand is a separate Michelin Guide distinction focused on
              notably good food at a more moderate price point. It is not a star
              level and is not interchangeable with one-, two-, or three-star
              awards. This atlas currently tracks Michelin-starred restaurants
              only.
            </p>
          </section>

          <section className="rounded-[var(--radius-lg)] border border-border p-6">
            <h2 className="font-display text-2xl text-ink">
              Green Star comparison
            </h2>
            <p className="mt-3 font-sans text-sm leading-relaxed text-ink-muted">
              The Michelin Green Star highlights restaurants with notable
              sustainable practices. It can appear alongside star awards, but it
              measures a different dimension than culinary stars. This roster
              does not yet model Green Star status as a first-class filter.
            </p>
          </section>

          <section className="rounded-[var(--radius-lg)] border border-border p-6">
            <h2 className="font-display text-2xl text-ink">
              Independent platform
            </h2>
            <p className="mt-3 font-sans text-sm leading-relaxed text-ink-muted">
              {siteConfig.independenceDisclaimer} Restaurant names, addresses,
              cuisine labels, and star counts come from a verified workbook
              import. Michelin Guide listing pages are linked as outbound
              references.
            </p>
            <p className="mt-4 font-sans text-sm text-ink-muted">
              Official source:{" "}
              <a
                href="https://guide.michelin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-forest underline underline-offset-4"
              >
                Michelin Guide
              </a>
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
