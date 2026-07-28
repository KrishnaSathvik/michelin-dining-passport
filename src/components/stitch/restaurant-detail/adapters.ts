import { toRelatedRestaurantCardModel } from "@/components/stitch/restaurant";
import type { MapRestaurant } from "@/lib/data/geocodes";
import type { Restaurant } from "@/lib/data/types";
import {
  getRestaurantReservationAction,
  reservationDuplicatesMichelin,
  reservationDuplicatesWebsite,
} from "@/lib/reservations/resolve";
import { getRestaurantReservation } from "@/lib/reservations/data";
import type { RestaurantReservation } from "@/lib/reservations/types";
import type { BreadcrumbItem } from "@/lib/seo/jsonld";
import type {
  RestaurantDetailModel,
  RestaurantGalleryImage,
  RestaurantDetailViewModel,
} from "./models";

type DetailAdapterInput = {
  restaurant: Restaurant;
  reservation: RestaurantReservation | null;
  mapRestaurant: MapRestaurant | null;
  related: Restaurant[];
  nearby: Restaurant[];
  googlePlaceId: string | null;
  gallery?: RestaurantGalleryImage[];
};

function formatLocation(restaurant: Restaurant): string {
  return `${restaurant.city}, ${restaurant.stateCode}`;
}

export function toRestaurantDetailModel(input: {
  restaurant: Restaurant;
  reservation: RestaurantReservation | null;
  mapRestaurant: MapRestaurant | null;
  googlePlaceId: string | null;
  gallery?: RestaurantGalleryImage[];
}): RestaurantDetailModel {
  const {
    restaurant,
    reservation,
    mapRestaurant,
    googlePlaceId,
    gallery = [],
  } = input;
  const action = getRestaurantReservationAction(restaurant, reservation);
  const hideWebsite = reservationDuplicatesWebsite(restaurant, action);
  const hideMichelin = reservationDuplicatesMichelin(restaurant, action);
  const cuisine = restaurant.cuisine?.trim() || undefined;
  const price = restaurant.price?.trim() || undefined;
  const address = restaurant.address?.trim() || undefined;
  const website = restaurant.website?.trim() || undefined;
  const hasCoords =
    Boolean(mapRestaurant?.hasApprovedCoordinates) &&
    mapRestaurant?.latitude != null &&
    mapRestaurant?.longitude != null;

  return {
    slug: restaurant.slug,
    name: restaurant.name,
    stars: restaurant.stars,
    cuisine,
    city: restaurant.city,
    state: restaurant.state,
    stateCode: restaurant.stateCode,
    citySlug: restaurant.citySlug,
    stateSlug: restaurant.stateSlug,
    cuisineSlug: restaurant.cuisineSlug,
    price,
    address,
    locationLabel: formatLocation(restaurant),
    coordinates: hasCoords
      ? {
          latitude: mapRestaurant!.latitude!,
          longitude: mapRestaurant!.longitude!,
        }
      : undefined,
    gallery: gallery.filter((image) => image.url.trim()),
    reservation: action,
    reservationProvider: reservation?.provider,
    officialWebsite: website,
    michelinGuideUrl: restaurant.michelinGuideUrl?.trim() || undefined,
    showOfficialWebsite: Boolean(website && !hideWebsite),
    showMichelinGuide: Boolean(
      restaurant.michelinGuideUrl?.trim() && !hideMichelin,
    ),
    mapHref: `/map?selected=${encodeURIComponent(restaurant.slug)}`,
    hasApprovedImage: gallery.some(
      (image) => image.kind === "verified" && Boolean(image.url.trim()),
    ),
    googlePlaceId,
  };
}

export function toRestaurantDetailBreadcrumbs(
  restaurant: Restaurant,
): BreadcrumbItem[] {
  return [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/explore" },
    { name: restaurant.name, path: `/restaurants/${restaurant.slug}` },
  ];
}

export function toRestaurantDetailViewModel(
  input: DetailAdapterInput,
): RestaurantDetailViewModel {
  const { restaurant, related, nearby } = input;
  const detail = toRestaurantDetailModel(input);
  const relatedModels = related
    .filter((item) => item.slug !== restaurant.slug)
    .slice(0, 3)
    .map((item) =>
      toRelatedRestaurantCardModel(item, {
        reservation: getRestaurantReservation(item.slug),
        surface: "related_restaurant",
      }),
    );
  const relatedSlugs = new Set(relatedModels.map((item) => item.slug));

  return {
    restaurant: detail,
    breadcrumbs: toRestaurantDetailBreadcrumbs(restaurant),
    related: relatedModels,
    nearby: nearby
      .filter(
        (item) =>
          item.slug !== restaurant.slug && !relatedSlugs.has(item.slug),
      )
      .slice(0, 3)
      .map((item) =>
        toRelatedRestaurantCardModel(item, {
          reservation: getRestaurantReservation(item.slug),
          surface: "related_restaurant",
        }),
      ),
    relatedTitle: detail.cuisine
      ? `More ${detail.cuisine} restaurants`
      : "Similar restaurants",
    nearbyTitle: `More restaurants in ${detail.city}`,
  };
}
