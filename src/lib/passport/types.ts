export const PASSPORT_STORAGE_KEY = "mdp-passport";
export const PASSPORT_SCHEMA_VERSION = 1 as const;

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

export type PassportStore = PassportStoreV1;

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
