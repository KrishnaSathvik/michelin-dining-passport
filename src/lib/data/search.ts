import { getRestaurants } from "./restaurants";
import type { Restaurant } from "./types";

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function searchRestaurants(query: string, limit = 300): Restaurant[] {
  const q = normalize(query);
  if (!q) return [];

  // Exact "1" / "2" / "3" from homepage star quick-entry controls.
  if (q === "1" || q === "2" || q === "3") {
    const stars = Number(q) as 1 | 2 | 3;
    return getRestaurants()
      .filter((restaurant) => restaurant.stars === stars)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  const terms = q.split(/\s+/).filter(Boolean);

  return getRestaurants()
    .map((restaurant) => {
      const haystack = normalize(
        [
          restaurant.name,
          restaurant.city,
          restaurant.state,
          restaurant.stateCode,
          restaurant.cuisine,
        ].join(" "),
      );

      const matches = terms.every((term) => haystack.includes(term));
      if (!matches) return null;

      const name = normalize(restaurant.name);
      const rank =
        (name === q ? 0 : name.startsWith(q) ? 1 : name.includes(q) ? 2 : 3) *
          10 +
        (4 - restaurant.stars);

      return { restaurant, rank };
    })
    .filter((entry): entry is { restaurant: Restaurant; rank: number } =>
      Boolean(entry),
    )
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return a.restaurant.name.localeCompare(b.restaurant.name);
    })
    .slice(0, limit)
    .map((entry) => entry.restaurant);
}
