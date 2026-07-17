"use client";

import Link from "next/link";
import { RestaurantCompactCard } from "@/components/restaurant/RestaurantCompactCard";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { Restaurant } from "@/lib/data/types";

type PassportRestaurantListProps = {
  restaurants: Restaurant[];
  mode: "saved" | "visited";
  emptyTitle: string;
  emptyBody: string;
};

export function PassportRestaurantList({
  restaurants,
  mode,
  emptyTitle,
  emptyBody,
}: PassportRestaurantListProps) {
  const { ready, store } = usePassport();

  if (!ready) {
    return <p className="font-sans text-sm text-ink-muted">Loading…</p>;
  }

  const slugs = new Set(
    Object.values(store.userRestaurants)
      .filter((record) => (mode === "saved" ? record.saved : record.visited))
      .map((record) => record.restaurantSlug),
  );

  const items = restaurants.filter((restaurant) => slugs.has(restaurant.slug));

  if (items.length === 0) {
    return (
      <div className="border border-border px-5 py-10 text-center">
        <h2 className="font-display text-2xl text-ink">{emptyTitle}</h2>
        <p className="mx-auto mt-3 max-w-lg font-sans text-sm text-ink-muted">
          {emptyBody}
        </p>
        <Link
          href="/explore"
          className="mt-6 inline-flex min-h-11 items-center bg-forest px-5 font-sans text-sm font-medium text-bg-elevated"
        >
          Explore restaurants
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border border border-border bg-bg-elevated/40 px-4 sm:px-5">
      {items.map((restaurant) => (
        <li key={restaurant.slug}>
          <RestaurantCompactCard restaurant={restaurant} />
        </li>
      ))}
    </ul>
  );
}
