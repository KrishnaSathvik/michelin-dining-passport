"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/stitch/Button";
import { Dialog } from "@/components/stitch/Dialog";
import { MichelinDistinction } from "@/components/stitch/restaurant/MichelinDistinction";
import { buildAddRestaurantCandidates } from "@/lib/passport/collections";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { LocalCollection } from "@/lib/passport/types";

type AddRestaurantsDialogProps = {
  open: boolean;
  onClose: () => void;
  collection: LocalCollection;
};

/**
 * Search is scoped to Saved restaurants on purpose — the discovery catalog is
 * not shipped to the client for this interaction. Explore stays a separate route.
 */
export function AddRestaurantsDialog({
  open,
  onClose,
  collection,
}: AddRestaurantsDialogProps) {
  const { store, restaurants, addToCollection, removeFromCollection } =
    usePassport();
  const [query, setQuery] = useState("");

  const live = store.collections[collection.id] ?? collection;
  const candidates = useMemo(
    () => buildAddRestaurantCandidates(store, restaurants, live, query),
    [store, restaurants, live, query],
  );

  const savedTotal = Object.keys(store.bookmarks).length;
  const addedCount = live.restaurantSlugs.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add restaurants"
      description={`Search the restaurants saved in My Restaurants. ${addedCount} in this collection.`}
      size="wide"
      footer={
        <div className="flex justify-end">
          <Button type="button" variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      <div className="space-y-5" data-collections-dialog="add-restaurants">
        <form role="search" onSubmit={(event) => event.preventDefault()}>
          <label className="block">
            <span className="dp-label-caps text-dp-ink-muted">
              Search saved restaurants
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, city, state, or cuisine"
              autoComplete="off"
              data-dialog-initial-focus
              className="mt-2 h-12 w-full min-w-0 rounded-[var(--dp-radius-md)] border border-dp-border bg-dp-surface px-4 font-sans text-[16px] text-dp-ink placeholder:text-dp-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
            />
          </label>
        </form>

        <p className="font-sans text-sm text-dp-ink-muted" aria-live="polite">
          {candidates.length}{" "}
          {candidates.length === 1 ? "restaurant" : "restaurants"}
          {query.trim() ? " match your search" : " saved"}
        </p>

        {savedTotal === 0 ? (
          <div className="rounded-[var(--dp-radius-md)] border border-dp-outline-variant bg-dp-surface-low px-5 py-8 text-center">
            <p className="font-sans text-[15px] font-semibold text-dp-ink">
              You have not saved any restaurants yet
            </p>
            <p className="mx-auto mt-2 max-w-sm font-sans text-sm text-dp-ink-muted">
              Save restaurants from Explore, then add them to this collection.
            </p>
            <Link
              href="/explore"
              className="mt-5 inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-primary hover:underline"
            >
              Explore restaurants
            </Link>
          </div>
        ) : candidates.length === 0 ? (
          <div className="rounded-[var(--dp-radius-md)] border border-dp-outline-variant bg-dp-surface-low px-5 py-8 text-center">
            <p className="font-sans text-[15px] font-semibold text-dp-ink">
              No saved restaurants match
            </p>
            <p className="mx-auto mt-2 max-w-sm font-sans text-sm text-dp-ink-muted">
              Try another name, city, state, or cuisine — or save more
              restaurants from Explore.
            </p>
            <Link
              href="/explore"
              className="mt-5 inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-primary hover:underline"
            >
              Explore restaurants
            </Link>
          </div>
        ) : (
          <ul className="min-w-0 divide-y divide-dp-border rounded-[var(--dp-radius-md)] border border-dp-outline-variant">
            {candidates.map((candidate) => (
              <li
                key={candidate.slug}
                className="flex min-w-0 flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                data-add-candidate={candidate.slug}
                data-already-member={candidate.alreadyInCollection}
              >
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <MichelinDistinction
                      stars={candidate.distinction}
                      variant="row"
                    />
                    <p className="truncate font-sans text-[15px] font-semibold text-dp-ink">
                      {candidate.name}
                    </p>
                  </div>
                  <p className="mt-1 font-sans text-[13px] text-dp-ink-muted">
                    {[candidate.cuisine, candidate.location, candidate.price]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                {candidate.alreadyInCollection ? (
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-sans text-[13px] font-semibold text-dp-primary">
                      In this collection
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        removeFromCollection(live.id, candidate.slug)
                      }
                      className="inline-flex min-h-11 items-center px-2 font-sans text-[14px] font-medium text-dp-error underline-offset-4 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0"
                    onClick={() => addToCollection(live.id, candidate.slug)}
                  >
                    Add
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="font-sans text-[13px] leading-relaxed text-dp-ink-muted">
          Need something that is not here?{" "}
          <Link
            href="/explore"
            className="font-semibold text-dp-primary hover:underline"
          >
            Explore restaurants
          </Link>{" "}
          and save it first.
        </p>
      </div>
    </Dialog>
  );
}
