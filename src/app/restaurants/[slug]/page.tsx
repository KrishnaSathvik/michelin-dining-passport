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
  getSourceMeta,
} from "@/lib/data/restaurants";
import { getApprovedGooglePlaceId } from "@/lib/google-places/place-ids";
import { getRestaurantReservation } from "@/lib/reservations/data";
import { buildPageMetadata } from "@/lib/seo/metadata";

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
  const sourceMeta = getSourceMeta();
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
    source: {
      importedAt: sourceMeta.importedAt,
      dataUpdatedLabel: siteConfig.dataUpdatedLabel,
      independenceDisclaimer: siteConfig.independenceDisclaimer,
    },
  });

  return (
    <RestaurantDetailView model={model} restaurantEntity={restaurant} />
  );
}
