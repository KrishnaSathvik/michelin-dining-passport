"use client";

import Link from "next/link";
import { useState } from "react";
import { DeviceSaveNotice } from "@/components/passport/DeviceSaveNotice";
import { usePassport } from "@/lib/passport/PassportProvider";

export function CollectionsManager() {
  const { ready, store, addCollection, removeCollection } = usePassport();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!ready) {
    return <p className="font-sans text-sm text-ink-muted">Loading…</p>;
  }

  const collections = Object.values(store.collections).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <div className="space-y-8">
      <DeviceSaveNotice />

      <form
        className="space-y-4 border border-border p-5"
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
        <h2 className="font-display text-2xl text-ink">Create collection</h2>
        <label className="block font-sans text-sm">
          Name
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 min-h-11 w-full border border-border bg-bg-elevated px-3"
          />
        </label>
        <label className="block font-sans text-sm">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-2 min-h-24 w-full border border-border bg-bg-elevated px-3 py-2"
          />
        </label>
        <p className="font-sans text-xs text-ink-muted">
          Collections stay private on this device until cloud accounts exist.
        </p>
        <button
          type="submit"
          className="min-h-11 bg-forest px-5 font-sans text-sm font-medium text-bg-elevated"
        >
          Create collection
        </button>
      </form>

      {collections.length === 0 ? (
        <p className="font-sans text-sm text-ink-muted">
          No collections yet. Create one to organize restaurants locally.
        </p>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {collections.map((collection) => (
            <li
              key={collection.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="font-display text-xl text-ink hover:text-forest"
                >
                  {collection.name}
                </Link>
                <p className="mt-1 font-sans text-sm text-ink-muted">
                  {collection.restaurantSlugs.length} restaurant
                  {collection.restaurantSlugs.length === 1 ? "" : "s"}
                  {collection.private ? " · Private" : ""}
                </p>
              </div>
              <button
                type="button"
                className="font-sans text-sm text-burgundy underline underline-offset-4"
                onClick={() => {
                  if (window.confirm(`Delete “${collection.name}”?`)) {
                    removeCollection(collection.id);
                  }
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
