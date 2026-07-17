import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { CuisineLabel } from "@/components/restaurant/CuisineLabel";
import { ExternalTextLink } from "@/components/restaurant/ExternalTextLink";
import { LocationLine } from "@/components/restaurant/LocationLine";
import { PriceMark } from "@/components/restaurant/PriceMark";
import { ReservationButton } from "@/components/restaurant/ReservationButton";
import { RestaurantDetailStickyBar } from "@/components/restaurant/RestaurantDetailStickyBar";
import { RestaurantLocationPreview } from "@/components/restaurant/RestaurantLocationPreview";
import { RestaurantMedia } from "@/components/restaurant/RestaurantMedia";
import { RestaurantRelatedList } from "@/components/restaurant/RestaurantRelatedList";
import { SaveRestaurantButton } from "@/components/restaurant/SaveRestaurantButton";
import { StarMark } from "@/components/restaurant/StarMark";
import { RestaurantPassportControls } from "@/components/passport/RestaurantPassportControls";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { getMapRestaurants } from "@/lib/data/geocodes";
import {
  getNearbyRestaurants,
  getRelatedByCuisine,
  getRestaurantBySlug,
  getRestaurants,
  getSourceMeta,
} from "@/lib/data/restaurants";
import { getRestaurantReservation } from "@/lib/reservations/data";
import {
  getRestaurantReservationAction,
  reservationDuplicatesMichelin,
  reservationDuplicatesWebsite,
} from "@/lib/reservations/resolve";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, restaurantJsonLd } from "@/lib/seo/jsonld";

type RestaurantPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getRestaurants().map((restaurant) => ({ slug: restaurant.slug }));
}

export async function generateMetadata({
  params,
}: RestaurantPageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = getRestaurantBySlug(slug);
  if (!restaurant) {
    return buildPageMetadata({
      title: "Restaurant not found",
      description: "This restaurant listing could not be found.",
      path: `/restaurants/${slug}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: restaurant.name,
    description: `${restaurant.name} is a ${restaurant.stars}-star Michelin Guide restaurant in ${restaurant.city}, ${restaurant.state} serving ${restaurant.cuisine}. Independent listing on ${siteConfig.productName}.`,
    path: `/restaurants/${restaurant.slug}`,
  });
}

function starDistinctionLabel(stars: 1 | 2 | 3): string {
  if (stars === 1) return "1 Michelin Star";
  if (stars === 2) return "2 Michelin Stars";
  return "3 Michelin Stars";
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { slug } = await params;
  const restaurant = getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  const nearby = getNearbyRestaurants(restaurant);
  const related = getRelatedByCuisine(restaurant);
  const source = getSourceMeta();
  const reservation = getRestaurantReservation(restaurant.slug);
  const reservationAction = getRestaurantReservationAction(
    restaurant,
    reservation,
  );
  const hideWebsiteBecauseReservation = reservationDuplicatesWebsite(
    restaurant,
    reservationAction,
  );
  const hideMichelinBecauseReservation = reservationDuplicatesMichelin(
    restaurant,
    reservationAction,
  );
  const mapRestaurant =
    getMapRestaurants().find((item) => item.slug === restaurant.slug) ?? null;
  const hasApprovedImage = Boolean(
    (restaurant as { heroImageUrl?: string | null }).heroImageUrl?.trim(),
  );

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/explore" },
    { name: restaurant.state, path: `/usa/${restaurant.stateSlug}` },
    { name: restaurant.city, path: `/cities/${restaurant.citySlug}` },
    { name: restaurant.name, path: `/restaurants/${restaurant.slug}` },
  ];

  return (
    <div className="border-b border-border pb-24 lg:pb-0">
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <JsonLd data={restaurantJsonLd(restaurant)} />
      <Container className="py-8 sm:py-12">
        <Breadcrumbs items={breadcrumbs} />

        {/* Hero: media ~60% · info ~40% on desktop; stacked mobile */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start lg:gap-10">
          <div>
            <RestaurantMedia
              restaurant={restaurant}
              priorityVisual
              className="aspect-[4/3] w-full lg:aspect-[5/4]"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
            {!hasApprovedImage ? (
              <p className="mt-3 font-sans text-xs leading-relaxed text-ink-muted">
                Designed presentation until an approved restaurant photograph is
                available. This platform does not ingest Michelin Guide
                photography.
              </p>
            ) : null}
          </div>

          <div className="lg:pt-1">
            <p className="font-sans text-xs uppercase tracking-[0.18em] text-ink-muted">
              {starDistinctionLabel(restaurant.stars)}
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
              {restaurant.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <StarMark stars={restaurant.stars} size="lg" />
              <CuisineLabel cuisine={restaurant.cuisine} />
              <PriceMark price={restaurant.price} />
            </div>

            <p className="mt-4 font-sans text-base text-ink-secondary">
              <LocationLine
                city={restaurant.city}
                state={restaurant.state}
                stateCode={restaurant.stateCode}
              />
            </p>
            <p className="mt-2 max-w-md font-sans text-sm leading-relaxed text-ink-muted">
              {restaurant.address}
            </p>

            <div className="mt-6 hidden flex-wrap items-center gap-3 lg:flex">
              <ReservationButton
                restaurant={restaurant}
                reservation={reservation}
                surface="restaurant_detail"
                variant="full"
                className="rounded-[var(--radius-md)]"
              />
              <SaveRestaurantButton restaurantSlug={restaurant.slug} />
            </div>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-sans text-sm">
              {restaurant.website && !hideWebsiteBecauseReservation ? (
                <ExternalTextLink
                  href={restaurant.website}
                  className="text-ink-secondary underline-offset-4 hover:text-forest hover:underline"
                >
                  Official website
                </ExternalTextLink>
              ) : null}
              {!hideMichelinBecauseReservation ? (
                <ExternalTextLink
                  href={restaurant.michelinGuideUrl}
                  className="text-ink-secondary underline-offset-4 hover:text-forest hover:underline"
                >
                  Michelin Guide
                </ExternalTextLink>
              ) : null}
            </div>

            <dl className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
              <div>
                <dt className="font-sans text-xs uppercase tracking-[0.16em] text-ink-muted">
                  Cuisine
                </dt>
                <dd className="mt-1">
                  <Link
                    href={`/cuisines/${restaurant.cuisineSlug}`}
                    className="font-sans text-sm text-forest no-underline hover:underline"
                  >
                    {restaurant.cuisine}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="font-sans text-xs uppercase tracking-[0.16em] text-ink-muted">
                  Distinction
                </dt>
                <dd className="mt-1">
                  <Link
                    href={`/stars/${restaurant.stars}`}
                    className="font-sans text-sm text-forest no-underline hover:underline"
                  >
                    {starDistinctionLabel(restaurant.stars)}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="font-sans text-xs uppercase tracking-[0.16em] text-ink-muted">
                  City
                </dt>
                <dd className="mt-1">
                  <Link
                    href={`/cities/${restaurant.citySlug}`}
                    className="font-sans text-sm text-forest no-underline hover:underline"
                  >
                    {restaurant.city}, {restaurant.stateCode}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="font-sans text-xs uppercase tracking-[0.16em] text-ink-muted">
                  State
                </dt>
                <dd className="mt-1">
                  <Link
                    href={`/usa/${restaurant.stateSlug}`}
                    className="font-sans text-sm text-forest no-underline hover:underline"
                  >
                    {restaurant.state}
                  </Link>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-10 max-w-3xl">
          <RestaurantPassportControls restaurantSlug={restaurant.slug} />
        </div>

        {mapRestaurant ? (
          <RestaurantLocationPreview restaurant={mapRestaurant} />
        ) : null}

        <RestaurantRelatedList
          title={`Also in ${restaurant.city}`}
          restaurants={nearby}
          emptyNote={`No other starred restaurants from the same city are in the current roster.`}
        />
        <RestaurantRelatedList
          title={`More ${restaurant.cuisine}`}
          restaurants={related}
        />

        <section className="mt-12 border-t border-border pt-8">
          <h2 className="font-display text-2xl text-ink">Dataset notes</h2>
          <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-ink-muted">
            Last dataset import: {source.importedAt}. {siteConfig.dataUpdatedLabel}.
            Facts on this page come from the verified workbook roster only.
          </p>
          <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-ink-muted">
            {siteConfig.independenceDisclaimer}
          </p>
        </section>
      </Container>

      <RestaurantDetailStickyBar
        restaurant={restaurant}
        reservation={reservation}
      />
    </div>
  );
}
