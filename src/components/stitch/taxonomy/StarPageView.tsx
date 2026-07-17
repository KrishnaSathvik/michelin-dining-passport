import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageContainer } from "@/components/stitch/PageContainer";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { DistinctionBentoGrid } from "./DistinctionBentoGrid";
import type { StarPageViewModel } from "./models";
import { OtherDistinctions } from "./OtherDistinctions";
import { TaxonomyHero } from "./TaxonomyHero";
import { TaxonomyRestaurantSection } from "./TaxonomyRestaurantSection";

type StarPageViewProps = {
  model: StarPageViewModel;
};

export function StarPageView({ model }: StarPageViewProps) {
  return (
    <div data-taxonomy="stars" data-stars={model.stars}>
      <JsonLd data={breadcrumbJsonLd(model.hero.breadcrumbs)} />
      <TaxonomyHero model={model.hero} />
      {model.stars === 3 ? (
        <DistinctionBentoGrid
          restaurants={model.restaurants}
          exploreHref={model.exploreHref}
          remainingCount={model.remainingCount}
        />
      ) : (
        <TaxonomyRestaurantSection
          title="Michelin-starred restaurants"
          restaurants={model.restaurants}
          exploreHref={model.remainingExploreHref ?? model.exploreHref}
          exploreLabel="Open in Explore"
          remainingCount={model.remainingCount}
          columns={model.stars === 2 ? "dense" : "discovery"}
        />
      )}
      <OtherDistinctions items={model.otherDistinctions} />
      <section className="pb-[var(--dp-section)]">
        <PageContainer className="flex flex-wrap gap-4">
          <Link
            href={model.exploreHref}
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--dp-radius-md)] bg-dp-primary px-5 font-sans text-sm font-semibold text-dp-on-primary no-underline"
          >
            Explore restaurants
          </Link>
          <Link
            href={model.mapHref}
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--dp-radius-md)] border border-dp-border px-5 font-sans text-sm font-semibold text-dp-primary no-underline"
          >
            Open map
          </Link>
        </PageContainer>
      </section>
    </div>
  );
}
