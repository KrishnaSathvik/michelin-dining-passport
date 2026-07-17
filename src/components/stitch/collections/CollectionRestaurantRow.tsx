"use client";

import Link from "next/link";
import { useState } from "react";
import { ReservationAction } from "@/components/stitch/restaurant/ReservationAction";
import { RestaurantMedia } from "@/components/stitch/restaurant/RestaurantMedia";
import { michelinDistinctionTitle } from "@/components/stitch/restaurant";
import { RemoveRestaurantDialog } from "./RemoveRestaurantDialog";
import type { CollectionRestaurantRowModel } from "./models";
import type { LocalCollection } from "@/lib/passport/types";

type CollectionRestaurantRowProps = {
  model: CollectionRestaurantRowModel;
  collection: LocalCollection;
};

export function CollectionRestaurantRow({
  model,
  collection,
}: CollectionRestaurantRowProps) {
  const [removeOpen, setRemoveOpen] = useState(false);
  const href = `/restaurants/${model.slug}`;
  const meta = [model.price, model.cuisine, model.location]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className="flex flex-col gap-4 border-b border-dp-outline-variant py-6 last:border-b-0 md:flex-row md:items-stretch md:gap-6"
      data-collections-row
      data-slug={model.slug}
    >
      <Link
        href={href}
        aria-label={`View ${model.name}`}
        className="block shrink-0 overflow-hidden rounded-[var(--dp-radius-md)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus md:w-[160px]"
      >
        <RestaurantMedia
          name={model.name}
          seed={model.slug}
          city={model.location}
          stars={model.distinction}
          imageUrl={model.imageUrl}
          ratioClass="aspect-[4/3] md:aspect-square"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-[var(--dp-radius-md)] bg-[color-mix(in_srgb,var(--dp-star-gold)_28%,white)] px-2 py-1 font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-dp-ink">
            {michelinDistinctionTitle(model.distinction)}
          </span>
          {model.visited ? (
            <span className="rounded-[var(--dp-radius-md)] border border-dp-outline-variant px-2 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-dp-primary">
              Visited
            </span>
          ) : model.planned ? (
            <span className="rounded-[var(--dp-radius-md)] border border-dp-outline-variant px-2 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-dp-ink-muted">
              Planned
            </span>
          ) : model.saved ? (
            <span className="rounded-[var(--dp-radius-md)] border border-dp-outline-variant px-2 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-dp-ink-muted">
              Saved
            </span>
          ) : null}
        </div>
        <h3 className="dp-headline-sm text-dp-primary-deep">
          <Link
            href={href}
            className="no-underline hover:text-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          >
            {model.name}
          </Link>
        </h3>
        {meta ? (
          <p className="mt-1 font-sans text-[14px] text-dp-ink-muted">{meta}</p>
        ) : null}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="min-w-[160px] flex-1 sm:max-w-[220px]">
            <ReservationAction
              restaurantSlug={model.slug}
              action={model.reservation}
              surface={model.surface}
              variant="compact"
            />
          </div>
          <Link
            href={href}
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-outline-variant px-4 font-sans text-[14px] font-semibold text-dp-primary no-underline hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          >
            Open details
          </Link>
          <button
            type="button"
            onClick={() => setRemoveOpen(true)}
            className="inline-flex min-h-11 items-center justify-center px-2 font-sans text-[14px] font-medium text-dp-error underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          >
            Remove from collection
          </button>
        </div>
      </div>

      <RemoveRestaurantDialog
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        collection={collection}
        restaurantSlug={model.slug}
        restaurantName={model.name}
      />
    </article>
  );
}
