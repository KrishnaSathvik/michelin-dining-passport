"use client";

import { useMemo, useState } from "react";
import {
  JourneyVisitDialog,
  type VisitFormDraft,
} from "@/components/passport-actions/JourneyDialogs";
import { usePassport } from "@/lib/passport/PassportProvider";
import { classifyPlan } from "@/lib/passport/journey";
import type { RestaurantVisit } from "@/lib/passport/types";

type RestaurantPassportSummaryProps = {
  restaurantSlug: string;
  restaurantName: string;
};

function localToday(): string {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatDate(value: string | null): string {
  if (!value) return "Date not recorded";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function visitId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `visit:${crypto.randomUUID()}`
    : `visit:${Date.now()}`;
}

export function RestaurantPassportSummary({
  restaurantSlug,
  restaurantName,
}: RestaurantPassportSummaryProps) {
  const {
    ready,
    mode,
    store,
    addVisit,
    editVisit,
    deleteVisit,
    removePlan,
    syncStatus,
    retrySync,
  } = usePassport();
  const [selectedVisit, setSelectedVisit] =
    useState<RestaurantVisit | null>(null);
  const [addingVisit, setAddingVisit] = useState(false);
  const plans = Object.values(store.plans)
    .filter((plan) => plan.restaurantSlug === restaurantSlug)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const plan = plans[0] ?? null;
  const visits = useMemo(
    () =>
      Object.values(store.visits)
        .filter((visit) => visit.restaurantSlug === restaurantSlug)
        .sort((a, b) =>
          (b.visitDate ?? b.createdAt).localeCompare(
            a.visitDate ?? a.createdAt,
          ),
        ),
    [restaurantSlug, store.visits],
  );
  const collections = Object.values(store.collections).filter((collection) =>
    collection.restaurantSlugs.includes(restaurantSlug),
  );
  const meaningful =
    Boolean(plan) ||
    visits.length > 0 ||
    collections.length > 0 ||
    syncStatus === "failed" ||
    syncStatus === "pending";

  if (!ready || !meaningful) return null;

  const latest = visits[0] ?? null;
  const planStatus = plan
    ? classifyPlan(plan.plannedDate, localToday())
    : null;

  const saveVisit = (
    draft: VisitFormDraft,
    completePlan: boolean,
  ) => {
    if (selectedVisit) {
      editVisit(selectedVisit.id, {
        visitDate: draft.visitDate,
        favoriteDishes: draft.favoriteDishes,
        privateNotes: draft.privateNotes,
        wouldReturn: draft.wouldReturn,
        personalFavorite: draft.personalFavorite,
      });
    } else {
      addVisit({
        id: visitId(),
        restaurantSlug,
        visitDate: draft.visitDate,
        favoriteDishes: draft.favoriteDishes,
        privateNotes: draft.privateNotes,
        wouldReturn: draft.wouldReturn,
        personalFavorite: draft.personalFavorite,
      });
    }
    if (completePlan && plan) removePlan(plan.id);
  };

  return (
    <section
      className="mb-[var(--dp-section)] border-y border-dp-border py-8 md:py-10"
      aria-labelledby="restaurant-passport-heading"
      data-restaurant-passport-summary
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="dp-label-caps text-dp-ink-muted">Private dining record</p>
          <h2
            id="restaurant-passport-heading"
            className="dp-headline-md mt-2 text-dp-primary-deep"
          >
            My Restaurants
          </h2>
        </div>
        <p className="font-sans text-sm text-dp-ink-muted">
          {mode === "local" ? "Stored on this device · " : ""}
          Private to My Restaurants
        </p>
      </div>

      <div className="mt-7 grid min-w-0 gap-6 lg:grid-cols-2">
        {plan ? (
          <article className="min-w-0 rounded-[var(--dp-radius-xl)] bg-dp-surface-low p-5 sm:p-6">
            <p className="dp-label-caps text-dp-ink-muted">
              {planStatus === "needs-update" || planStatus === "past"
                ? "Needs update"
                : "Upcoming plan"}
            </p>
            <p className="mt-3 font-display text-2xl text-dp-ink">
              Planned · {formatDate(plan.plannedDate)}
            </p>
            {plan.plannedTime ? (
              <p className="mt-2 font-sans text-sm text-dp-ink-secondary">
                Time · {plan.plannedTime}
              </p>
            ) : null}
            {plan.reservationProvider ? (
              <p className="mt-2 font-sans text-sm text-dp-ink-secondary">
                Reservation via {plan.reservationProvider}
                {plan.confirmationReference ? " · Reference saved privately" : ""}
              </p>
            ) : null}
            {planStatus === "needs-update" || planStatus === "past" ? (
              <p className="mt-4 font-sans text-sm leading-relaxed text-dp-ink-muted">
                The planned date passed. Record the visit, reschedule, or remove
                the plan from the action group above.
              </p>
            ) : null}
          </article>
        ) : null}

        {latest ? (
          <article className="min-w-0 rounded-[var(--dp-radius-xl)] bg-dp-surface-low p-5 sm:p-6">
            <p className="dp-label-caps text-dp-ink-muted">Visit history</p>
            <p className="mt-3 font-display text-2xl text-dp-ink">
              {visits.length === 1
                ? `Visited · ${formatDate(latest.visitDate)}`
                : `Visited ${visits.length === 2 ? "twice" : `${visits.length} times`}`}
            </p>
            {visits.length > 1 ? (
              <p className="mt-2 font-sans text-sm text-dp-ink-secondary">
                Last visited · {formatDate(latest.visitDate)}
              </p>
            ) : null}
            {latest.favoriteDishes ? (
              <p className="mt-4 line-clamp-2 font-sans text-sm leading-relaxed text-dp-ink-secondary">
                Favorite dishes · {latest.favoriteDishes}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {latest.wouldReturn === true ? (
                <span className="rounded-full bg-dp-surface px-3 py-1 font-sans text-xs text-dp-primary">
                  Would return
                </span>
              ) : null}
              {latest.wouldReturn === false ? (
                <span className="rounded-full bg-dp-surface px-3 py-1 font-sans text-xs text-dp-ink-secondary">
                  Would not return
                </span>
              ) : null}
              {latest.personalFavorite ? (
                <span className="rounded-full bg-dp-surface px-3 py-1 font-sans text-xs text-dp-primary">
                  Personal favorite
                </span>
              ) : null}
            </div>
            <div className="mt-5 flex flex-wrap gap-4">
              <button
                type="button"
                className="min-h-11 font-sans text-sm font-semibold text-dp-primary underline-offset-4 hover:underline"
                onClick={() => setSelectedVisit(latest)}
              >
                Edit latest visit
              </button>
              <button
                type="button"
                className="min-h-11 font-sans text-sm font-semibold text-dp-primary underline-offset-4 hover:underline"
                onClick={() => setAddingVisit(true)}
              >
                Add another visit
              </button>
            </div>
          </article>
        ) : null}
      </div>

      {collections.length > 0 ? (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="font-sans text-sm text-dp-ink-muted">
            In collections:
          </span>
          {collections.map((collection) => (
            <span
              key={collection.id}
              className="rounded-full border border-dp-border px-3 py-1 font-sans text-sm text-dp-ink-secondary"
            >
              {collection.name}
            </span>
          ))}
        </div>
      ) : null}

      {syncStatus === "pending" ? (
        <p className="mt-5 font-sans text-sm text-dp-ink-muted" role="status">
          Sync pending
        </p>
      ) : null}
      {syncStatus === "failed" ? (
        <div className="mt-5 flex flex-wrap items-center gap-3" role="alert">
          <p className="font-sans text-sm text-dp-error">Couldn’t sync</p>
          <button
            type="button"
            className="min-h-11 font-sans text-sm font-semibold text-dp-error underline"
            onClick={retrySync}
          >
            Retry
          </button>
        </div>
      ) : null}

      <JourneyVisitDialog
        key={
          selectedVisit
            ? `${selectedVisit.id}-${selectedVisit.updatedAt}`
            : `new-${visits.length}`
        }
        open={Boolean(selectedVisit) || addingVisit}
        restaurantName={restaurantName}
        visit={selectedVisit}
        plan={selectedVisit ? null : plan}
        otherVisits={visits}
        onClose={() => {
          setSelectedVisit(null);
          setAddingVisit(false);
        }}
        onSave={saveVisit}
        onDelete={
          selectedVisit
            ? () => {
                deleteVisit(selectedVisit.id);
                setSelectedVisit(null);
              }
            : undefined
        }
      />
    </section>
  );
}
