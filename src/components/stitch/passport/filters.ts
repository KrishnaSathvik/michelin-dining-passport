import type {
  PassportListMode,
  PassportSortOption,
  PlannedRestaurantRowModel,
  SavedRestaurantCardModel,
  VisitedRestaurantCardModel,
} from "./models";

export type PersonalListFilters = {
  query: string;
  stars: "" | "1" | "2" | "3";
  state: string;
  cuisine: string;
  favoriteOnly: boolean;
  sort: PassportSortOption;
  view: "grid" | "list";
};

export function defaultFiltersForMode(
  mode: PassportListMode,
): PersonalListFilters {
  switch (mode) {
    case "saved":
      return {
        query: "",
        stars: "",
        state: "",
        cuisine: "",
        favoriteOnly: false,
        sort: "date-saved-newest",
        view: "grid",
      };
    case "planned":
      return {
        query: "",
        stars: "",
        state: "",
        cuisine: "",
        favoriteOnly: false,
        sort: "planned-upcoming",
        view: "list",
      };
    case "visited":
      return {
        query: "",
        stars: "",
        state: "",
        cuisine: "",
        favoriteOnly: false,
        sort: "visit-newest",
        view: "grid",
      };
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

function matchesQuery(
  name: string,
  cuisine: string | undefined,
  location: string,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    name.toLowerCase().includes(q) ||
    (cuisine?.toLowerCase().includes(q) ?? false) ||
    location.toLowerCase().includes(q)
  );
}

function matchesStars(
  distinction: 1 | 2 | 3,
  stars: PersonalListFilters["stars"],
): boolean {
  if (!stars) return true;
  return String(distinction) === stars;
}

function matchesState(location: string, state: string): boolean {
  if (!state) return true;
  return location.toLowerCase().includes(state.toLowerCase());
}

function matchesCuisine(
  cuisine: string | undefined,
  filter: string,
): boolean {
  if (!filter) return true;
  return (cuisine ?? "").toLowerCase() === filter.toLowerCase();
}

export function filterSavedCards(
  items: SavedRestaurantCardModel[],
  filters: PersonalListFilters,
): SavedRestaurantCardModel[] {
  return items.filter(
    (item) =>
      matchesQuery(item.name, item.cuisine, item.location, filters.query) &&
      matchesStars(item.distinction, filters.stars) &&
      matchesState(item.location, filters.state) &&
      matchesCuisine(item.cuisine, filters.cuisine),
  );
}

export function filterPlannedRows(
  items: PlannedRestaurantRowModel[],
  filters: PersonalListFilters,
): PlannedRestaurantRowModel[] {
  return items.filter(
    (item) =>
      matchesQuery(item.name, item.cuisine, item.location, filters.query) &&
      matchesStars(item.distinction, filters.stars) &&
      matchesState(item.location, filters.state) &&
      matchesCuisine(item.cuisine, filters.cuisine),
  );
}

export function filterVisitedCards(
  items: VisitedRestaurantCardModel[],
  filters: PersonalListFilters,
): VisitedRestaurantCardModel[] {
  return items.filter(
    (item) =>
      matchesQuery(item.name, item.cuisine, item.location, filters.query) &&
      matchesStars(item.distinction, filters.stars) &&
      matchesState(item.location, filters.state) &&
      matchesCuisine(item.cuisine, filters.cuisine) &&
      (!filters.favoriteOnly || item.isFavorite),
  );
}

function compareNullableDates(
  a: string | null,
  b: string | null,
  direction: "asc" | "desc",
): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return direction === "asc" ? a.localeCompare(b) : b.localeCompare(a);
}

export function sortSavedCards(
  items: SavedRestaurantCardModel[],
  sort: PassportSortOption,
): SavedRestaurantCardModel[] {
  const next = [...items];
  switch (sort) {
    case "date-saved-oldest":
      return next.sort((a, b) =>
        compareNullableDates(
          a.record.createdAt,
          b.record.createdAt,
          "asc",
        ),
      );
    case "name-asc":
      return next.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return next.sort((a, b) => b.name.localeCompare(a.name));
    case "date-saved-newest":
    default:
      return next.sort((a, b) =>
        compareNullableDates(
          a.record.createdAt,
          b.record.createdAt,
          "desc",
        ),
      );
  }
}

export function sortPlannedRows(
  items: PlannedRestaurantRowModel[],
  sort: PassportSortOption,
): PlannedRestaurantRowModel[] {
  const next = [...items];
  switch (sort) {
    case "planned-furthest":
      return next.sort((a, b) =>
        compareNullableDates(a.plannedDateIso, b.plannedDateIso, "desc"),
      );
    case "name-asc":
      return next.sort((a, b) => a.name.localeCompare(b.name));
    case "planned-upcoming":
    default:
      return next.sort((a, b) =>
        compareNullableDates(a.plannedDateIso, b.plannedDateIso, "asc"),
      );
  }
}

export function sortVisitedCards(
  items: VisitedRestaurantCardModel[],
  sort: PassportSortOption,
): VisitedRestaurantCardModel[] {
  const next = [...items];
  switch (sort) {
    case "visit-oldest":
      return next.sort((a, b) =>
        compareNullableDates(a.visitDateIso, b.visitDateIso, "asc"),
      );
    case "name-asc":
      return next.sort((a, b) => a.name.localeCompare(b.name));
    case "visit-newest":
    default:
      return next.sort((a, b) =>
        compareNullableDates(
          a.visitDateIso ?? a.record.updatedAt,
          b.visitDateIso ?? b.record.updatedAt,
          "desc",
        ),
      );
  }
}
