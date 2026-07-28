import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageContainer } from "@/components/stitch/PageContainer";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { CuisineHubGrid } from "./CuisineHubGrid";
import type { CuisinePageViewModel } from "./models";
import { RelatedCuisines } from "./RelatedCuisines";
import { TaxonomyHero } from "./TaxonomyHero";
import { TaxonomyRestaurantSection } from "./TaxonomyRestaurantSection";

type CuisinePageViewProps = {
  model: CuisinePageViewModel;
};

export function CuisinePageView({ model }: CuisinePageViewProps) {
  return (
    <div data-taxonomy="cuisine">
      <JsonLd data={breadcrumbJsonLd(model.hero.breadcrumbs)} />
      <TaxonomyHero model={model.hero} />
      <CuisineHubGrid hubs={model.hubs} cuisineName={model.hero.title} />
      <TaxonomyRestaurantSection
        title="Michelin-starred restaurants"
        restaurants={model.restaurants}
        exploreHref={model.exploreHref}
        exploreLabel="Filter in Explore"
        columns="dense"
      />
      <RelatedCuisines cuisines={model.relatedCuisines} />
      <section className="pb-[var(--dp-section)]">
        <PageContainer>
          <p className="max-w-2xl font-sans text-sm text-dp-ink-muted">
            Cuisine labels reflect the current roster’s terminology. Restaurants
            may use more specific or overlapping style labels.{" "}
            <Link
              href={model.exploreHref}
              className="font-semibold text-dp-primary underline-offset-4 hover:underline"
            >
              Open advanced filters in Explore
            </Link>
            .
          </p>
        </PageContainer>
      </section>
    </div>
  );
}
