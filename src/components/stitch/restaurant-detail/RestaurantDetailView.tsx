import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { PageContainer } from "@/components/stitch/PageContainer";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { breadcrumbJsonLd, restaurantJsonLd } from "@/lib/seo/jsonld";
import type { Restaurant } from "@/lib/data/types";
import type { RestaurantDetailViewModel } from "./models";
import { NearbyRestaurantsSection } from "./NearbyRestaurantsSection";
import { RelatedRestaurantsSection } from "./RelatedRestaurantsSection";
import { RestaurantDetailStickyBar } from "./RestaurantDetailStickyBar";
import { RestaurantFacts } from "./RestaurantFacts";
import { RestaurantGoogleSection } from "./RestaurantGoogleSection";
import { RestaurantIdentityHero } from "./RestaurantIdentityHero";

type RestaurantDetailViewProps = {
  model: RestaurantDetailViewModel;
  /** Domain restaurant for structured data only. */
  restaurantEntity: Restaurant;
};

/**
 * Full Stitch restaurant-detail composition (Benu silhouette).
 * Server-rendered shell with client islands for journey, Google, sticky bar.
 */
export function RestaurantDetailView({
  model,
  restaurantEntity,
}: RestaurantDetailViewProps) {
  const { restaurant, breadcrumbs, related, nearby, source } = model;

  return (
    <div
      className="border-b border-dp-border pb-24 lg:pb-0"
      data-restaurant-detail="stitch"
    >
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <JsonLd data={restaurantJsonLd(restaurantEntity)} />

      <PageContainer className="py-8 md:py-[var(--dp-margin-desktop)]">
        <Breadcrumbs items={breadcrumbs} />

        <div className="mt-8">
          <RestaurantIdentityHero restaurant={restaurant} />
        </div>

        {/* Details + Google band — preserves Benu  silhouette */}
        <section
          className="mb-[var(--dp-section)] flex flex-col gap-6 lg:flex-row"
          aria-label="Restaurant details and live place information"
        >
          <RestaurantFacts restaurant={restaurant} />
          <RestaurantGoogleSection
            restaurantSlug={restaurant.slug}
            placeId={restaurant.googlePlaceId}
          />
        </section>

        <RelatedRestaurantsSection
          title={model.relatedTitle}
          restaurants={related}
        />
        <NearbyRestaurantsSection
          title={model.nearbyTitle}
          restaurants={nearby}
        />

        <section
          className="mb-[var(--dp-section)] border-t border-dp-border pt-8"
          aria-labelledby="source-note-heading"
        >
          <h2 id="source-note-heading" className="sr-only">
            Source and independence
          </h2>
          <p className="max-w-2xl font-sans text-sm leading-relaxed text-dp-ink-muted">
            Last dataset import: {source.importedAt}. {source.dataUpdatedLabel}.
            Facts on this page come from the verified workbook roster only.
            Google photos, ratings, hours, and reviews appear only inside the
            Google module above.
          </p>
          <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-dp-ink-muted">
            {source.independenceDisclaimer || siteConfig.independenceDisclaimer}
          </p>
        </section>
      </PageContainer>

      <RestaurantDetailStickyBar restaurant={restaurant} />
    </div>
  );
}
