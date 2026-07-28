import type { LocalCollection } from "@/lib/passport/types";
import type {
  RestaurantPlan,
  RestaurantVisit,
} from "@/lib/passport/types";
export type PassportListMode = "saved" | "planned" | "visited";

export type JourneySummaryMetric = {
  key: "saved" | "planned" | "visits" | "cities";
  label: string;
  value: number;
  description: string;
  href: string | null;
};

export type CollectionPreviewModel = {
  id: string;
  slug: string;
  name: string;
  description: string;
  restaurantCount: number;
  visitedCount: number;
  href: string;
  covers: Array<{
    name: string;
    seed: string;
    city?: string;
    stars?: 1 | 2 | 3;
    imageUrl?: string | null;
    placeId?: string | null;
  }>;
};

export type PassportSyncState = {
  mode: "local" | "cloud";
  migrationMessage: string | null;
  hasSyncError: boolean;
  status?: "idle" | "pending" | "failed";
  message?: string | null;
  storageError?: boolean;
};

export type PassportHeroModel = {
  eyebrow: string;
  title: string;
  supporting: string;
  exploreHref: string;
  mapHref: string;
};

export type PassportActiveModel = {
  hero: PassportHeroModel;
  featuredPlan: PassportPlanModel | null;
  recentVisits: PassportVisitModel[];
  savedRestaurants: PassportSavedRestaurantModel[];
  summary: JourneySummaryMetric[];
  collections: CollectionPreviewModel[];
  sync: PassportSyncState;
};

export type PassportEmptyModel = {
  title: string;
  supporting: string;
  exploreHref: string;
  mapHref: string;
  sync: PassportSyncState;
};

export type PassportPlanModel = {
  plan: RestaurantPlan;
  status: "upcoming" | "needs-update" | "past" | "undated";
  slug: string;
  name: string;
  distinction: 1 | 2 | 3;
  cuisine?: string;
  location: string;
  dateLabel: string;
  timeLabel: string | null;
  imageUrl?: string | null;
  placeId?: string | null;
  alsoVisited: boolean;
};

export type PassportVisitModel = {
  visit: RestaurantVisit;
  slug: string;
  name: string;
  distinction: 1 | 2 | 3;
  cuisine?: string;
  location: string;
  dateLabel: string;
  imageUrl?: string | null;
  placeId?: string | null;
  favoriteDishesPreview: string | null;
  wouldReturn: boolean | null;
  personalFavorite: boolean;
};

export type PassportSavedRestaurantModel = {
  slug: string;
  name: string;
  distinction: 1 | 2 | 3;
  cuisine?: string;
  location: string;
  price?: string;
  imageUrl?: string | null;
  placeId?: string | null;
};

export type PassportListPageModel = {
  mode: PassportListMode;
  title: string;
  subtitle: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
  resultCount: number;
  emptyTitle: string;
  emptyBody: string;
  emptyLinks: Array<{ label: string; href: string }>;
};

export type CatalogDenominators = {
  oneStar: number;
  twoStar: number;
  threeStar: number;
  states: number;
};

export type { LocalCollection };
