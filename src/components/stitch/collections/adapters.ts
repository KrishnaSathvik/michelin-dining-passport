import { getRestaurantReservation } from "@/lib/reservations/data";
import { getRestaurantReservationAction } from "@/lib/reservations/resolve";
import type { Restaurant } from "@/lib/data/types";
import type { LocalCollection, PassportStore } from "@/lib/passport/types";
import {
  buildCollectionCover,
  buildCollectionProgress,
  resolveMembers,
  selectFeaturedCollection,
  toCollectionCardModel,
  uniqueMemberSlugs,
} from "./metrics";
import type {
  AddRestaurantOption,
  CollectionDetailModel,
  CollectionRestaurantRowModel,
  CollectionsIndexModel,
  CollectionsSyncState,
} from "./models";

export function toCollectionsSyncState(input: {
  mode: "local" | "cloud";
  migrationMessage: string | null;
  migrationCompleted: boolean;
}): CollectionsSyncState {
  return {
    mode: input.mode,
    migrationMessage: input.migrationMessage,
    hasSyncError:
      input.mode === "cloud" &&
      Boolean(input.migrationMessage) &&
      !input.migrationCompleted,
  };
}

export function toCollectionsIndexModel(input: {
  store: PassportStore;
  restaurants: readonly Restaurant[];
  sync: CollectionsSyncState;
}): CollectionsIndexModel {
  const collections = Object.values(input.store.collections).map((collection) =>
    toCollectionCardModel(collection, input.store, input.restaurants),
  );
  const featuredSource = selectFeaturedCollection(
    Object.values(input.store.collections),
  );
  const featured = featuredSource
    ? (collections.find((item) => item.id === featuredSource.id) ?? null)
    : null;
  const grid = featured
    ? collections.filter((item) => item.id !== featured.id)
    : collections;

  return {
    collections,
    featured,
    grid,
    sync: input.sync,
  };
}

function journeyFlags(
  store: PassportStore,
  slug: string,
): {
  visited: boolean;
  planned: boolean;
  saved: boolean;
  favorite: boolean;
} {
  const record = store.userRestaurants[slug];
  return {
    visited: record?.visited === true,
    planned: record?.planned === true,
    saved: record?.saved === true,
    favorite: record?.favorite === true,
  };
}

export function toCollectionRestaurantRowModel(
  restaurant: Restaurant,
  store: PassportStore,
): CollectionRestaurantRowModel {
  const flags = journeyFlags(store, restaurant.slug);
  const reservation = getRestaurantReservation(restaurant.slug);
  return {
    slug: restaurant.slug,
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    location: `${restaurant.city}, ${restaurant.stateCode}`,
    price: restaurant.price,
    distinction: restaurant.stars,
    imageUrl: null,
    visited: flags.visited,
    planned: flags.planned,
    saved: flags.saved,
    favorite: flags.favorite,
    reservation: getRestaurantReservationAction(restaurant, reservation),
    surface: "collection",
    record: store.userRestaurants[restaurant.slug],
  };
}

export function toCollectionDetailModel(input: {
  collection: LocalCollection;
  store: PassportStore;
  restaurants: readonly Restaurant[];
  sync: CollectionsSyncState;
}): CollectionDetailModel {
  const { members } = resolveMembers(input.collection, input.restaurants);

  return {
    collection: input.collection,
    name: input.collection.name,
    description: input.collection.description,
    href: `/collections/${input.collection.slug}`,
    cover: buildCollectionCover(input.collection, input.restaurants),
    progress: buildCollectionProgress(
      input.collection,
      input.store,
      input.restaurants,
    ),
    members: members.map((restaurant) =>
      toCollectionRestaurantRowModel(restaurant, input.store),
    ),
    breadcrumbs: [
      { name: "Passport", path: "/passport" },
      { name: "Collections", path: "/collections" },
      {
        name: input.collection.name,
        path: `/collections/${input.collection.slug}`,
      },
    ],
    sync: input.sync,
  };
}

export function toAddRestaurantOptions(input: {
  collection: LocalCollection;
  restaurants: readonly Restaurant[];
  query: string;
}): AddRestaurantOption[] {
  const memberSet = new Set(uniqueMemberSlugs(input.collection.restaurantSlugs));
  const normalized = input.query.trim().toLowerCase();

  return input.restaurants
    .map((restaurant) => ({
      slug: restaurant.slug,
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      location: `${restaurant.city}, ${restaurant.stateCode}`,
      distinction: restaurant.stars,
      alreadyMember: memberSet.has(restaurant.slug),
    }))
    .filter((option) => !option.alreadyMember)
    .filter((option) => {
      if (!normalized) return true;
      return (
        option.name.toLowerCase().includes(normalized) ||
        option.cuisine.toLowerCase().includes(normalized) ||
        option.location.toLowerCase().includes(normalized)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 40);
}

export { selectFeaturedCollection, uniqueMemberSlugs, resolveMembers };
