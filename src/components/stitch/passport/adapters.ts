import type { Restaurant } from "@/lib/data/types";
import { getApprovedGooglePlaceId } from "@/lib/google-places/place-ids";
import type { PassportStore } from "@/lib/passport/types";
import { classifyPlan } from "@/lib/passport/journey";
import {
  buildCollectionPreviews,
  buildJourneySummary,
  buildSupportingCopy,
  hasPassportActivity,
} from "./metrics";
import type {
  CatalogDenominators,
  PassportActiveModel,
  PassportEmptyModel,
  PassportListPageModel,
  PassportSyncState,
  PassportPlanModel,
  PassportSavedRestaurantModel,
  PassportVisitModel,
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

export function toSyncState(input: {
  mode: "local" | "cloud";
  migrationMessage: string | null;
  migrationCompleted: boolean;
  status?: "idle" | "pending" | "failed";
  message?: string | null;
  storageError?: boolean;
}): PassportSyncState {
  return {
    mode: input.mode,
    migrationMessage: input.migrationMessage,
    hasSyncError:
      input.mode === "cloud" &&
      Boolean(input.migrationMessage) &&
      !input.migrationCompleted,
    status: input.status ?? "idle",
    message: input.message ?? null,
    storageError: Boolean(input.storageError),
  };
}

function formatTime(value: string | null): string | null {
  if (!value) return null;
  const [hoursText, minutesText] = value.split(":");
  const hours = Number(hoursText);
  const minutes = Number(minutesText);
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return value;
  }
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function listDashboardPlans(
  store: PassportStore,
  restaurants: readonly Restaurant[],
  today: string,
): PassportPlanModel[] {
  const bySlug = new Map(
    restaurants.map((restaurant) => [restaurant.slug, restaurant]),
  );
  return Object.values(store.plans)
    .flatMap((plan) => {
      const restaurant = bySlug.get(plan.restaurantSlug);
      if (!restaurant) return [];
      const status = classifyPlan(plan.plannedDate, today);
      if (status === "past") return [];
      return [
        {
          plan,
          status,
          slug: restaurant.slug,
          name: restaurant.name,
          distinction: restaurant.stars,
          cuisine: restaurant.cuisine?.trim() || undefined,
          location: formatLocation(restaurant),
          dateLabel:
            formatDisplayDate(plan.plannedDate) ?? "Date not recorded",
          timeLabel: formatTime(plan.plannedTime),
          imageUrl: null,
          placeId: getApprovedGooglePlaceId(restaurant.slug),
          alsoVisited: Object.values(store.visits).some(
            (visit) => visit.restaurantSlug === restaurant.slug,
          ),
        } satisfies PassportPlanModel,
      ];
    })
    .sort((a, b) => {
      if (a.status === "needs-update" && b.status !== "needs-update") return -1;
      if (b.status === "needs-update" && a.status !== "needs-update") return 1;
      return (a.plan.plannedDate ?? "9999-12-31").localeCompare(
        b.plan.plannedDate ?? "9999-12-31",
      );
    });
}

function listDashboardVisits(
  store: PassportStore,
  restaurants: readonly Restaurant[],
): PassportVisitModel[] {
  const bySlug = new Map(
    restaurants.map((restaurant) => [restaurant.slug, restaurant]),
  );
  return Object.values(store.visits)
    .sort((a, b) => {
      const dateOrder = (b.visitDate ?? "").localeCompare(a.visitDate ?? "");
      return dateOrder || b.createdAt.localeCompare(a.createdAt);
    })
    .flatMap((visit) => {
      const restaurant = bySlug.get(visit.restaurantSlug);
      if (!restaurant) return [];
      const dishes = visit.favoriteDishes.trim();
      return [
        {
          visit,
          slug: restaurant.slug,
          name: restaurant.name,
          distinction: restaurant.stars,
          cuisine: restaurant.cuisine?.trim() || undefined,
          location: formatLocation(restaurant),
          dateLabel:
            formatDisplayDate(visit.visitDate) ?? "Date not recorded",
          imageUrl: null,
          placeId: getApprovedGooglePlaceId(restaurant.slug),
          favoriteDishesPreview: dishes
            ? dishes.length > 96
              ? `${dishes.slice(0, 95)}…`
              : dishes
            : null,
          wouldReturn: visit.wouldReturn,
          personalFavorite: visit.personalFavorite,
        } satisfies PassportVisitModel,
      ];
    });
}

function listDashboardSaved(
  store: PassportStore,
  restaurants: readonly Restaurant[],
): PassportSavedRestaurantModel[] {
  const bySlug = new Map(
    restaurants.map((restaurant) => [restaurant.slug, restaurant]),
  );
  return Object.values(store.bookmarks)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .flatMap((bookmark) => {
      const restaurant = bySlug.get(bookmark.restaurantSlug);
      if (!restaurant) return [];
      return [
        {
          slug: restaurant.slug,
          name: restaurant.name,
          distinction: restaurant.stars,
          cuisine: restaurant.cuisine?.trim() || undefined,
          location: formatLocation(restaurant),
          price: restaurant.price?.trim() || undefined,
          imageUrl: null,
          placeId: getApprovedGooglePlaceId(restaurant.slug),
        } satisfies PassportSavedRestaurantModel,
      ];
    });
}

export function toPassportActiveModel(input: {
  store: PassportStore;
  restaurants: readonly Restaurant[];
  denominators: CatalogDenominators;
  sync: PassportSyncState;
  today?: string;
}): PassportActiveModel {
  const today = input.today ?? new Date().toISOString().slice(0, 10);
  const plans = listDashboardPlans(input.store, input.restaurants, today);
  return {
    hero: {
      eyebrow: "My Restaurants",
      title: "Your dining journey",
      supporting: buildSupportingCopy(input.store, input.restaurants),
      exploreHref: "/explore",
      mapHref: "/map",
    },
    featuredPlan: plans[0] ?? null,
    recentVisits: listDashboardVisits(input.store, input.restaurants),
    savedRestaurants: listDashboardSaved(input.store, input.restaurants),
    summary: buildJourneySummary(input.store, input.restaurants, plans.length),
    collections: buildCollectionPreviews(input.store, input.restaurants, 3),
    sync: input.sync,
  };
}

export function toPassportEmptyModel(sync: PassportSyncState): PassportEmptyModel {
  return {
    title: "Your dining journey starts here",
    supporting:
      "Save restaurants that interest you, plan the meals ahead, and remember every visit in one private list.",
    exploreHref: "/explore",
    mapHref: "/map",
    sync,
  };
}

export function toListPageModel(
  mode: "saved" | "planned" | "visited",
): PassportListPageModel {
  switch (mode) {
    case "saved":
      return {
        mode,
        title: "Saved restaurants",
        subtitle:
          "Every restaurant bookmarked in My Restaurants, including tables you have planned or visited.",
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: "My Restaurants", href: "/passport" },
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
        title: "Planned meals",
        subtitle:
          "Upcoming dining plans and past dates that still need your attention.",
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: "My Restaurants", href: "/passport" },
          { label: "Planned" },
        ],
        resultCount: 0,
        emptyTitle: "No meals planned yet",
        emptyBody:
          "Choose Plan a visit from any restaurant profile when a table becomes part of your journey.",
        emptyLinks: [
          { label: "Explore restaurants", href: "/explore" },
          { label: "Open map", href: "/map" },
        ],
      };
    case "visited":
      return {
        mode,
        title: "Visited restaurants",
        subtitle:
          "A private history of meals you have recorded, grouped by restaurant.",
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: "My Restaurants", href: "/passport" },
          { label: "Visited" },
        ],
        resultCount: 0,
        emptyTitle: "No visits recorded yet",
        emptyBody:
          "Record a visit from a restaurant profile to begin your private dining history.",
        emptyLinks: [
          { label: "Explore restaurants", href: "/explore" },
          { label: "Open My Restaurants", href: "/passport" },
        ],
      };
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

export { hasPassportActivity };
