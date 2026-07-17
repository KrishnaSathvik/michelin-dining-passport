import type { Restaurant } from "@/lib/data/types";
import type {
  LocalCollection,
  UserRestaurantRecord,
} from "@/lib/passport/types";
import type { ResolvedReservationAction } from "@/components/stitch/restaurant";

export type CollectionCoverModel = {
  kind: "restaurant" | "fallback";
  name: string;
  seed: string;
  city?: string;
  stars?: 1 | 2 | 3;
  imageUrl: string | null;
};

export type CollectionCardModel = {
  id: string;
  slug: string;
  name: string;
  description: string;
  href: string;
  restaurantCount: number;
  visitedCount: number;
  updatedAt: string;
  updatedLabel: string | null;
  cover: CollectionCoverModel;
};

export type CollectionProgressModel = {
  totalMembers: number;
  visitedMembers: number;
  remainingMembers: number;
  percent: number;
  starsInCollection: number;
  statesRepresented: number;
  stateLabels: string[];
  staleMemberCount: number;
};

export type CollectionRestaurantRowModel = {
  slug: string;
  name: string;
  cuisine: string;
  location: string;
  price: string;
  distinction: 1 | 2 | 3;
  imageUrl: string | null;
  visited: boolean;
  planned: boolean;
  saved: boolean;
  favorite: boolean;
  reservation: ResolvedReservationAction;
  surface: "collection";
  record: UserRestaurantRecord | undefined;
};

export type CollectionsSyncState = {
  mode: "local" | "cloud";
  migrationMessage: string | null;
  hasSyncError: boolean;
};

export type CollectionsIndexModel = {
  collections: CollectionCardModel[];
  featured: CollectionCardModel | null;
  grid: CollectionCardModel[];
  sync: CollectionsSyncState;
};

export type CollectionDetailModel = {
  collection: LocalCollection;
  name: string;
  description: string;
  href: string;
  cover: CollectionCoverModel;
  progress: CollectionProgressModel;
  members: CollectionRestaurantRowModel[];
  breadcrumbs: Array<{ name: string; path: string }>;
  sync: CollectionsSyncState;
};

export type CollectionSortId =
  | "updated-desc"
  | "name-asc"
  | "name-desc"
  | "count-desc"
  | "count-asc";

export type CollectionSortOption = {
  id: CollectionSortId;
  label: string;
};

export const COLLECTION_SORT_OPTIONS: CollectionSortOption[] = [
  { id: "updated-desc", label: "Recently updated" },
  { id: "name-asc", label: "Name A–Z" },
  { id: "name-desc", label: "Name Z–A" },
  { id: "count-desc", label: "Most restaurants" },
  { id: "count-asc", label: "Fewest restaurants" },
];

/** Roster restaurant for Add Restaurants dialog. */
export type AddRestaurantOption = {
  slug: string;
  name: string;
  cuisine: string;
  location: string;
  distinction: 1 | 2 | 3;
  alreadyMember: boolean;
};

export type RestaurantLookup = Map<string, Restaurant>;
