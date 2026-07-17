import { getRestaurantReservationAction } from "@/lib/reservations/resolve";
import type { Restaurant } from "@/lib/data/types";
import type { PassportStore, UserRestaurantRecord } from "@/lib/passport/types";
import type { RestaurantReservation } from "@/lib/reservations/types";
import {
  buildCollectionPreviews,
  buildJourneySummary,
  buildStarsCollected,
  buildStatesExplored,
  buildSupportingCopy,
  hasPassportActivity,
  isPlannedRecord,
  isSavedRecord,
  isVisitedRecord,
} from "./metrics";
import type {
  CatalogDenominators,
  PassportActiveModel,
  PassportEmptyModel,
  PassportListPageModel,
  PassportSyncState,
  PlannedRestaurantRowModel,
  SavedRestaurantCardModel,
  VisitedRestaurantCardModel,
} from "./models";

function formatLocation(restaurant: Restaurant): string {
  return `${restaurant.city}, ${restaurant.stateCode}`;
}

function formatDisplayDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(
    iso.includes("T") ? iso : `${iso}T12:00:00`,
  );
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function truncateNote(value: string, max = 140): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export function toSyncState(input: {
  mode: "local" | "cloud";
  migrationMessage: string | null;
  migrationCompleted: boolean;
}): PassportSyncState {
  return {
    mode: input.mode,
    migrationMessage: input.migrationMessage,
    hasSyncError:
      input.mode === "cloud" &&
      Boolean(input.migrationMessage) &&
      !input.migrationCompleted,
  };
}

export function toPassportActiveModel(input: {
  store: PassportStore;
  restaurants: readonly Restaurant[];
  denominators: CatalogDenominators;
  sync: PassportSyncState;
}): PassportActiveModel {
  return {
    hero: {
      eyebrow: "My Passport",
      title: "Your dining journey",
      supporting: buildSupportingCopy(input.store, input.restaurants),
      exploreHref: "/explore",
      mapHref: "/map?visited=1",
    },
    summary: buildJourneySummary(input.store),
    stars: buildStarsCollected(
      input.store,
      input.restaurants,
      input.denominators,
    ),
    states: buildStatesExplored(
      input.store,
      input.restaurants,
      input.denominators.states,
    ),
    collections: buildCollectionPreviews(input.store, input.restaurants, 3),
    sync: input.sync,
  };
}

export function toPassportEmptyModel(sync: PassportSyncState): PassportEmptyModel {
  return {
    title: "Your dining journey starts with one table.",
    supporting:
      "Save restaurants you want to try, plan future visits, record meals you have enjoyed, and build private collections. Your passport stays personal — on this device until you sign in.",
    exploreHref: "/explore",
    mapHref: "/map",
    sync,
  };
}

export function toSavedCardModel(
  restaurant: Restaurant,
  record: UserRestaurantRecord,
  reservation: RestaurantReservation | null = null,
): SavedRestaurantCardModel {
  return {
    slug: restaurant.slug,
    name: restaurant.name,
    distinction: restaurant.stars,
    cuisine: restaurant.cuisine?.trim() || undefined,
    location: formatLocation(restaurant),
    price: restaurant.price?.trim() || undefined,
    imageUrl: null,
    savedAtLabel: formatDisplayDate(record.createdAt.slice(0, 10)),
    isSaved: record.saved,
    reservation: getRestaurantReservationAction(restaurant, reservation),
    surface: "saved",
    record,
  };
}

export function toPlannedRowModel(
  restaurant: Restaurant,
  record: UserRestaurantRecord,
  reservation: RestaurantReservation | null = null,
): PlannedRestaurantRowModel {
  return {
    slug: restaurant.slug,
    name: restaurant.name,
    distinction: restaurant.stars,
    cuisine: restaurant.cuisine?.trim() || undefined,
    location: formatLocation(restaurant),
    imageUrl: null,
    plannedDateLabel: formatDisplayDate(record.reservationPlannedFor),
    plannedDateIso: record.reservationPlannedFor,
    reservationProvider: record.reservationProvider,
    hasConfirmationNote: Boolean(record.reservationConfirmationNote?.trim()),
    hasPlanningNote: Boolean(record.reservationConfirmationNote?.trim()),
    alsoVisited: record.visited,
    reservation: getRestaurantReservationAction(restaurant, reservation),
    surface: "planned",
    record,
  };
}

export function toVisitedCardModel(
  restaurant: Restaurant,
  record: UserRestaurantRecord,
  reservation: RestaurantReservation | null = null,
): VisitedRestaurantCardModel {
  return {
    slug: restaurant.slug,
    name: restaurant.name,
    distinction: restaurant.stars,
    cuisine: restaurant.cuisine?.trim() || undefined,
    location: formatLocation(restaurant),
    imageUrl: null,
    visitDateLabel: formatDisplayDate(record.visitDate),
    visitDateIso: record.visitDate,
    favoriteDishes: record.favoriteDishes.filter(Boolean),
    notesPreview: truncateNote(record.notes),
    isFavorite: record.favorite,
    reservation: getRestaurantReservationAction(restaurant, reservation),
    surface: "visited",
    record,
  };
}

export function listSavedCards(
  store: PassportStore,
  restaurants: readonly Restaurant[],
): SavedRestaurantCardModel[] {
  const bySlug = new Map(
    restaurants.map((restaurant) => [restaurant.slug, restaurant]),
  );
  return Object.values(store.userRestaurants)
    .filter(isSavedRecord)
    .flatMap((record) => {
      const restaurant = bySlug.get(record.restaurantSlug);
      if (!restaurant) return [];
      return [toSavedCardModel(restaurant, record)];
    });
}

export function listPlannedRows(
  store: PassportStore,
  restaurants: readonly Restaurant[],
): PlannedRestaurantRowModel[] {
  const bySlug = new Map(
    restaurants.map((restaurant) => [restaurant.slug, restaurant]),
  );
  return Object.values(store.userRestaurants)
    .filter(isPlannedRecord)
    .flatMap((record) => {
      const restaurant = bySlug.get(record.restaurantSlug);
      if (!restaurant) return [];
      return [toPlannedRowModel(restaurant, record)];
    });
}

export function listVisitedCards(
  store: PassportStore,
  restaurants: readonly Restaurant[],
): VisitedRestaurantCardModel[] {
  const bySlug = new Map(
    restaurants.map((restaurant) => [restaurant.slug, restaurant]),
  );
  return Object.values(store.userRestaurants)
    .filter(isVisitedRecord)
    .flatMap((record) => {
      const restaurant = bySlug.get(record.restaurantSlug);
      if (!restaurant) return [];
      return [toVisitedCardModel(restaurant, record)];
    });
}

export function countStaleRecords(
  store: PassportStore,
  restaurants: readonly Restaurant[],
): number {
  const known = new Set(restaurants.map((restaurant) => restaurant.slug));
  return Object.values(store.userRestaurants).filter(
    (record) => !known.has(record.restaurantSlug),
  ).length;
}

export function toListPageModel(
  mode: "saved" | "planned" | "visited",
): PassportListPageModel {
  switch (mode) {
    case "saved":
      return {
        mode,
        title: "Saved Restaurants",
        subtitle: "Keep track of the tables you're dreaming of.",
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: "Passport", href: "/passport" },
          { label: "Saved" },
        ],
        resultCount: 0,
        emptyTitle: "No saved restaurants yet",
        emptyBody:
          "Open Explore or Map and save a restaurant to start your shortlist.",
        emptyLinks: [
          { label: "Explore restaurants", href: "/explore" },
          { label: "Open map", href: "/map" },
        ],
      };
    case "planned":
      return {
        mode,
        title: "Planned Visits",
        subtitle: "Upcoming Michelin meals you have scheduled.",
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: "Passport", href: "/passport" },
          { label: "Planned" },
        ],
        resultCount: 0,
        emptyTitle: "No planned visits yet",
        emptyBody:
          "Move a saved restaurant to Planned, or mark Planned from any restaurant detail page.",
        emptyLinks: [
          { label: "View saved", href: "/saved" },
          { label: "Explore restaurants", href: "/explore" },
          { label: "Open map", href: "/map" },
        ],
      };
    case "visited":
      return {
        mode,
        title: "Visited",
        subtitle: "Your dining history",
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: "Passport", href: "/passport" },
          { label: "Visited" },
        ],
        resultCount: 0,
        emptyTitle: "No visits logged yet",
        emptyBody:
          "Mark a restaurant as visited from its detail page to build your dining history.",
        emptyLinks: [
          { label: "Explore restaurants", href: "/explore" },
          { label: "View planned visits", href: "/planned" },
          { label: "Open map", href: "/map" },
        ],
      };
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

export { hasPassportActivity };
