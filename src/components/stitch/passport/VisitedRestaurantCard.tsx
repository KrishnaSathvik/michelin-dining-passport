"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { RestaurantMedia } from "@/components/stitch/restaurant/RestaurantMedia";
import { michelinDistinctionTitle } from "@/components/stitch/restaurant";
import {
  VisitDetailsDialog,
  type VisitDraft,
} from "@/components/stitch/restaurant-detail/VisitDetailsDialog";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { VisitedRestaurantCardModel } from "./models";

type VisitedRestaurantCardProps = {
  model: VisitedRestaurantCardModel;
};

export function VisitedRestaurantCard({ model }: VisitedRestaurantCardProps) {
  const { updateRestaurant, getRecord } = usePassport();
  const record = getRecord(model.slug) ?? model.record;
  const [visitOpen, setVisitOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const href = `/restaurants/${model.slug}`;

  const toggleFavorite = () => {
    startTransition(() => {
      updateRestaurant(model.slug, { favorite: !record.favorite });
    });
  };

  const saveVisit = (draft: VisitDraft) => {
    updateRestaurant(model.slug, {
      visitDate: draft.visitDate || null,
      visited: draft.visitDate ? true : draft.visited,
      favorite: draft.favorite,
      notes: draft.notes,
      favoriteDishes: draft.dishes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      personalRating: draft.personalRating
        ? Number(draft.personalRating)
        : record.personalRating ?? null,
    });
  };

  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface transition-shadow motion-safe:hover:shadow-[var(--dp-shadow-hover)]"
      data-passport-card="visited"
      data-slug={model.slug}
    >
      <div className="relative">
        <Link
          href={href}
          aria-label={`View ${model.name}`}
          className="block overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        >
          <RestaurantMedia
            name={model.name}
            seed={model.slug}
            city={model.location}
            stars={model.distinction}
            imageUrl={model.imageUrl}
          />
        </Link>
        <button
          type="button"
          className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-dp-surface/85 text-lg text-dp-primary-deep backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus disabled:opacity-60"
          aria-pressed={record.favorite}
          aria-label={
            record.favorite ? "Remove favorite" : "Mark as favorite"
          }
          disabled={pending}
          onClick={toggleFavorite}
        >
          <span aria-hidden="true">{record.favorite ? "♥" : "♡"}</span>
        </button>
        <div className="absolute bottom-4 left-4 z-10 rounded-[var(--dp-radius-md)] bg-[color-mix(in_srgb,var(--dp-star-gold)_28%,white)] px-2 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-dp-ink">
          {michelinDistinctionTitle(model.distinction)}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h2 className="dp-headline-sm text-dp-primary-deep">
          <Link
            href={href}
            className="no-underline hover:text-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          >
            {model.name}
          </Link>
        </h2>
        <p className="mt-2 font-sans text-[14px] text-dp-ink-muted">
          {model.location}
          {model.visitDateLabel ? ` · Visited ${model.visitDateLabel}` : ""}
        </p>

        {model.favoriteDishes.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Favorite dishes">
            {model.favoriteDishes.map((dish) => (
              <li
                key={dish}
                className="rounded-[var(--dp-radius-md)] bg-dp-surface-highest px-2 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-dp-ink-secondary"
              >
                {dish}
              </li>
            ))}
          </ul>
        ) : null}

        {model.notesPreview ? (
          <p className="mt-3 border-l-2 border-dp-outline-variant pl-3 font-sans text-[14px] italic text-dp-ink-secondary">
            <span className="sr-only">Private note: </span>
            {model.notesPreview}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-dp-outline-variant pt-4">
          <Link
            href={href}
            className="inline-flex min-h-11 items-center font-sans text-[14px] font-medium text-dp-primary no-underline underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          >
            Open details
          </Link>
          <button
            type="button"
            className="inline-flex h-12 min-h-11 items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface px-4 font-sans text-[14px] font-semibold text-dp-primary-deep transition-colors hover:bg-dp-surface-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
            onClick={() => setVisitOpen(true)}
          >
            Edit visit
          </button>
        </div>
      </div>

      <VisitDetailsDialog
        key={`${model.slug}-${record.updatedAt}-visit`}
        open={visitOpen}
        onClose={() => setVisitOpen(false)}
        restaurantName={model.name}
        stars={model.distinction}
        record={record}
        onSave={saveVisit}
      />
    </article>
  );
}
