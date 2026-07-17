"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DeviceSaveNotice } from "@/components/passport/DeviceSaveNotice";
import { RestaurantCompactCard } from "@/components/restaurant/RestaurantCompactCard";
import { RestaurantMedia } from "@/components/restaurant/RestaurantMedia";
import { Button } from "@/components/ui/Button";
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

  const cover = items[0] ?? null;
  const mapHref =
    items.length > 0
      ? `/map?q=${encodeURIComponent(collection?.name ?? "")}`
      : "/map";

  if (!ready) {
    return <p className="font-sans text-sm text-ink-muted">Loading…</p>;
  }

  if (!collection) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border px-5 py-10 text-center">
        <h1 className="font-display text-3xl text-ink">Collection not found</h1>
        <p className="mt-3 font-sans text-sm text-ink-muted">
          This collection is not available in your current Passport.
        </p>
        <Link
          href="/collections"
          className="mt-6 inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-border px-5 font-sans text-sm no-underline"
        >
          Back to collections
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DeviceSaveNotice />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
        <div>
          <p className="font-sans text-xs uppercase tracking-[0.18em] text-ink-muted">
            {collection.private ? "Private collection" : "Collection"}
          </p>
          <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
            {collection.name}
          </h1>
          {collection.description ? (
            <p className="mt-3 max-w-2xl font-sans text-base text-ink-muted">
              {collection.description}
            </p>
          ) : null}
          <p className="mt-4 font-sans text-sm text-ink-secondary">
            {items.length} restaurant{items.length === 1 ? "" : "s"}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={mapHref}
              className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-border px-4 font-sans text-sm text-ink no-underline hover:border-forest"
            >
              Open map
            </Link>
            <Link
              href="/collections"
              className="inline-flex min-h-11 items-center font-sans text-sm text-forest no-underline hover:underline"
            >
              All collections
            </Link>
          </div>
        </div>
        {cover ? (
          <RestaurantMedia restaurant={cover} className="w-full" />
        ) : (
          <div className="flex aspect-[4/3] items-end rounded-[var(--radius-lg)] bg-forest p-6">
            <p className="font-display text-3xl text-white">{collection.name}</p>
          </div>
        )}
      </div>

      <form
        className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border p-4 sm:flex-row"
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
            coverRestaurantSlug: collection.coverRestaurantSlug ?? addSlug,
          });
          setAddSlug("");
        }}
      >
        <label className="sr-only" htmlFor="add-restaurant">
          Add restaurant
        </label>
        <select
          id="add-restaurant"
          className="min-h-11 flex-1 rounded-[var(--radius-md)] border border-border bg-bg px-3 font-sans text-sm"
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
        <Button type="submit" variant="primary">
          Add
        </Button>
      </form>

      {items.length === 0 ? (
        <p className="font-sans text-sm text-ink-muted">
          No restaurants in this collection yet.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-[var(--radius-lg)] border border-border px-4 sm:px-5">
          {items.map((restaurant, index) => (
            <li key={restaurant.slug} className="py-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <p className="pt-3 font-sans text-xs uppercase tracking-[0.14em] text-ink-muted">
                    {index + 1}
                  </p>
                  <RestaurantCompactCard
                    restaurant={restaurant}
                    surface="collection"
                  />
                </div>
                <button
                  type="button"
                  className="mb-4 font-sans text-sm text-burgundy underline underline-offset-4 sm:mb-0 sm:mt-8"
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
