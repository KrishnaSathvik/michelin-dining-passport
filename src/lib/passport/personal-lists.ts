import type { Restaurant } from "../data/types";
import { getApprovedGooglePlaceId } from "@/lib/google-places/place-ids";
import type {
  PassportBookmark,
  PassportStore,
  RestaurantPlan,
  RestaurantVisit,
} from "./types";

export type PersonalRestaurantIdentity = {
  slug: string;
  name: string;
  distinction: 1 | 2 | 3;
  cuisine: string | null;
  city: string;
  state: string;
  stateCode: string;
  location: string;
  price: string | null;
  imageUrl: string | null;
  placeId: string | null;
};

export type SavedPersonalListItem = PersonalRestaurantIdentity & {
  bookmark: PassportBookmark;
  plan: RestaurantPlan | null;
  planStatus: "upcoming" | "needs-update" | "past" | "undated" | null;
  visitCount: number;
  latestVisit: RestaurantVisit | null;
  personalFavorite: boolean;
  collectionCount: number;
};

export type PlannedPersonalListItem = PersonalRestaurantIdentity & {
  plan: RestaurantPlan;
  status: "upcoming" | "needs-update" | "undated";
  visitCount: number;
};

export type PlannedPersonalList = {
  upcoming: PlannedPersonalListItem[];
  needsUpdate: PlannedPersonalListItem[];
};

export type VisitedPersonalListGroup = PersonalRestaurantIdentity & {
  visits: RestaurantVisit[];
  visitCount: number;
  latestVisit: RestaurantVisit | null;
  personalFavorite: boolean;
  wouldReturn: boolean | null;
  plan: RestaurantPlan | null;
};

export function toPersonalIdentity(
  restaurant: Restaurant,
): PersonalRestaurantIdentity {
  return {
    slug: restaurant.slug,
    name: restaurant.name,
    distinction: restaurant.stars,
    cuisine: restaurant.cuisine?.trim() || null,
    city: restaurant.city,
    state: restaurant.state,
    stateCode: restaurant.stateCode,
    location: `${restaurant.city}, ${restaurant.stateCode}`,
    price: restaurant.price?.trim() || null,
    imageUrl: null,
    placeId: getApprovedGooglePlaceId(restaurant.slug),
  };
}

function compareVisits(a: RestaurantVisit, b: RestaurantVisit): number {
  if (a.visitDate && b.visitDate) {
    return (
      b.visitDate.localeCompare(a.visitDate) ||
      b.createdAt.localeCompare(a.createdAt)
    );
  }
  if (a.visitDate) return -1;
  if (b.visitDate) return 1;
  return b.createdAt.localeCompare(a.createdAt);
}

function latestPlan(
  plans: readonly RestaurantPlan[],
): RestaurantPlan | null {
  return [...plans].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null;
}

function daysBetween(start: string, end: string): number {
  return Math.floor(
    (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) /
      86_400_000,
  );
}

function classifyListPlan(
  plannedDate: string | null,
  today: string,
): "upcoming" | "needs-update" | "past" | "undated" {
  if (!plannedDate) return "undated";
  if (plannedDate >= today) return "upcoming";
  return daysBetween(plannedDate, today) <= 30 ? "needs-update" : "past";
}

export function buildSavedPersonalList(
  store: PassportStore,
  restaurants: readonly Restaurant[],
  today = new Date().toISOString().slice(0, 10),
): SavedPersonalListItem[] {
  const catalog = new Map(
    restaurants.map((restaurant) => [restaurant.slug, restaurant]),
  );
  const plans = Object.values(store.plans);
  const visits = Object.values(store.visits);
  const collections = Object.values(store.collections);

  return Object.values(store.bookmarks)
    .flatMap((bookmark) => {
      const restaurant = catalog.get(bookmark.restaurantSlug);
      if (!restaurant) return [];
      const restaurantVisits = visits
        .filter((visit) => visit.restaurantSlug === bookmark.restaurantSlug)
        .sort(compareVisits);
      const plan = latestPlan(
        plans.filter(
          (item) => item.restaurantSlug === bookmark.restaurantSlug,
        ),
      );
      return [
        {
          ...toPersonalIdentity(restaurant),
          bookmark,
          plan,
          planStatus: plan ? classifyListPlan(plan.plannedDate, today) : null,
          visitCount: restaurantVisits.length,
          latestVisit: restaurantVisits[0] ?? null,
          personalFavorite: restaurantVisits.some(
            (visit) => visit.personalFavorite,
          ),
          collectionCount: collections.filter((collection) =>
            collection.restaurantSlugs.includes(bookmark.restaurantSlug),
          ).length,
        },
      ];
    })
    .sort(
      (a, b) =>
        b.bookmark.createdAt.localeCompare(a.bookmark.createdAt) ||
        a.name.localeCompare(b.name),
    );
}

export function buildPlannedPersonalList(
  store: PassportStore,
  restaurants: readonly Restaurant[],
  today: string,
): PlannedPersonalList {
  const catalog = new Map(
    restaurants.map((restaurant) => [restaurant.slug, restaurant]),
  );
  const visits = Object.values(store.visits);
  const items = Object.values(store.plans).flatMap((plan) => {
    const restaurant = catalog.get(plan.restaurantSlug);
    if (!restaurant) return [];
    const status = classifyListPlan(plan.plannedDate, today);
    if (status === "past") return [];
    return [
      {
        ...toPersonalIdentity(restaurant),
        plan,
        status,
        visitCount: visits.filter(
          (visit) => visit.restaurantSlug === plan.restaurantSlug,
        ).length,
      } satisfies PlannedPersonalListItem,
    ];
  });

  return {
    upcoming: items
      .filter((item) => item.status === "upcoming")
      .sort(
        (a, b) =>
          (a.plan.plannedDate ?? "9999-12-31").localeCompare(
            b.plan.plannedDate ?? "9999-12-31",
          ) || a.name.localeCompare(b.name),
      ),
    needsUpdate: items
      .filter((item) => item.status !== "upcoming")
      .sort((a, b) => {
        if (a.status === "undated" && b.status !== "undated") return 1;
        if (b.status === "undated" && a.status !== "undated") return -1;
        return (
          (b.plan.plannedDate ?? "").localeCompare(a.plan.plannedDate ?? "") ||
          a.name.localeCompare(b.name)
        );
      }),
  };
}

export function buildVisitedPersonalList(
  store: PassportStore,
  restaurants: readonly Restaurant[],
): VisitedPersonalListGroup[] {
  const catalog = new Map(
    restaurants.map((restaurant) => [restaurant.slug, restaurant]),
  );
  const visitsByRestaurant = new Map<string, RestaurantVisit[]>();
  for (const visit of Object.values(store.visits)) {
    const group = visitsByRestaurant.get(visit.restaurantSlug) ?? [];
    group.push(visit);
    visitsByRestaurant.set(visit.restaurantSlug, group);
  }

  return [...visitsByRestaurant.entries()]
    .flatMap(([slug, visits]) => {
      const restaurant = catalog.get(slug);
      if (!restaurant) return [];
      const sortedVisits = [...visits].sort(compareVisits);
      const latestReflection =
        sortedVisits.find((visit) => visit.wouldReturn !== null)?.wouldReturn ??
        null;
      return [
        {
          ...toPersonalIdentity(restaurant),
          visits: sortedVisits,
          visitCount: sortedVisits.length,
          latestVisit: sortedVisits[0] ?? null,
          personalFavorite: sortedVisits.some(
            (visit) => visit.personalFavorite,
          ),
          wouldReturn: latestReflection,
          plan: latestPlan(
            Object.values(store.plans).filter(
              (plan) => plan.restaurantSlug === slug,
            ),
          ),
        } satisfies VisitedPersonalListGroup,
      ];
    })
    .sort((a, b) => {
      const aDate = a.latestVisit?.visitDate;
      const bDate = b.latestVisit?.visitDate;
      if (aDate && bDate) {
        return bDate.localeCompare(aDate) || a.name.localeCompare(b.name);
      }
      if (aDate) return -1;
      if (bDate) return 1;
      return a.name.localeCompare(b.name);
    });
}
