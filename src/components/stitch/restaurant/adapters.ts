import type { Restaurant } from "@/lib/data/types";
import { getRestaurantReservationAction } from "@/lib/reservations/resolve";
import type {
  ReservationSurface,
  RestaurantReservation,
} from "@/lib/reservations/types";
import type {
  ApprovedRestaurantImage,
  RestaurantCardModel,
  RestaurantEditorialCardModel,
  RestaurantMapRowModel,
  RestaurantNearbyRowModel,
} from "./models";

type AdapterOptions = {
  reservation?: RestaurantReservation | null;
  isSaved?: boolean;
  image?: ApprovedRestaurantImage | null;
  surface?: ReservationSurface;
};

function formatLocation(restaurant: Restaurant): string {
  return `${restaurant.city}, ${restaurant.stateCode}`;
}

function baseModel(
  restaurant: Restaurant,
  options: AdapterOptions = {},
): RestaurantCardModel {
  const surface = options.surface ?? "explore_grid";
  const reservation = getRestaurantReservationAction(
    restaurant,
    options.reservation ?? null,
  );
  const cuisine = restaurant.cuisine?.trim() || undefined;
  const price = restaurant.price?.trim() || undefined;
  const image = options.image?.url?.trim()
    ? {
        url: options.image.url.trim(),
        alt: options.image.alt,
        objectPosition: options.image.objectPosition,
      }
    : undefined;

  return {
    id: restaurant.slug,
    slug: restaurant.slug,
    name: restaurant.name,
    distinction: restaurant.stars,
    cuisine,
    location: formatLocation(restaurant),
    price,
    image,
    reservation,
    isSaved: Boolean(options.isSaved),
    surface,
  };
}

export function toRestaurantDiscoveryCardModel(
  restaurant: Restaurant,
  options: AdapterOptions = {},
): RestaurantCardModel {
  return baseModel(restaurant, {
    ...options,
    surface: options.surface ?? "explore_grid",
  });
}

export function toRestaurantEditorialCardModel(
  restaurant: Restaurant,
  options: AdapterOptions & { eyebrow?: string } = {},
): RestaurantEditorialCardModel {
  return {
    ...baseModel(restaurant, {
      ...options,
      surface: options.surface ?? "homepage",
    }),
    eyebrow: options.eyebrow,
  };
}

export function toRestaurantListRowModel(
  restaurant: Restaurant,
  options: AdapterOptions = {},
): RestaurantCardModel {
  return baseModel(restaurant, {
    ...options,
    surface: options.surface ?? "explore_list",
  });
}

export function toRestaurantMapRowModel(
  restaurant: Restaurant,
  options: AdapterOptions & { selected?: boolean } = {},
): RestaurantMapRowModel {
  return {
    ...baseModel(restaurant, {
      ...options,
      surface: options.surface ?? "map_list",
    }),
    selected: Boolean(options.selected),
  };
}

export function toRelatedRestaurantCardModel(
  restaurant: Restaurant,
  options: AdapterOptions = {},
): RestaurantCardModel {
  return baseModel(restaurant, {
    ...options,
    surface: options.surface ?? "related_restaurant",
  });
}

export function toNearbyRestaurantRowModel(
  restaurant: Restaurant,
  options: AdapterOptions & { distanceLabel?: string } = {},
): RestaurantNearbyRowModel {
  return {
    ...baseModel(restaurant, {
      ...options,
      surface: options.surface ?? "related_restaurant",
    }),
    distanceLabel: options.distanceLabel,
  };
}
