import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { PageContainer } from "@/components/stitch/PageContainer";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, restaurantJsonLd } from "@/lib/seo/jsonld";
import { Suspense } from "react";
import type { Restaurant } from "@/lib/data/types";
import { BackToResultsLink } from "./BackToResultsLink";
import type { RestaurantDetailViewModel } from "./models";
import { NearbyRestaurantsSection } from "./NearbyRestaurantsSection";
import { RelatedRestaurantsSection } from "./RelatedRestaurantsSection";
import { RestaurantDetailStickyBar } from "./RestaurantDetailStickyBar";
import { RestaurantDetailsPanel } from "./RestaurantDetailsPanel";
import { RestaurantAboutSection } from "./RestaurantAboutSection";
import { RestaurantLocationSection } from "./RestaurantLocationSection";
import { RestaurantPassportSummary } from "./RestaurantPassportSummary";
import { RestaurantPhotoHero } from "./RestaurantPhotoHero";

type RestaurantDetailViewProps = {
  model: RestaurantDetailViewModel;
  /** Domain restaurant for structured data only. */
  restaurantEntity: Restaurant;
};

/**
 * Restaurant detail: a single full-width hero (with photo lightbox), the name
 * and stars, then one consolidated Details panel, location, and discovery.
 */
export function RestaurantDetailView({
  model,
  restaurantEntity,
}: RestaurantDetailViewProps) {
  const { restaurant, breadcrumbs, related, nearby } = model;

  return (
    <div
      className="border-b border-dp-border pb-24 lg:pb-0"
      data-restaurant-detail="stitch"
    >
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <JsonLd data={restaurantJsonLd(restaurantEntity)} />

      <PageContainer className="py-8 md:py-[var(--dp-margin-desktop)]">
        <Breadcrumbs items={breadcrumbs} />
        <Suspense fallback={null}>
          <BackToResultsLink />
        </Suspense>

        <div
          className="mb-[var(--dp-section)] mt-8"
          data-restaurant-hero="identity"
        >
          <RestaurantPhotoHero
            name={restaurant.name}
            slug={restaurant.slug}
            city={restaurant.city}
            stars={restaurant.stars}
            placeId={restaurant.googlePlaceId}
          />
          <div className="mt-10 max-w-3xl">
            <RestaurantDetailsPanel restaurant={restaurant} />
          </div>
        </div>

        <RestaurantAboutSection slug={restaurant.slug} name={restaurant.name} />
        <RestaurantLocationSection restaurant={restaurant} />
        <RestaurantPassportSummary
          restaurantSlug={restaurant.slug}
          restaurantName={restaurant.name}
        />

        <RelatedRestaurantsSection
          title={model.relatedTitle}
          restaurants={related}
        />
        <NearbyRestaurantsSection
          title={model.nearbyTitle}
          restaurants={nearby}
        />
      </PageContainer>

      <RestaurantDetailStickyBar restaurant={restaurant} />
    </div>
  );
}
