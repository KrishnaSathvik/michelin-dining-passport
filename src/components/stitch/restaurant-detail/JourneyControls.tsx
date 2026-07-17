"use client";

import { useState, useTransition } from "react";
import { usePassport } from "@/lib/passport/PassportProvider";
import {
  PlanningDetailsDialog,
  type PlanDraft,
} from "./PlanningDetailsDialog";
import {
  VisitDetailsDialog,
  type VisitDraft,
} from "./VisitDetailsDialog";
import { RestaurantJourneySection } from "./RestaurantJourneySection";

type JourneyControlsProps = {
  restaurantSlug: string;
  restaurantName: string;
  stars: 1 | 2 | 3;
};

type ToggleKey = "saved" | "wantToVisit" | "planned" | "visited" | "favorite";

type JourneyAction = {
  key: ToggleKey;
  label: string;
  shortLabel: string;
  icon: string;
  activeIcon?: string;
};

const ACTIONS: JourneyAction[] = [
  { key: "saved", label: "Save", shortLabel: "Save", icon: "☆", activeIcon: "★" },
  {
    key: "wantToVisit",
    label: "Want to visit",
    shortLabel: "Want",
    icon: "⚑",
  },
  { key: "planned", label: "Planned", shortLabel: "Planned", icon: "◷" },
  { key: "visited", label: "Visited", shortLabel: "Visited", icon: "✓" },
  { key: "favorite", label: "Favorite", shortLabel: "Favorite", icon: "♡", activeIcon: "♥" },
];

function formatSummaryDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });
}

/**
 * Circular Stitch journey controls + progressive disclosure dialogs.
 * Passport mutations go through usePassport — no independent local store.
 */
export function JourneyControls({
  restaurantSlug,
  restaurantName,
  stars,
}: JourneyControlsProps) {
  const { ready, mode, getRecord, updateRestaurant } = usePassport();
  const record = getRecord(restaurantSlug);
  const [pendingKey, setPendingKey] = useState<ToggleKey | null>(null);
  const [pending, startTransition] = useTransition();
  const [planOpen, setPlanOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [error, setError] = useState(false);

  const toggle = (key: ToggleKey) => {
    if (!ready || pending) return;
    const next = !record?.[key];
    setPendingKey(key);
    setError(false);
    startTransition(() => {
      try {
        updateRestaurant(restaurantSlug, { [key]: next });
        if (key === "planned" && next) setPlanOpen(true);
        if (key === "visited" && next) setVisitOpen(true);
      } catch {
        setError(true);
      } finally {
        setPendingKey(null);
      }
    });
  };

  const savePlan = (draft: PlanDraft) => {
    updateRestaurant(restaurantSlug, {
      reservationPlannedFor: draft.plannedFor || null,
      planned: draft.plannedFor ? true : Boolean(record?.planned),
      reservationProvider: draft.provider || null,
      reservationConfirmationNote: draft.confirmationNote || null,
    });
  };

  const saveVisit = (draft: VisitDraft) => {
    updateRestaurant(restaurantSlug, {
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
        : record?.personalRating ?? null,
    });
  };

  if (!ready) {
    return (
      <div className="mt-8 border-t border-dp-border pt-6">
        <p className="dp-label-caps mb-4 text-dp-ink-muted">Your Journey</p>
        <p className="font-sans text-sm text-dp-ink-muted">Loading passport…</p>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-dp-border pt-6" data-journey-controls>
      <p className="dp-label-caps mb-4 text-dp-ink-muted">Your Journey</p>
      <div
        className="flex flex-wrap items-start gap-4 sm:gap-6"
        role="group"
        aria-label="Personal dining journey"
      >
        {ACTIONS.map((action) => {
          const active = Boolean(record?.[action.key]);
          const busy = pending && pendingKey === action.key;
          const icon =
            active && action.activeIcon ? action.activeIcon : action.icon;
          return (
            <button
              key={action.key}
              type="button"
              className={`group flex min-h-11 min-w-[3.25rem] flex-col items-center gap-1 text-dp-ink-secondary transition-colors hover:text-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus ${
                active ? "text-dp-primary" : ""
              } ${busy ? "opacity-70" : ""}`}
              aria-pressed={active}
              aria-label={`${action.label}${active ? ", on" : ", off"}`}
              aria-busy={busy || undefined}
              disabled={pending}
              title={error ? "Could not update — try again" : action.label}
              onClick={() => toggle(action.key)}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full border bg-dp-surface text-lg transition-colors group-hover:border-dp-primary ${
                  active
                    ? "border-dp-primary bg-[color-mix(in_srgb,var(--dp-primary)_8%,white)]"
                    : "border-dp-border"
                }`}
                aria-hidden="true"
              >
                {icon}
              </span>
              <span className="font-sans text-[12px] leading-tight">
                {action.shortLabel}
              </span>
            </button>
          );
        })}
      </div>

      <RestaurantJourneySection
        record={record}
        mode={mode}
        onOpenPlan={() => setPlanOpen(true)}
        onOpenVisit={() => setVisitOpen(true)}
        formatDate={formatSummaryDate}
      />

      {planOpen ? (
        <PlanningDetailsDialog
          key={`plan-${record?.updatedAt ?? "new"}`}
          open
          onClose={() => setPlanOpen(false)}
          restaurantName={restaurantName}
          stars={stars}
          record={record}
          onSave={savePlan}
        />
      ) : null}
      {visitOpen ? (
        <VisitDetailsDialog
          key={`visit-${record?.updatedAt ?? "new"}`}
          open
          onClose={() => setVisitOpen(false)}
          restaurantName={restaurantName}
          stars={stars}
          record={record}
          onSave={saveVisit}
        />
      ) : null}
    </div>
  );
}
