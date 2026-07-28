export const PASSPORT_STORAGE_KEY = "mdp-passport";
export const PASSPORT_SCHEMA_VERSION = 3 as const;

export type {
  PassportBookmark,
  RestaurantPlan,
  RestaurantVisit,
  RestaurantJourneyState,
  PlanStatus,
} from "./journey";
import type {
  PassportBookmark,
  RestaurantPlan,
  RestaurantVisit,
} from "./journey";

export type UserRestaurantRecord = {
  restaurantSlug: string;
  saved: boolean;
  wantToVisit: boolean;
  planned: boolean;
  visited: boolean;
  favorite: boolean;
  /** ISO date string `YYYY-MM-DD`, or null */
  visitDate: string | null;
  /** Personal 1–5 rating; null when unset */
  personalRating: number | null;
  notes: string;
  favoriteDishes: string[];
  /** Optional planned reservation date `YYYY-MM-DD` */
  reservationPlannedFor: string | null;
  /** Optional booking provider label recorded by the user */
  reservationProvider: string | null;
  /** Short private confirmation note — never logged to analytics */
  reservationConfirmationNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LocalCollection = {
  id: string;
  slug: string;
  name: string;
  description: string;
  private: boolean;
  coverRestaurantSlug: string | null;
  restaurantSlugs: string[];
  createdAt: string;
  updatedAt: string;
};

export type PassportStoreV1 = {
  version: 1;
  userRestaurants: Record<string, UserRestaurantRecord>;
  collections: Record<string, LocalCollection>;
};

export type PassportStoreV2 = {
  version: 2;
  userRestaurants: Record<string, UserRestaurantRecord>;
  collections: Record<string, LocalCollection>;
};

/**
 * V3 keeps `userRestaurants` as a temporary compatibility projection for
 * routes that have not moved to journey commands yet. New Passport work reads
 * and writes the normalized record collections.
 */
export type PassportStoreV3 = {
  version: 3;
  bookmarks: Record<string, PassportBookmark>;
  plans: Record<string, RestaurantPlan>;
  visits: Record<string, RestaurantVisit>;
  userRestaurants: Record<string, UserRestaurantRecord>;
  collections: Record<string, LocalCollection>;
};

export type PassportStore = PassportStoreV3;

export type PassportMetrics = {
  restaurantsVisited: number;
  starsExperienced: number;
  statesExplored: number;
  citiesExplored: number;
  cuisinesTried: number;
  threeStarVisited: number;
  savedRestaurants: number;
  visitsByYear: Array<{ year: number; count: number }>;
};
