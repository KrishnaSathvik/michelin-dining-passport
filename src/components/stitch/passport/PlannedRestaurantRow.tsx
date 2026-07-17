"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ReservationAction } from "@/components/stitch/restaurant/ReservationAction";
import { RestaurantMedia } from "@/components/stitch/restaurant/RestaurantMedia";
import { michelinDistinctionTitle } from "@/components/stitch/restaurant";
import {
  PlanningDetailsDialog,
  type PlanDraft,
} from "@/components/stitch/restaurant-detail/PlanningDetailsDialog";
import {
  VisitDetailsDialog,
  type VisitDraft,
} from "@/components/stitch/restaurant-detail/VisitDetailsDialog";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { PlannedRestaurantRowModel } from "./models";

type PlannedRestaurantRowProps = {
  model: PlannedRestaurantRowModel;
};

export function PlannedRestaurantRow({ model }: PlannedRestaurantRowProps) {
  const { updateRestaurant, getRecord } = usePassport();
  const record = getRecord(model.slug) ?? model.record;
  const [planOpen, setPlanOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [, startTransition] = useTransition();
  const href = `/restaurants/${model.slug}`;

  const savePlan = (draft: PlanDraft) => {
    startTransition(() => {
      updateRestaurant(model.slug, {
        planned: true,
        reservationPlannedFor: draft.plannedFor || null,
        reservationProvider: draft.provider || null,
        reservationConfirmationNote: draft.confirmationNote || null,
      });
    });
  };

  const saveVisit = (draft: VisitDraft) => {
    startTransition(() => {
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
    });
  };

  return (
    <article
      className="flex flex-col overflow-hidden rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface transition-shadow motion-safe:hover:shadow-[var(--dp-shadow-hover)] md:flex-row"
      data-passport-card="planned"
      data-slug={model.slug}
    >
      <Link
        href={href}
        aria-label={`View ${model.name}`}
        className="block shrink-0 overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus md:w-[320px]"
      >
        <RestaurantMedia
          name={model.name}
          seed={model.slug}
          city={model.location}
          stars={model.distinction}
          imageUrl={model.imageUrl}
          ratioClass="aspect-[4/3] md:aspect-auto md:h-full"
          className="h-full"
        />
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-[var(--dp-radius-md)] bg-[color-mix(in_srgb,var(--dp-star-gold)_28%,white)] px-2 py-1 font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-dp-ink">
                {michelinDistinctionTitle(model.distinction)}
              </span>
              {model.alsoVisited ? (
                <span className="rounded-[var(--dp-radius-md)] border border-dp-outline-variant px-2 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-dp-ink-muted">
                  Also visited
                </span>
              ) : null}
            </div>
            <h2 className="dp-headline-sm text-dp-primary-deep">
              <Link
                href={href}
                className="no-underline hover:text-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
              >
                {model.name}
              </Link>
            </h2>
            <p className="mt-1 font-sans text-[14px] text-dp-ink-muted">
              {[model.cuisine, model.location].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-dp-outline-variant pt-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="font-sans text-[15px] font-medium text-dp-primary-deep">
              {model.plannedDateLabel
                ? `Planned for ${model.plannedDateLabel}`
                : "Date not set yet"}
            </p>
            {model.reservationProvider ? (
              <p className="font-sans text-[14px] text-dp-ink-secondary">
                Provider: {model.reservationProvider}
              </p>
            ) : null}
            {model.hasConfirmationNote ? (
              <p className="font-sans text-[13px] text-dp-ink-muted">
                Private confirmation note on file
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              className="inline-flex h-12 min-h-11 items-center justify-center rounded-[var(--dp-radius-lg)] px-4 font-sans text-[14px] font-medium text-dp-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
              onClick={() => setPlanOpen(true)}
            >
              Edit plan
            </button>
            <button
              type="button"
              className="inline-flex h-12 min-h-11 items-center justify-center rounded-[var(--dp-radius-lg)] px-4 font-sans text-[14px] font-medium text-dp-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
              onClick={() => setVisitOpen(true)}
            >
              Mark visited
            </button>
            <ReservationAction
              restaurantSlug={model.slug}
              action={model.reservation}
              surface={model.surface}
              variant="primary"
              className="sm:min-w-[12rem]"
            />
          </div>
        </div>
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
