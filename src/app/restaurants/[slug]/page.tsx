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
import { RestaurantImagePlaceholder } from "@/components/restaurant/RestaurantImagePlaceholder";
import { RestaurantRelatedList } from "@/components/restaurant/RestaurantRelatedList";
import { StarMark } from "@/components/restaurant/StarMark";
import { PassportClientShell } from "@/components/passport/PassportClientShell";
import { RestaurantPassportControls } from "@/components/passport/RestaurantPassportControls";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
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

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { slug } = await params;
  const restaurant = getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  const nearby = getNearbyRestaurants(restaurant);
  const related = getRelatedByCuisine(restaurant);
  const source = getSourceMeta();
  const allRestaurants = getRestaurants();
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
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/explore" },
    { name: restaurant.state, path: `/usa/${restaurant.stateSlug}` },
    { name: restaurant.city, path: `/cities/${restaurant.citySlug}` },
    { name: restaurant.name, path: `/restaurants/${restaurant.slug}` },
  ];

  return (
    <div className="border-b border-border">
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <JsonLd data={restaurantJsonLd(restaurant)} />
      <Container className="py-10 sm:py-14">
        <Breadcrumbs items={breadcrumbs} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
          <div>
            <p className="font-sans text-xs uppercase tracking-[0.18em] text-burgundy">
              Restaurant
            </p>
            <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
              {restaurant.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <StarMark stars={restaurant.stars} />
              <CuisineLabel cuisine={restaurant.cuisine} />
              <PriceMark price={restaurant.price} />
            </div>
            <p className="mt-4 font-sans text-base text-ink-muted">
              <LocationLine
                city={restaurant.city}
                state={restaurant.state}
                stateCode={restaurant.stateCode}
              />
            </p>
            <p className="mt-3 max-w-xl font-sans text-sm leading-relaxed text-ink-muted">
              {restaurant.address}
            </p>

            <div className="mt-6 flex flex-wrap items-end gap-3 font-sans text-sm">
              <ReservationButton
                restaurant={restaurant}
                reservation={reservation}
                surface="restaurant_detail"
                variant="full"
              />
              {restaurant.website && !hideWebsiteBecauseReservation ? (
                <ExternalTextLink
                  href={restaurant.website}
                  className="inline-flex min-h-11 items-center border border-border px-4"
                >
                  Official website
                </ExternalTextLink>
              ) : null}
              {!hideMichelinBecauseReservation ? (
                <ExternalTextLink
                  href={restaurant.michelinGuideUrl}
                  className="inline-flex min-h-11 items-center border border-border px-4"
                >
                  Michelin Guide
                </ExternalTextLink>
              ) : null}
            </div>

            <div className="mt-8">
              <PassportClientShell restaurants={allRestaurants}>
                <RestaurantPassportControls
                  restaurantSlug={restaurant.slug}
                />
              </PassportClientShell>
            </div>

            <dl className="mt-8 grid gap-4 border border-border bg-bg-elevated/50 p-5 sm:grid-cols-2">
              <div>
                <dt className="font-sans text-xs uppercase tracking-[0.16em] text-ink-muted">
                  Cuisine
                </dt>
                <dd className="mt-1">
                  <Link
                    href={`/cuisines/${restaurant.cuisineSlug}`}
                    className="font-sans text-sm text-forest underline underline-offset-4"
                  >
                    {restaurant.cuisine}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="font-sans text-xs uppercase tracking-[0.16em] text-ink-muted">
                  Star level
                </dt>
                <dd className="mt-1">
                  <Link
                    href={`/stars/${restaurant.stars}`}
                    className="font-sans text-sm text-forest underline underline-offset-4"
                  >
                    {restaurant.stars === 1
                      ? "1 star"
                      : `${restaurant.stars} stars`}
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
                    className="font-sans text-sm text-forest underline underline-offset-4"
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
                    className="font-sans text-sm text-forest underline underline-offset-4"
                  >
                    {restaurant.state}
                  </Link>
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <RestaurantImagePlaceholder
              restaurant={restaurant}
              className="aspect-[4/3] w-full"
            />
            <p className="mt-3 font-sans text-xs leading-relaxed text-ink-muted">
              Neutral image placeholder. Licensed photography will be added only
              when usage rights are confirmed. This platform does not ingest
              Michelin Guide photography.
            </p>
          </div>
        </div>

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
    </div>
  );
}
