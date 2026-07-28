"use client";

import { useMemo, useState } from "react";
import {
  JourneyPlanDialog,
  JourneyVisitDialog,
  type PlanFormDraft,
  type VisitFormDraft,
} from "@/components/passport-actions/JourneyDialogs";
import {
  RemoveFromPassportDialog,
  type RemoveFromPassportConsequences,
} from "@/components/passport-actions/RemoveFromPassportDialog";
import { Button } from "@/components/stitch/Button";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { RestaurantPlan } from "@/lib/passport/types";
import {
  BookmarkCheckIcon,
  BookmarkIcon,
  CalendarIcon,
  CheckCircleIcon,
} from "./ActionIcons";

type RestaurantJourneyActionsProps = {
  restaurantSlug: string;
  restaurantName: string;
};

function formatDate(value: string | null): string | null {
  if (!value) return null;
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

function findPlan(
  plans: Record<string, RestaurantPlan>,
  restaurantSlug: string,
): RestaurantPlan | null {
  return (
    Object.values(plans)
      .filter((plan) => plan.restaurantSlug === restaurantSlug)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null
  );
}

export function RestaurantJourneySaveButton({
  restaurantSlug,
  restaurantName,
  className = "",
}: RestaurantJourneyActionsProps & { className?: string }) {
  const {
    ready,
    store,
    updateRestaurant,
    removeRestaurant,
    syncStatus,
  } = usePassport();
  const [removeOpen, setRemoveOpen] = useState(false);
  const saved = Boolean(store.bookmarks[restaurantSlug]);
  const planCount = Object.values(store.plans).filter(
    (plan) => plan.restaurantSlug === restaurantSlug,
  ).length;
  const visits = Object.values(store.visits).filter(
    (visit) => visit.restaurantSlug === restaurantSlug,
  );
  const collectionCount = Object.values(store.collections).filter(
    (collection) => collection.restaurantSlugs.includes(restaurantSlug),
  ).length;
  const hasDependents = planCount + visits.length + collectionCount > 0;
  const consequences: RemoveFromPassportConsequences = {
    planCount,
    visitCount: visits.length,
    collectionCount,
    hasPrivateDetails:
      Object.values(store.plans).some(
        (plan) =>
          plan.restaurantSlug === restaurantSlug &&
          Boolean(plan.privateNotes || plan.confirmationReference),
      ) ||
      visits.some((visit) =>
        Boolean(visit.privateNotes || visit.favoriteDishes),
      ),
  };

  return (
    <>
      <button
        type="button"
        className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--dp-radius-lg)] border px-5 font-sans text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus ${
          saved
            ? "border-dp-primary bg-dp-surface text-dp-primary"
            : "border-dp-primary bg-dp-primary text-dp-on-primary hover:bg-dp-primary-hover"
        } ${className}`}
        aria-pressed={saved}
        aria-label={
          saved
            ? `${restaurantName} is saved in My Restaurants`
            : `Save ${restaurantName} to My Restaurants`
        }
        disabled={!ready}
        onClick={() => {
          if (!saved) {
            updateRestaurant(restaurantSlug, { saved: true });
            return;
          }
          if (hasDependents) {
            setRemoveOpen(true);
            return;
          }
          updateRestaurant(restaurantSlug, { saved: false });
        }}
      >
        {saved ? <BookmarkCheckIcon /> : <BookmarkIcon />}
        <span>{saved ? "Saved" : "Save"}</span>
        {syncStatus === "pending" ? (
          <span className="font-normal">· Sync pending</span>
        ) : null}
      </button>
      <RemoveFromPassportDialog
        open={removeOpen}
        restaurantName={restaurantName}
        consequences={consequences}
        onClose={() => setRemoveOpen(false)}
        onConfirm={() => {
          removeRestaurant(restaurantSlug);
          setRemoveOpen(false);
        }}
      />
    </>
  );
}

export function RestaurantJourneyActions({
  restaurantSlug,
  restaurantName,
}: RestaurantJourneyActionsProps) {
  const {
    ready,
    mode,
    store,
    savePlan,
    removePlan,
    addVisit,
    retrySync,
    syncStatus,
    syncMessage,
  } = usePassport();
  const [planOpen, setPlanOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const plan = findPlan(store.plans, restaurantSlug);
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

  const onSavePlan = (draft: PlanFormDraft) => {
    savePlan({
      restaurantSlug,
      plannedDate: draft.plannedDate,
      plannedTime: draft.plannedTime || null,
      reservationProvider: draft.reservationProvider.trim() || null,
      confirmationReference: draft.confirmationReference.trim() || null,
      privateNotes: draft.privateNotes,
    });
  };

  const onSaveVisit = (
    draft: VisitFormDraft,
    completePlan: boolean,
  ) => {
    addVisit({
      id: visitId(),
      restaurantSlug,
      visitDate: draft.visitDate,
      favoriteDishes: draft.favoriteDishes,
      privateNotes: draft.privateNotes,
      wouldReturn: draft.wouldReturn,
      personalFavorite: draft.personalFavorite,
    });
    if (completePlan && plan) removePlan(plan.id);
  };

  if (!ready) {
    return (
      <div className="mt-7 border-t border-dp-border pt-6" aria-busy="true">
        <p className="font-sans text-sm text-dp-ink-muted">
          Loading your restaurants…
        </p>
      </div>
    );
  }

  return (
    <div className="mt-7 border-t border-dp-border pt-6" data-restaurant-journey-actions>
      <p className="dp-label-caps text-dp-ink-muted">My Restaurants</p>
      <div
        className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3"
        role="group"
        aria-label={`My Restaurants actions for ${restaurantName}`}
      >
        <RestaurantJourneySaveButton
          restaurantSlug={restaurantSlug}
          restaurantName={restaurantName}
        />
        <Button
          variant="secondary"
          className="min-w-0"
          data-action-edit-plan
          onClick={() => setPlanOpen(true)}
        >
          <CalendarIcon />
          {plan ? "Edit plan" : "Plan a visit"}
        </Button>
        <Button
          variant="secondary"
          className="min-w-0"
          onClick={() => setVisitOpen(true)}
        >
          <CheckCircleIcon />
          {visits.length > 0 ? "Record another visit" : "Record a visit"}
        </Button>
      </div>

      {plan || visits.length > 0 ? (
        <div className="mt-4 space-y-1 font-sans text-sm text-dp-ink-secondary">
          {plan ? (
            <p>Planned · {formatDate(plan.plannedDate) ?? "Date not recorded"}</p>
          ) : null}
          {visits.length > 0 ? (
            <p>
              {visits.length === 1
                ? `Visited · ${formatDate(visits[0].visitDate) ?? "Date not recorded"}`
                : `Visited ${visits.length === 2 ? "twice" : `${visits.length} times`} · Last visited ${formatDate(visits[0].visitDate) ?? "date not recorded"}`}
            </p>
          ) : null}
        </div>
      ) : mode === "local" && Boolean(store.bookmarks[restaurantSlug]) ? (
        <p className="mt-3 font-sans text-xs text-dp-ink-muted">
          Saved on this device
        </p>
      ) : null}

      {syncStatus === "failed" ? (
        <div
          className="mt-4 flex flex-wrap items-center gap-3 rounded-[var(--dp-radius-md)] border border-dp-error/30 bg-dp-error/5 px-4 py-3"
          role="alert"
        >
          <p className="font-sans text-sm text-dp-error">
            {syncMessage ?? "Couldn’t sync your latest change."}
          </p>
          <button
            type="button"
            className="min-h-11 font-sans text-sm font-semibold text-dp-error underline"
            onClick={retrySync}
          >
            Retry
          </button>
        </div>
      ) : null}

      {planOpen ? (
        <JourneyPlanDialog
          key={`${plan?.id ?? "new"}-${plan?.updatedAt ?? "new"}`}
          open
          restaurantName={restaurantName}
          plan={plan}
          onClose={() => setPlanOpen(false)}
          onSave={onSavePlan}
          onRemove={plan ? () => removePlan(plan.id) : undefined}
        />
      ) : null}
      <JourneyVisitDialog
        key={`${plan?.id ?? "no-plan"}-${visits.length}`}
        open={visitOpen}
        restaurantName={restaurantName}
        visit={null}
        plan={plan}
        otherVisits={visits}
        onClose={() => setVisitOpen(false)}
        onSave={onSaveVisit}
      />
    </div>
  );
}
