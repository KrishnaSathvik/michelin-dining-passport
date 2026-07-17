"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DeviceSaveNotice } from "@/components/passport/DeviceSaveNotice";
import { RestaurantCompactCard } from "@/components/restaurant/RestaurantCompactCard";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { Restaurant } from "@/lib/data/types";

type CollectionDetailProps = {
  slug: string;
  restaurants: Restaurant[];
};

export function CollectionDetail({
  slug,
  restaurants,
}: CollectionDetailProps) {
  const { ready, findCollectionBySlug, editCollection } = usePassport();
  const collection = findCollectionBySlug(slug);
  const [addSlug, setAddSlug] = useState("");

  const items = useMemo(() => {
    if (!collection) return [];
    const bySlug = new Map(
      restaurants.map((restaurant) => [restaurant.slug, restaurant]),
    );
    return collection.restaurantSlugs.flatMap((itemSlug) => {
      const restaurant = bySlug.get(itemSlug);
      return restaurant ? [restaurant] : [];
    });
  }, [collection, restaurants]);

  if (!ready) {
    return <p className="font-sans text-sm text-ink-muted">Loading…</p>;
  }

  if (!collection) {
    return (
      <div className="border border-border px-5 py-10 text-center">
        <h1 className="font-display text-3xl text-ink">Collection not found</h1>
        <p className="mt-3 font-sans text-sm text-ink-muted">
          This collection is not saved on this device.
        </p>
        <Link
          href="/collections"
          className="mt-6 inline-flex min-h-11 items-center border border-border px-5 font-sans text-sm"
        >
          Back to collections
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DeviceSaveNotice />
      <div>
        <p className="font-sans text-xs uppercase tracking-[0.18em] text-burgundy">
          {collection.private ? "Private collection" : "Collection"}
        </p>
        <h1 className="mt-3 font-display text-4xl text-ink">
          {collection.name}
        </h1>
        {collection.description ? (
          <p className="mt-3 max-w-2xl font-sans text-base text-ink-muted">
            {collection.description}
          </p>
        ) : null}
      </div>

      <form
        className="flex flex-col gap-3 border border-border p-4 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (!addSlug) return;
          if (collection.restaurantSlugs.includes(addSlug)) {
            setAddSlug("");
            return;
          }
          const nextSlugs = [...collection.restaurantSlugs, addSlug];
          editCollection(collection.id, {
            restaurantSlugs: nextSlugs,
            coverRestaurantSlug:
              collection.coverRestaurantSlug ?? addSlug,
          });
          setAddSlug("");
        }}
      >
        <label className="sr-only" htmlFor="add-restaurant">
          Add restaurant
        </label>
        <select
          id="add-restaurant"
          className="min-h-11 flex-1 border border-border bg-bg-elevated px-3 font-sans text-sm"
          value={addSlug}
          onChange={(event) => setAddSlug(event.target.value)}
        >
          <option value="">Add a restaurant…</option>
          {restaurants.map((restaurant) => (
            <option key={restaurant.slug} value={restaurant.slug}>
              {restaurant.name} · {restaurant.city}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="min-h-11 bg-forest px-5 font-sans text-sm font-medium text-bg-elevated"
        >
          Add
        </button>
      </form>

      {items.length === 0 ? (
        <p className="font-sans text-sm text-ink-muted">
          No restaurants in this collection yet.
        </p>
      ) : (
        <ul className="divide-y divide-border border border-border bg-bg-elevated/40 px-4 sm:px-5">
          {items.map((restaurant) => (
            <li key={restaurant.slug} className="py-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <RestaurantCompactCard restaurant={restaurant} />
                </div>
                <button
                  type="button"
                  className="mb-4 font-sans text-sm text-burgundy underline underline-offset-4 sm:mb-0"
                  onClick={() => {
                    const next = collection.restaurantSlugs.filter(
                      (item) => item !== restaurant.slug,
                    );
                    editCollection(collection.id, {
                      restaurantSlugs: next,
                      coverRestaurantSlug:
                        collection.coverRestaurantSlug === restaurant.slug
                          ? (next[0] ?? null)
                          : collection.coverRestaurantSlug,
                    });
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
