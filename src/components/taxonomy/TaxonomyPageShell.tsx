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
};

export function TaxonomyPageShell({
  breadcrumbs,
  eyebrow,
  title,
  introduction,
  count,
  restaurants,
  relatedLinks,
}: TaxonomyPageShellProps) {
  return (
    <div className="border-b border-border">
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <Container className="py-10 sm:py-14">
        <Breadcrumbs items={breadcrumbs} />
        <p className="mt-6 font-sans text-xs uppercase tracking-[0.18em] text-burgundy">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink-muted">
          {introduction}
        </p>
        <p className="mt-3 font-sans text-sm text-ink-muted">
          {count} restaurant{count === 1 ? "" : "s"} in the current roster
        </p>

        <div className="mt-10">
          <ExploreResults
            restaurants={restaurants}
            view="grid"
            surface="taxonomy"
          />
        </div>

        {relatedLinks.length > 0 ? (
          <section className="mt-12 border-t border-border pt-8">
            <h2 className="font-display text-2xl text-ink">Related</h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {relatedLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-10 items-center border border-border px-3 font-sans text-sm text-ink transition-colors hover:border-forest hover:text-forest"
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
