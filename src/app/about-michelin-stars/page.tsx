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

  return (
    <div className="border-b border-border">
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <Container className="py-10 sm:py-14">
        <Breadcrumbs items={breadcrumbs} />
        <p className="mt-6 font-sans text-xs uppercase tracking-[0.18em] text-burgundy">
          Education
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl text-ink sm:text-5xl">
          Michelin stars, explained independently
        </h1>
        <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink-muted">
          This page summarizes how travelers commonly understand Michelin Guide
          star levels and related distinctions. It is original wording for{" "}
          {siteConfig.productName} and is not an official Michelin publication.
        </p>

        <div className="mt-10 space-y-10">
          <section>
            <h2 className="font-display text-3xl text-ink">One star</h2>
            <p className="mt-3 max-w-2xl font-sans text-base leading-relaxed text-ink-muted">
              One star signals high-quality cooking that is worth a stop. In
              practice, it marks a restaurant where technique, ingredients, and
              consistency rise above the ordinary for its category — a place
              worth planning into a trip without necessarily reorganizing the
              entire itinerary around it.
            </p>
            <p className="mt-3">
              <Link
                href="/stars/1"
                className="font-sans text-sm text-forest underline underline-offset-4"
              >
                Browse {totals.oneStar} one-star restaurants
              </Link>
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl text-ink">Two stars</h2>
            <p className="mt-3 max-w-2xl font-sans text-base leading-relaxed text-ink-muted">
              Two stars mark excellent cooking worth a detour. The distinction
              usually implies a clearer culinary point of view — more ambition,
              precision, or personality — enough that many diners will go out of
              their way rather than treat the meal as a convenient stop.
            </p>
            <p className="mt-3">
              <Link
                href="/stars/2"
                className="font-sans text-sm text-forest underline underline-offset-4"
              >
                Browse {totals.twoStar} two-star restaurants
              </Link>
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl text-ink">Three stars</h2>
            <p className="mt-3 max-w-2xl font-sans text-base leading-relaxed text-ink-muted">
              Three stars represent exceptional cuisine worth a special journey.
              It is the Guide’s highest star distinction and typically signals a
              meal people will travel specifically to experience. This atlas
              currently lists {totals.threeStar} three-star restaurants in the
              United States roster.
            </p>
            <p className="mt-3">
              <Link
                href="/stars/3"
                className="font-sans text-sm text-forest underline underline-offset-4"
              >
                Browse three-star restaurants
              </Link>
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl text-ink">
              Michelin coverage limitations
            </h2>
            <p className="mt-3 max-w-2xl font-sans text-base leading-relaxed text-ink-muted">
              {siteConfig.coverageNote} A blank state on this site is not evidence
              that Michelin inspected the region and found nothing; it usually
              means the Guide’s current coverage does not include that territory
              in the imported roster.
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl text-ink">
              Stars versus Bib Gourmand
            </h2>
            <p className="mt-3 max-w-2xl font-sans text-base leading-relaxed text-ink-muted">
              Bib Gourmand is a separate Michelin Guide distinction focused on
              notably good food at a more moderate price point. It is not a star
              level and is not interchangeable with one-, two-, or three-star
              awards. This atlas currently tracks Michelin-starred restaurants
              only.
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl text-ink">
              Stars versus Green Star
            </h2>
            <p className="mt-3 max-w-2xl font-sans text-base leading-relaxed text-ink-muted">
              The Michelin Green Star highlights restaurants with notable
              sustainable practices. It can appear alongside star awards, but it
              measures a different dimension of dining than culinary stars. This
              roster does not yet model Green Star status as a first-class filter.
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl text-ink">
              Non-affiliation disclaimer
            </h2>
            <p className="mt-3 max-w-2xl font-sans text-base leading-relaxed text-ink-muted">
              {siteConfig.independenceDisclaimer} Restaurant names, addresses,
              cuisine labels, and star counts come from a verified workbook
              import. Michelin Guide listing pages are linked as outbound
              references so readers can consult the Guide directly.
            </p>
            <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-ink-muted">
              For official definitions and current awards, consult the{" "}
              <a
                href="https://guide.michelin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-forest underline underline-offset-4"
              >
                Michelin Guide
              </a>
              .
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
