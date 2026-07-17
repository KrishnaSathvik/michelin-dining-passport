import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageContainer } from "@/components/stitch/PageContainer";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { CityCuisineBento } from "./CityCuisineBento";
import { CityDistinctionBento } from "./CityDistinctionBento";
import type { CityPageViewModel } from "./models";
import { TaxonomyHero } from "./TaxonomyHero";
import { TaxonomyRestaurantSection } from "./TaxonomyRestaurantSection";

type CityPageViewProps = {
  model: CityPageViewModel;
};

export function CityPageView({ model }: CityPageViewProps) {
  return (
    <div data-taxonomy="city">
      <JsonLd data={breadcrumbJsonLd(model.hero.breadcrumbs)} />
      <TaxonomyHero model={model.hero} />
      <section className="py-[var(--dp-section)]">
        <PageContainer>
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-8">
              <CityDistinctionBento {...model.distinction} />
            </div>
            <div className="lg:col-span-4">
              <CityCuisineBento cuisines={model.cuisines} />
            </div>
          </div>
        </PageContainer>
      </section>
      <TaxonomyRestaurantSection
        title="Michelin-starred restaurants"
        restaurants={model.restaurants}
      />
      <section className="border-t border-dp-border py-[var(--dp-section)]">
        <PageContainer>
          <h2 className="font-display text-[24px] text-dp-primary">Related</h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {model.relatedLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center rounded-[var(--dp-radius-md)] border border-dp-border bg-dp-surface px-4 font-sans text-sm text-dp-ink no-underline hover:border-dp-primary hover:text-dp-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </PageContainer>
      </section>
    </div>
  );
}
