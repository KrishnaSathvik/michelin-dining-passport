import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  RestaurantDetailView,
  toRestaurantDetailViewModel,
} from "@/components/stitch/restaurant-detail";
import { siteConfig } from "@/config/site";
import { getMapRestaurants } from "@/lib/data/geocodes";
import {
  getNearbyRestaurants,
  getRelatedByCuisine,
  getRestaurantBySlug,
  getRestaurants,
} from "@/lib/data/restaurants";
import { getApprovedGooglePlaceId } from "@/lib/google-places/place-ids";
import { getRestaurantReservation } from "@/lib/reservations/data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { restaurantJsonLd, serializeJsonLd } from "@/lib/seo/restaurant-jsonld";

type RestaurantPageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Unknown slugs 404 at the router, which requires this route to stay
 * prerenderable. Two things would silently break that and turn the 404 back
 * into a soft 200:
 *   - reading `searchParams` here (makes the route dynamic), and
 *   - a `loading.tsx` in this segment (starts streaming, and a status cannot
 *     be set once streaming has begun).
 * `returnTo` and the gallery proof fixtures are therefore read on the client.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return getRestaurants().map((restaurant) => ({ slug: restaurant.slug }));
}

export async function generateMetadata({
  params,
}: RestaurantPageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  return buildPageMetadata({
    title: restaurant.name,
    description: [
      `${restaurant.name} is a ${restaurant.stars}-star Michelin Guide restaurant in ${restaurant.city}, ${restaurant.state}.`,
      restaurant.cuisine ? `Explore its ${restaurant.cuisine} profile` : "Explore its restaurant profile",
      `and save it to ${siteConfig.productName}.`,
    ].join(" "),
    path: `/restaurants/${restaurant.slug}`,
  });
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { slug } = await params;
  const restaurant = getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  const nearby = getNearbyRestaurants(restaurant);
  const related = getRelatedByCuisine(restaurant);
  const reservation = getRestaurantReservation(restaurant.slug);
  const mapRestaurant =
    getMapRestaurants().find((item) => item.slug === restaurant.slug) ?? null;
  const googlePlaceId = getApprovedGooglePlaceId(restaurant.slug);

  const model = toRestaurantDetailViewModel({
    restaurant,
    reservation,
    mapRestaurant,
    related,
    nearby,
    googlePlaceId,
  });

  return (
    <>
      <script
        type="application/ld+json"
        // First-party catalog data, escaped via serializeJsonLd — no untrusted input.
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(restaurantJsonLd(restaurant)),
        }}
      />
      <RestaurantDetailView model={model} restaurantEntity={restaurant} />
    </>
  );
}
