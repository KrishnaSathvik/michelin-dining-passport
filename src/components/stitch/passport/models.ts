import type { ResolvedReservationAction } from "@/components/stitch/restaurant/models";
import type { LocalCollection, UserRestaurantRecord } from "@/lib/passport/types";
import type { ReservationSurface } from "@/lib/reservations/types";

export type PassportListMode = "saved" | "planned" | "visited";

export type PassportSortOption =
  | "date-saved-newest"
  | "date-saved-oldest"
  | "name-asc"
  | "name-desc"
  | "planned-upcoming"
  | "planned-furthest"
  | "visit-newest"
  | "visit-oldest";

export type PassportViewMode = "grid" | "list";

export type JourneySummaryMetric = {
  key: "visited" | "toVisit" | "favorites";
  label: string;
  value: number;
  description: string;
  href: string | null;
};

export type StarProgressRow = {
  stars: 1 | 2 | 3;
  label: string;
  visited: number;
  total: number;
};

export type StarsCollectedModel = {
  totalStars: number;
  rows: StarProgressRow[];
};

export type StatesExploredModel = {
  explored: number;
  total: number;
  stateLabels: string[];
};

export type CollectionPreviewModel = {
  id: string;
  slug: string;
  name: string;
  description: string;
  restaurantCount: number;
  visitedCount: number;
  href: string;
  cover: {
    name: string;
    seed: string;
    city?: string;
    stars?: 1 | 2 | 3;
    imageUrl?: string | null;
  } | null;
};

export type PassportSyncState = {
  mode: "local" | "cloud";
  migrationMessage: string | null;
  hasSyncError: boolean;
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
  summary: JourneySummaryMetric[];
  stars: StarsCollectedModel;
  states: StatesExploredModel;
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

export type SavedRestaurantCardModel = {
  slug: string;
  name: string;
  distinction: 1 | 2 | 3;
  cuisine?: string;
  location: string;
  price?: string;
  imageUrl?: string | null;
  savedAtLabel: string | null;
  isSaved: boolean;
  reservation: ResolvedReservationAction;
  surface: ReservationSurface;
  record: UserRestaurantRecord;
};

export type PlannedRestaurantRowModel = {
  slug: string;
  name: string;
  distinction: 1 | 2 | 3;
  cuisine?: string;
  location: string;
  imageUrl?: string | null;
  plannedDateLabel: string | null;
  plannedDateIso: string | null;
  reservationProvider: string | null;
  hasConfirmationNote: boolean;
  hasPlanningNote: boolean;
  alsoVisited: boolean;
  reservation: ResolvedReservationAction;
  surface: ReservationSurface;
  record: UserRestaurantRecord;
};

export type VisitedRestaurantCardModel = {
  slug: string;
  name: string;
  distinction: 1 | 2 | 3;
  cuisine?: string;
  location: string;
  imageUrl?: string | null;
  visitDateLabel: string | null;
  visitDateIso: string | null;
  favoriteDishes: string[];
  notesPreview: string | null;
  isFavorite: boolean;
  reservation: ResolvedReservationAction;
  surface: ReservationSurface;
  record: UserRestaurantRecord;
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

export type { LocalCollection, UserRestaurantRecord };
