"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/stitch/Button";
import { RestaurantMedia } from "@/components/stitch/restaurant/RestaurantMedia";
import { MichelinDistinction } from "@/components/stitch/restaurant/MichelinDistinction";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { PassportPlanModel } from "./models";
import {
  JourneyPlanDialog,
  JourneyVisitDialog,
  type PlanFormDraft,
  type VisitFormDraft,
} from "@/components/passport-actions/JourneyDialogs";

type PassportUpcomingPlanProps = {
  model: PassportPlanModel | null;
};

export function PassportUpcomingPlan({
  model,
}: PassportUpcomingPlanProps) {
  const { store, savePlan, removePlan, addVisit } = usePassport();
  const [planOpen, setPlanOpen] = useState(false);
  const [planIntent, setPlanIntent] = useState<"edit" | "remove">("edit");
  const [visitOpen, setVisitOpen] = useState(false);

  if (!model) return null;

  const isOverdue = model.status === "needs-update";
  const plan = store.plans[model.plan.id] ?? model.plan;
  const visits = Object.values(store.visits).filter(
    (visit) => visit.restaurantSlug === model.slug,
  );

  const savePlanDraft = (draft: PlanFormDraft) => {
    savePlan({
      restaurantSlug: model.slug,
      plannedDate: draft.plannedDate,
      plannedTime: draft.plannedTime || null,
      reservationProvider: draft.reservationProvider.trim() || null,
      confirmationReference: draft.confirmationReference.trim() || null,
      privateNotes: draft.privateNotes,
    });
  };

  const saveVisitDraft = (
    draft: VisitFormDraft,
    completePlan: boolean,
  ) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? `visit:${crypto.randomUUID()}`
        : `visit:${Date.now()}`;
    addVisit({
      id,
      restaurantSlug: model.slug,
      visitDate: draft.visitDate,
      favoriteDishes: draft.favoriteDishes,
      privateNotes: draft.privateNotes,
      wouldReturn: draft.wouldReturn,
      personalFavorite: draft.personalFavorite,
    });
    if (completePlan) removePlan(plan.id);
  };

  return (
    <section
      aria-labelledby="upcoming-plan-heading"
      className="mb-[var(--dp-section)]"
      data-passport-section="upcoming-plan"
    >
      <div className="mb-5">
        <p className="dp-label-caps text-dp-ink-muted">
          {isOverdue ? "Attention" : "Next table"}
        </p>
        <h2
          id="upcoming-plan-heading"
          className="dp-headline-md mt-2 text-dp-primary-deep"
        >
          {isOverdue ? "Plan needs an update" : "Upcoming planned visit"}
        </h2>
      </div>

      <article
        className="grid min-w-0 overflow-hidden rounded-[var(--dp-radius-xl)] border border-dp-outline-variant bg-dp-surface md:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]"
        data-passport-card="upcoming"
        data-plan-status={model.status}
      >
        <Link
          href={`/restaurants/${model.slug}`}
          aria-label={`Open ${model.name}`}
          className="block min-w-0 overflow-hidden"
        >
          <RestaurantMedia
            name={model.name}
            seed={model.slug}
            city={model.location}
            stars={model.distinction}
            imageUrl={model.imageUrl}
            placeId={model.placeId}
            ratioClass="aspect-[4/3] md:aspect-auto md:h-full md:min-h-[25rem]"
            className="h-full rounded-none"
            sizes="(max-width: 768px) 100vw, 52vw"
            priority
          />
        </Link>
        <div className="flex min-w-0 flex-col justify-center p-6 sm:p-8 lg:p-10">
          {isOverdue ? (
            <p className="mb-4 inline-flex w-fit rounded-[var(--dp-radius-md)] bg-[color-mix(in_srgb,var(--dp-secondary-container)_35%,white)] px-3 py-1.5 font-sans text-xs font-semibold uppercase tracking-[0.08em] text-dp-secondary">
              Needs update
            </p>
          ) : null}
          <MichelinDistinction
            stars={model.distinction}
            variant="editorial"
            showLabel
          />
          <h3 className="mt-5 font-display text-3xl leading-tight text-dp-primary-deep sm:text-4xl">
            {model.name}
          </h3>
          <p className="mt-3 font-sans text-sm text-dp-ink-muted">
            {[model.cuisine, model.location].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-7 font-display text-2xl text-dp-ink">
            {model.dateLabel}
            {model.timeLabel ? (
              <span className="font-sans text-base text-dp-ink-secondary">
                {" "}
                · {model.timeLabel}
              </span>
            ) : null}
          </p>
          {plan.reservationProvider ? (
            <p className="mt-2 font-sans text-sm text-dp-ink-secondary">
              Reservation via {plan.reservationProvider}
              {plan.confirmationReference ? " · Reference saved privately" : ""}
            </p>
          ) : null}
          {isOverdue ? (
            <p className="mt-5 font-sans text-sm leading-relaxed text-dp-ink-secondary">
              The planned date has passed. Orellin will not assume the
              meal happened.
            </p>
          ) : null}

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button onClick={() => setVisitOpen(true)}>
              Record visit
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setPlanIntent("edit");
                setPlanOpen(true);
              }}
            >
              {isOverdue ? "Reschedule" : "Edit plan"}
            </Button>
            <Link
              href={`/restaurants/${model.slug}`}
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--dp-radius-lg)] px-4 font-sans text-sm font-semibold text-dp-primary no-underline hover:bg-dp-soft"
            >
              Open restaurant
            </Link>
            {isOverdue ? (
              <Button
                variant="ghost"
                className="text-dp-error"
                onClick={() => {
                  setPlanIntent("remove");
                  setPlanOpen(true);
                }}
              >
                Remove plan
              </Button>
            ) : null}
          </div>
        </div>
      </article>

      {planOpen ? (
        <JourneyPlanDialog
          key={`${plan.id}-${plan.updatedAt}-${planIntent}`}
          open
          restaurantName={model.name}
          plan={plan}
          startWithRemove={planIntent === "remove"}
          onClose={() => setPlanOpen(false)}
          onSave={savePlanDraft}
          onRemove={() => removePlan(plan.id)}
        />
      ) : null}
      <JourneyVisitDialog
        key={`${plan.id}-${visits.length}`}
        open={visitOpen}
        restaurantName={model.name}
        visit={null}
        plan={plan}
        otherVisits={visits}
        onClose={() => setVisitOpen(false)}
        onSave={saveVisitDraft}
      />
    </section>
  );
}
