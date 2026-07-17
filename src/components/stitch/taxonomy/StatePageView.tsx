import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageContainer } from "@/components/stitch/PageContainer";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import type { StatePageViewModel } from "./models";
import { StateAtAGlance } from "./StateAtAGlance";
import { StateCityLinks } from "./StateCityLinks";
import { TaxonomyHero } from "./TaxonomyHero";
import { TaxonomyRestaurantSection } from "./TaxonomyRestaurantSection";

type StatePageViewProps = {
  model: StatePageViewModel;
};

export function StatePageView({ model }: StatePageViewProps) {
  return (
    <div data-taxonomy="state">
      <JsonLd data={breadcrumbJsonLd(model.hero.breadcrumbs)} />
      <TaxonomyHero model={model.hero} />
      <StateAtAGlance
        glance={model.glance}
        starBreakdown={model.starBreakdown}
        stateName={model.hero.title}
      />
      <StateCityLinks cities={model.cities} stateName={model.hero.title} />
      <TaxonomyRestaurantSection
        title="Michelin-starred restaurants"
        restaurants={model.restaurants}
        exploreHref={model.exploreHref}
        exploreLabel="Open in Explore"
      />
      {model.relatedLinks.length > 0 ? (
        <section className="border-t border-dp-border py-[var(--dp-section)]">
          <PageContainer>
            <h2 className="font-display text-[24px] text-dp-primary">
              Related
            </h2>
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
      ) : null}
    </div>
  );
}
