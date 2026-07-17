import Link from "next/link";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { ExploreResults } from "@/components/explore/ExploreResults";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Restaurant } from "@/lib/data/types";
import { breadcrumbJsonLd, type BreadcrumbItem } from "@/lib/seo/jsonld";

type RelatedLink = {
  href: string;
  label: string;
};

type TaxonomyPageShellProps = {
  breadcrumbs: BreadcrumbItem[];
  eyebrow: string;
  title: string;
  introduction: string;
  count: number;
  restaurants: Restaurant[];
  relatedLinks: RelatedLink[];
  /** Optional visual motif for generic destination/cuisine surfaces — never a named restaurant photo */
  visualTone?: "destination" | "cuisine" | "stars";
};

const toneClass = {
  destination:
    "from-forest via-forest to-[#1a4d3e]",
  cuisine:
    "from-[#1a2f28] via-forest to-[#0f2920]",
  stars: "from-ink via-[#1c1c1c] to-forest",
} as const;

export function TaxonomyPageShell({
  breadcrumbs,
  eyebrow,
  title,
  introduction,
  count,
  restaurants,
  relatedLinks,
  visualTone = "destination",
}: TaxonomyPageShellProps) {
  return (
    <div className="border-b border-border">
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <Container className="py-8 sm:py-12">
        <Breadcrumbs items={breadcrumbs} />

        <header className="mt-6 overflow-hidden rounded-[var(--radius-lg)]">
          <div
            className={`relative bg-gradient-to-br ${toneClass[visualTone]} px-6 py-10 text-white sm:px-10 sm:py-14`}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(ellipse 70% 80% at 85% 20%, rgba(184,138,42,0.35), transparent 55%)",
              }}
              aria-hidden="true"
            />
            <div className="relative max-w-3xl">
              <p className="font-sans text-xs uppercase tracking-[0.18em] text-white/60">
                {eyebrow}
              </p>
              <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-white/80">
                {introduction}
              </p>
              <p className="mt-5 inline-flex min-h-10 items-center rounded-full border border-white/25 bg-white/10 px-4 font-sans text-sm text-white">
                {count} restaurant{count === 1 ? "" : "s"} in the current roster
              </p>
            </div>
          </div>
        </header>

        <div className="mt-10">
          <ExploreResults
            restaurants={restaurants}
            view="grid"
            surface="taxonomy"
          />
        </div>

        {relatedLinks.length > 0 ? (
          <section className="mt-12 border-t border-border pt-8">
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              Related
            </h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {relatedLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-border bg-bg px-4 font-sans text-sm text-ink no-underline transition-colors hover:border-forest hover:text-forest"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </div>
  );
}
