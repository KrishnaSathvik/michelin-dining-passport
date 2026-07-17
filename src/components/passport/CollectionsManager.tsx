"use client";

import Link from "next/link";
import { useState } from "react";
import { DeviceSaveNotice } from "@/components/passport/DeviceSaveNotice";
import { RestaurantMedia } from "@/components/restaurant/RestaurantMedia";
import { Button } from "@/components/ui/Button";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { Restaurant } from "@/lib/data/types";

type CollectionsManagerProps = {
  restaurants: Restaurant[];
};

export function CollectionsManager({ restaurants }: CollectionsManagerProps) {
  const { ready, mode, store, addCollection, removeCollection } = usePassport();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const bySlug = new Map(restaurants.map((item) => [item.slug, item]));

  if (!ready) {
    return <p className="font-sans text-sm text-ink-muted">Loading…</p>;
  }

  const collections = Object.values(store.collections).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <div className="space-y-10">
      <DeviceSaveNotice />

      <form
        className="space-y-4 rounded-[var(--radius-lg)] border border-border bg-bg p-5 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          const created = addCollection({
            name,
            description,
            private: true,
          });
          setName("");
          setDescription("");
          if (created) {
            window.location.href = `/collections/${created.slug}`;
          }
        }}
      >
        <h2 className="font-display text-2xl text-ink">Create a collection</h2>
        <p className="font-sans text-sm text-ink-muted">
          Curate a private shortlist for a trip, a city, or a tasting theme.
          {mode === "cloud"
            ? " Collections sync with your account."
            : " Collections stay on this device until you sign in."}
        </p>
        <label className="block font-sans text-sm">
          Name
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 min-h-11 w-full rounded-[var(--radius-md)] border border-border bg-bg px-3"
          />
        </label>
        <label className="block font-sans text-sm">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-2 min-h-24 w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2"
          />
        </label>
        <Button type="submit" variant="primary">
          Create collection
        </Button>
      </form>

      {collections.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-border px-6 py-10 text-center">
          <p className="font-display text-2xl text-ink">No collections yet</p>
          <p className="mx-auto mt-2 max-w-md font-sans text-sm text-ink-muted">
            Create one above to organize restaurants into a curated list.
          </p>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2">
          {collections.map((collection) => {
            const coverSlug =
              collection.coverRestaurantSlug ??
              collection.restaurantSlugs[0] ??
              null;
            const cover = coverSlug ? bySlug.get(coverSlug) : undefined;
            return (
              <li key={collection.id}>
                <article className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-bg">
                  <Link
                    href={`/collections/${collection.slug}`}
                    className="block no-underline"
                  >
                    {cover ? (
                      <RestaurantMedia
                        restaurant={cover}
                        className="!aspect-[16/9] rounded-none"
                      />
                    ) : (
                      <div className="flex aspect-[16/9] items-end bg-forest p-5">
                        <p className="font-display text-2xl text-white">
                          {collection.name}
                        </p>
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-display text-2xl text-ink">
                        {collection.name}
                      </h3>
                      <p className="mt-1 font-sans text-sm text-ink-muted">
                        {collection.restaurantSlugs.length} restaurant
                        {collection.restaurantSlugs.length === 1 ? "" : "s"}
                        {collection.private ? " · Private" : ""}
                      </p>
                      {collection.description ? (
                        <p className="mt-3 line-clamp-3 font-sans text-sm text-ink-secondary">
                          {collection.description}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                  <div className="border-t border-border px-5 py-3">
                    <button
                      type="button"
                      className="font-sans text-sm text-burgundy underline underline-offset-4"
                      onClick={() => {
                        if (window.confirm(`Delete “${collection.name}”?`)) {
                          removeCollection(collection.id);
                        }
                      }}
                    >
                      Delete collection
                    </button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
