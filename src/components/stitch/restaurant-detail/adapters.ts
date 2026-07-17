import {
  toNearbyRestaurantRowModel,
  toRelatedRestaurantCardModel,
} from "@/components/stitch/restaurant";
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
  RestaurantDetailSourceNote,
  RestaurantDetailViewModel,
} from "./models";

type DetailAdapterInput = {
  restaurant: Restaurant;
  reservation: RestaurantReservation | null;
  mapRestaurant: MapRestaurant | null;
  related: Restaurant[];
  nearby: Restaurant[];
  googlePlaceId: string | null;
  source: RestaurantDetailSourceNote;
};

function formatLocation(restaurant: Restaurant): string {
  return `${restaurant.city}, ${restaurant.stateCode}`;
}

function heroImage(
  restaurant: Restaurant,
): RestaurantDetailModel["image"] | undefined {
  const url = (
    restaurant as Restaurant & { heroImageUrl?: string | null }
  ).heroImageUrl?.trim();
  if (!url) return undefined;
  return {
    url,
    alt: `${restaurant.name} in ${restaurant.city}`,
  };
}

export function toRestaurantDetailModel(input: {
  restaurant: Restaurant;
  reservation: RestaurantReservation | null;
  mapRestaurant: MapRestaurant | null;
  googlePlaceId: string | null;
}): RestaurantDetailModel {
  const { restaurant, reservation, mapRestaurant, googlePlaceId } = input;
  const action = getRestaurantReservationAction(restaurant, reservation);
  const hideWebsite = reservationDuplicatesWebsite(restaurant, action);
  const hideMichelin = reservationDuplicatesMichelin(restaurant, action);
  const image = heroImage(restaurant);
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
    image,
    reservation: action,
    reservationProvider: reservation?.provider,
    officialWebsite: website,
    michelinGuideUrl: restaurant.michelinGuideUrl?.trim() || undefined,
    showOfficialWebsite: Boolean(website && !hideWebsite),
    showMichelinGuide: Boolean(
      restaurant.michelinGuideUrl?.trim() && !hideMichelin,
    ),
    mapHref: `/map?selected=${encodeURIComponent(restaurant.slug)}`,
    hasApprovedImage: Boolean(image?.url),
    googlePlaceId,
  };
}

export function toRestaurantDetailBreadcrumbs(
  restaurant: Restaurant,
): BreadcrumbItem[] {
  return [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/explore" },
    { name: restaurant.state, path: `/usa/${restaurant.stateSlug}` },
    { name: restaurant.city, path: `/cities/${restaurant.citySlug}` },
    { name: restaurant.name, path: `/restaurants/${restaurant.slug}` },
  ];
}

export function toRestaurantDetailViewModel(
  input: DetailAdapterInput,
): RestaurantDetailViewModel {
  const { restaurant, related, nearby, source } = input;
  const detail = toRestaurantDetailModel(input);

  return {
    restaurant: detail,
    breadcrumbs: toRestaurantDetailBreadcrumbs(restaurant),
    related: related
      .filter((item) => item.slug !== restaurant.slug)
      .map((item) =>
        toRelatedRestaurantCardModel(item, {
          reservation: getRestaurantReservation(item.slug),
          surface: "related_restaurant",
        }),
      ),
    nearby: nearby
      .filter((item) => item.slug !== restaurant.slug)
      .map((item) =>
        toNearbyRestaurantRowModel(item, {
          reservation: getRestaurantReservation(item.slug),
          surface: "related_restaurant",
        }),
      ),
    relatedTitle: detail.cuisine
      ? `More ${detail.cuisine}`
      : "Related Discovery",
    nearbyTitle: `Also in ${detail.city}`,
    source,
  };
}
