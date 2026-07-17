import type { CollectionCardModel, CollectionSortId } from "./models";

export function filterCollectionsByQuery(
  collections: readonly CollectionCardModel[],
  query: string,
): CollectionCardModel[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [...collections];

  return collections.filter((collection) => {
    const name = collection.name.toLowerCase();
    const description = collection.description.toLowerCase();
    return name.includes(normalized) || description.includes(normalized);
  });
}

export function sortCollections(
  collections: readonly CollectionCardModel[],
  sort: CollectionSortId,
): CollectionCardModel[] {
  const next = [...collections];

  switch (sort) {
    case "updated-desc":
      next.sort((a, b) => {
        const time = b.updatedAt.localeCompare(a.updatedAt);
        if (time !== 0) return time;
        return a.name.localeCompare(b.name);
      });
      break;
    case "name-asc":
      next.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      next.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "count-desc":
      next.sort((a, b) => {
        const count = b.restaurantCount - a.restaurantCount;
        if (count !== 0) return count;
        return a.name.localeCompare(b.name);
      });
      break;
    case "count-asc":
      next.sort((a, b) => {
        const count = a.restaurantCount - b.restaurantCount;
        if (count !== 0) return count;
        return a.name.localeCompare(b.name);
      });
      break;
    default: {
      const _exhaustive: never = sort;
      return _exhaustive;
    }
  }

  return next;
}
