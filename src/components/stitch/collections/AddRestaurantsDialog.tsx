"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/stitch/Button";
import { Dialog } from "@/components/stitch/Dialog";
import { Input } from "@/components/stitch/Input";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { LocalCollection } from "@/lib/passport/types";
import type { Restaurant } from "@/lib/data/types";
import { toAddRestaurantOptions } from "./adapters";

type AddRestaurantsDialogProps = {
  open: boolean;
  onClose: () => void;
  collection: LocalCollection;
  restaurants: Restaurant[];
};

/**
 * One-at-a-time add via existing editCollection membership semantics.
 * Excludes current members; uses the canonical 271-restaurant roster only.
 */
export function AddRestaurantsDialog({
  open,
  onClose,
  collection,
  restaurants,
}: AddRestaurantsDialogProps) {
  const { editCollection, findCollectionBySlug } = usePassport();
  const live =
    findCollectionBySlug(collection.slug) ?? collection;
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const options = useMemo(
    () =>
      toAddRestaurantOptions({
        collection: live,
        restaurants,
        query,
      }),
    [live, restaurants, query],
  );

  const handleClose = () => {
    if (pending) return;
    setQuery("");
    setError(null);
    onClose();
  };

  const addSlug = (slug: string) => {
    if (live.restaurantSlugs.includes(slug)) {
      setError("That restaurant is already in this collection.");
      return;
    }

    startTransition(() => {
      const nextSlugs = [...live.restaurantSlugs, slug];
      editCollection(live.id, {
        restaurantSlugs: nextSlugs,
        coverRestaurantSlug: live.coverRestaurantSlug ?? slug,
      });
      setError(null);
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Add restaurants"
      footer={
        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={pending}
          >
            Done
          </Button>
        </div>
      }
    >
      <div className="space-y-4" data-collections-dialog="add-restaurants">
        <Input
          label="Search restaurants"
          name="add-restaurant-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Name, cuisine, or city"
          autoComplete="off"
          disabled={pending}
        />
        {error ? (
          <p className="font-sans text-[14px] text-dp-error" role="alert">
            {error}
          </p>
        ) : null}
        <ul className="max-h-[360px] divide-y divide-dp-outline-variant overflow-y-auto rounded-[var(--dp-radius-md)] border border-dp-outline-variant">
          {options.length === 0 ? (
            <li className="px-4 py-8 text-center font-sans text-[14px] text-dp-ink-muted">
              No matching restaurants to add.
            </li>
          ) : (
            options.map((option) => (
              <li
                key={option.slug}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-sans text-[15px] font-medium text-dp-ink">
                    {option.name}
                  </p>
                  <p className="mt-0.5 font-sans text-[13px] text-dp-ink-muted">
                    {michelinLabel(option.distinction)} · {option.cuisine} ·{" "}
                    {option.location}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => addSlug(option.slug)}
                  disabled={pending}
                  className="shrink-0"
                >
                  Add
                </Button>
              </li>
            ))
          )}
        </ul>
        <p className="font-sans text-[13px] text-dp-ink-muted">
          Adding a restaurant organizes it in this collection only. It does not
          change Saved, Planned, Visited, or Favorite.
        </p>
      </div>
    </Dialog>
  );
}

function michelinLabel(stars: 1 | 2 | 3): string {
  if (stars === 1) return "1 Star";
  if (stars === 2) return "2 Stars";
  return "3 Stars";
}
