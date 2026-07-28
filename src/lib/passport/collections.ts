import type { Restaurant } from "../data/types";
import { classifyPlan } from "./journey";
import { toPersonalIdentity } from "./personal-lists";
import type { PersonalRestaurantIdentity } from "./personal-lists";
import type {
  LocalCollection,
  PassportStore,
  PlanStatus,
  RestaurantPlan,
  RestaurantVisit,
} from "./types";

/** Number of member images shown in a collection card mosaic. */
export const COLLECTION_THUMBNAIL_LIMIT = 4;

export type CollectionThumbnail = {
  slug: string;
  name: string;
  location: string;
  distinction: 1 | 2 | 3;
  imageUrl: string | null;
};

export type CollectionSummary = {
  id: string;
  slug: string;
  name: string;
  description: string;
  href: string;
  /** Members that resolve to a catalog restaurant. */
  restaurantCount: number;
  /** Membership slugs no longer present in the catalog. */
  missingCount: number;
  createdAt: string;
  updatedAt: string;
  /** Null when the stored timestamp is not trustworthy enough to show. */
  updatedLabel: string | null;
  thumbnails: CollectionThumbnail[];
};

export type CollectionRestaurantItem = PersonalRestaurantIdentity & {
  position: number;
  plan: RestaurantPlan | null;
  planStatus: PlanStatus | null;
  visitCount: number;
  latestVisit: RestaurantVisit | null;
  personalFavorite: boolean;
};

export type CollectionDetail = CollectionSummary & {
  collection: LocalCollection;
  items: CollectionRestaurantItem[];
};

export type AddRestaurantCandidate = PersonalRestaurantIdentity & {
  alreadyInCollection: boolean;
};

function catalogMap(
  restaurants: readonly Restaurant[],
): Map<string, Restaurant> {
  return new Map(restaurants.map((restaurant) => [restaurant.slug, restaurant]));
}

function uniqueSlugs(slugs: readonly string[]): string[] {
  return [...new Set(slugs)];
}

function latestPlanFor(
  store: PassportStore,
  slug: string,
): RestaurantPlan | null {
  return (
    Object.values(store.plans)
      .filter((plan) => plan.restaurantSlug === slug)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null
  );
}

function visitsFor(store: PassportStore, slug: string): RestaurantVisit[] {
  return Object.values(store.visits)
    .filter((visit) => visit.restaurantSlug === slug)
    .sort(
      (a, b) =>
        (b.visitDate ?? "").localeCompare(a.visitDate ?? "") ||
        b.createdAt.localeCompare(a.createdAt),
    );
}

/**
 * A stored `updatedAt` is only shown when it parses and is not in the future.
 * Future stamps mean a skewed device clock or a bad import — showing
 * "Updated in 3 days" would be worse than showing nothing.
 */
export function formatCollectionUpdatedLabel(
  iso: string,
  now: number = Date.now(),
): string | null {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return null;
  const elapsed = now - parsed;
  if (elapsed < -60_000) return null;

  const day = 86_400_000;
  if (elapsed < day) return "Updated today";
  if (elapsed < 2 * day) return "Updated yesterday";
  if (elapsed < 7 * day) {
    return `Updated ${Math.floor(elapsed / day)} days ago`;
  }
  return `Updated ${new Date(parsed).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

function buildThumbnails(
  collection: LocalCollection,
  catalog: Map<string, Restaurant>,
): CollectionThumbnail[] {
  const ordered = uniqueSlugs([
    ...(collection.coverRestaurantSlug ? [collection.coverRestaurantSlug] : []),
    ...collection.restaurantSlugs,
  ]);

  const thumbnails: CollectionThumbnail[] = [];
  for (const slug of ordered) {
    if (thumbnails.length >= COLLECTION_THUMBNAIL_LIMIT) break;
    const restaurant = catalog.get(slug);
    if (!restaurant) continue;
    thumbnails.push({
      slug: restaurant.slug,
      name: restaurant.name,
      location: `${restaurant.city}, ${restaurant.stateCode}`,
      distinction: restaurant.stars,
      imageUrl: null,
    });
  }
  return thumbnails;
}

export function toCollectionSummary(
  collection: LocalCollection,
  restaurants: readonly Restaurant[],
  now?: number,
): CollectionSummary {
  const catalog = catalogMap(restaurants);
  const members = uniqueSlugs(collection.restaurantSlugs);
  const resolved = members.filter((slug) => catalog.has(slug));

  return {
    id: collection.id,
    slug: collection.slug,
    name: collection.name,
    description: collection.description,
    href: `/collections/${collection.slug}`,
    restaurantCount: resolved.length,
    missingCount: members.length - resolved.length,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
    updatedLabel: formatCollectionUpdatedLabel(collection.updatedAt, now),
    thumbnails: buildThumbnails(collection, catalog),
  };
}

/** Most recently updated first; name breaks ties so ordering stays stable. */
export function buildCollectionsIndex(
  store: PassportStore,
  restaurants: readonly Restaurant[],
  now?: number,
): CollectionSummary[] {
  return Object.values(store.collections)
    .map((collection) => toCollectionSummary(collection, restaurants, now))
    .sort(
      (a, b) =>
        b.updatedAt.localeCompare(a.updatedAt) || a.name.localeCompare(b.name),
    );
}

export function buildCollectionDetail(
  store: PassportStore,
  restaurants: readonly Restaurant[],
  collection: LocalCollection,
  today = new Date().toISOString().slice(0, 10),
  now?: number,
): CollectionDetail {
  const catalog = catalogMap(restaurants);
  const items = uniqueSlugs(collection.restaurantSlugs).flatMap(
    (slug, index) => {
      const restaurant = catalog.get(slug);
      if (!restaurant) return [];
      const plan = latestPlanFor(store, slug);
      const visits = visitsFor(store, slug);
      return [
        {
          ...toPersonalIdentity(restaurant),
          position: index,
          plan,
          planStatus: plan ? classifyPlan(plan.plannedDate, today) : null,
          visitCount: visits.length,
          latestVisit: visits[0] ?? null,
          personalFavorite: visits.some((visit) => visit.personalFavorite),
        } satisfies CollectionRestaurantItem,
      ];
    },
  );

  return {
    ...toCollectionSummary(collection, restaurants, now),
    collection,
    items,
  };
}

export function findCollectionBySlug(
  store: PassportStore,
  slug: string,
): LocalCollection | null {
  return (
    Object.values(store.collections).find(
      (collection) => collection.slug === slug,
    ) ?? null
  );
}

function matchesCandidateQuery(
  identity: PersonalRestaurantIdentity,
  query: string,
): boolean {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return true;
  return [
    identity.name,
    identity.city,
    identity.state,
    identity.stateCode,
    identity.cuisine ?? "",
  ]
    .join(" ")
    .toLocaleLowerCase()
    .includes(normalized);
}

/**
 * Add-restaurant search is scoped to Saved bookmarks on purpose: the whole
 * discovery catalog is not shipped to the client for this interaction. Members
 * are returned too, flagged, so the dialog can show they are already in.
 */
export function buildAddRestaurantCandidates(
  store: PassportStore,
  restaurants: readonly Restaurant[],
  collection: LocalCollection,
  query = "",
): AddRestaurantCandidate[] {
  const catalog = catalogMap(restaurants);
  const members = new Set(collection.restaurantSlugs);

  return Object.values(store.bookmarks)
    .flatMap((bookmark) => {
      const restaurant = catalog.get(bookmark.restaurantSlug);
      if (!restaurant) return [];
      const identity = toPersonalIdentity(restaurant);
      if (!matchesCandidateQuery(identity, query)) return [];
      return [
        {
          ...identity,
          alreadyInCollection: members.has(bookmark.restaurantSlug),
        } satisfies AddRestaurantCandidate,
      ];
    })
    .sort(
      (a, b) =>
        Number(a.alreadyInCollection) - Number(b.alreadyInCollection) ||
        a.name.localeCompare(b.name),
    );
}

export function countCollectionsContaining(
  store: PassportStore,
  restaurantSlug: string,
): number {
  return Object.values(store.collections).filter((collection) =>
    collection.restaurantSlugs.includes(restaurantSlug),
  ).length;
}
