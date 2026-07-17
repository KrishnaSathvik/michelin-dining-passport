"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ReservationAction } from "@/components/stitch/restaurant/ReservationAction";
import { RestaurantMedia } from "@/components/stitch/restaurant/RestaurantMedia";
import { SaveAction } from "@/components/stitch/restaurant/SaveAction";
import { michelinDistinctionTitle } from "@/components/stitch/restaurant";
import {
  PlanningDetailsDialog,
  type PlanDraft,
} from "@/components/stitch/restaurant-detail/PlanningDetailsDialog";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { SavedRestaurantCardModel } from "./models";

type SavedRestaurantCardProps = {
  model: SavedRestaurantCardModel;
};

export function SavedRestaurantCard({ model }: SavedRestaurantCardProps) {
  const { updateRestaurant, getRecord } = usePassport();
  const record = getRecord(model.slug) ?? model.record;
  const [planOpen, setPlanOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const href = `/restaurants/${model.slug}`;
  const meta = [model.price, model.cuisine, model.location]
    .filter(Boolean)
    .join(" · ");

  const moveToPlanned = () => {
    startTransition(() => {
      updateRestaurant(model.slug, { planned: true });
      setPlanOpen(true);
    });
  };

  const savePlan = (draft: PlanDraft) => {
    updateRestaurant(model.slug, {
      planned: true,
      reservationPlannedFor: draft.plannedFor || null,
      reservationProvider: draft.provider || null,
      reservationConfirmationNote: draft.confirmationNote || null,
    });
  };

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-[var(--dp-radius-md)] border border-dp-outline-variant bg-dp-surface transition-shadow motion-safe:hover:shadow-[var(--dp-shadow-hover)]"
      data-passport-card="saved"
      data-slug={model.slug}
    >
      <div className="relative">
        <Link
          href={href}
          aria-label={`View ${model.name}`}
          className="block overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        >
          <div className="motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.02]">
            <RestaurantMedia
              name={model.name}
              seed={model.slug}
              city={model.location}
              stars={model.distinction}
              imageUrl={model.imageUrl}
            />
          </div>
        </Link>
        <div className="absolute left-3 top-3 z-10 rounded-[var(--dp-radius-md)] bg-[color-mix(in_srgb,var(--dp-star-gold)_28%,white)] px-2 py-1 font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-dp-ink">
          {michelinDistinctionTitle(model.distinction)}
        </div>
        <div className="absolute right-3 top-3 z-10">
          <SaveAction restaurantSlug={model.slug} variant="overlay" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h2 className="dp-headline-sm text-dp-primary-deep">
          <Link
            href={href}
            className="no-underline hover:text-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          >
            {model.name}
          </Link>
        </h2>
        {meta ? (
          <p className="mt-1 font-sans text-[14px] text-dp-ink-muted">{meta}</p>
        ) : null}
        {model.savedAtLabel ? (
          <p className="mt-2 font-sans text-[12px] text-dp-ink-muted">
            Added {model.savedAtLabel}
          </p>
        ) : null}
        <div className="mt-auto grid grid-cols-1 gap-2 pt-4 sm:grid-cols-2">
          <ReservationAction
            restaurantSlug={model.slug}
            action={model.reservation}
            surface={model.surface}
            variant="primary"
          />
          <button
            type="button"
            className="inline-flex h-12 min-h-11 items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface px-4 font-sans text-[14px] font-semibold text-dp-primary-deep transition-colors hover:bg-dp-surface-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus disabled:opacity-60"
            onClick={moveToPlanned}
            disabled={pending}
          >
            Move to Planned
          </button>
        </div>
        <Link
          href={href}
          className="mt-3 inline-flex min-h-11 items-center justify-center font-sans text-[14px] font-medium text-dp-primary no-underline underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        >
          Open details
        </Link>
      </div>

      <PlanningDetailsDialog
        key={`${model.slug}-${record.updatedAt}-plan`}
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        restaurantName={model.name}
        stars={model.distinction}
        record={record}
        onSave={savePlan}
      />
    </article>
  );
}
