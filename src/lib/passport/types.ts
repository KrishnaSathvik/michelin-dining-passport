export const PASSPORT_STORAGE_KEY = "mdp-passport";
export const PASSPORT_SCHEMA_VERSION = 2 as const;

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

export type PassportStore = PassportStoreV2;

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
