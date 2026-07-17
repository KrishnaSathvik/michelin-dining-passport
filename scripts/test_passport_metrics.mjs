import assert from "node:assert/strict";
import { describe, it } from "node:test";

function calculatePassportMetrics(store, restaurants) {
  const bySlug = new Map(restaurants.map((item) => [item.slug, item]));
  const visited = Object.values(store.userRestaurants).filter((item) => item.visited);
  let starsExperienced = 0;
  for (const record of visited) {
    const restaurant = bySlug.get(record.restaurantSlug);
    if (restaurant) starsExperienced += restaurant.stars;
  }
  return {
    restaurantsVisited: visited.length,
    starsExperienced,
  };
}

describe("passport star formula", () => {
  it("adds 1 + 2 + 3 for mixed visits", () => {
    const metrics = calculatePassportMetrics(
      {
        userRestaurants: {
          a: { restaurantSlug: "a", visited: true },
          b: { restaurantSlug: "b", visited: true },
          c: { restaurantSlug: "c", visited: true },
          d: { restaurantSlug: "d", visited: false },
        },
      },
      [
        { slug: "a", stars: 1 },
        { slug: "b", stars: 2 },
        { slug: "c", stars: 3 },
        { slug: "d", stars: 3 },
      ],
    );
    assert.equal(metrics.restaurantsVisited, 3);
    assert.equal(metrics.starsExperienced, 6);
  });
});
