"use client";

import type { UserRestaurantRecord } from "@/lib/passport/types";

type RestaurantJourneySectionProps = {
  record: UserRestaurantRecord | undefined;
  mode: "local" | "cloud";
  onOpenPlan: () => void;
  onOpenVisit: () => void;
  formatDate: (iso: string | null | undefined) => string | null;
};

/**
 * Compact first-level summary of the user's relationship with the restaurant.
 * Private notes stay private — only a presence hint is shown.
 */
export function RestaurantJourneySection({
  record,
  mode,
  onOpenPlan,
  onOpenVisit,
  formatDate,
}: RestaurantJourneySectionProps) {
  const plannedLabel = formatDate(record?.reservationPlannedFor);
  const visitLabel = formatDate(record?.visitDate);
  const hasVisitDetails = Boolean(
    record?.visitDate ||
      record?.notes ||
      (record?.favoriteDishes?.length ?? 0) > 0,
  );
  const hasPlanDetails = Boolean(
    record?.reservationPlannedFor ||
      record?.reservationProvider ||
      record?.reservationConfirmationNote,
  );

  const chips: string[] = [];
  if (record?.saved) chips.push("Saved");
  if (record?.wantToVisit) chips.push("Want to visit");
  if (record?.planned) {
    chips.push(plannedLabel ? `Planned for ${plannedLabel}` : "Planned");
  }
  if (record?.visited) {
    chips.push(visitLabel ? `Visited ${visitLabel}` : "Visited");
  }
  if (record?.favorite) chips.push("Favorite");

  return (
    <div className="mt-5" data-journey-summary>
      <p className="font-sans text-xs text-dp-ink-muted">
        {mode === "cloud"
          ? "Synced with your account."
          : "Saved on this device."}
      </p>

      {chips.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-2 font-sans text-sm text-dp-ink-secondary">
          {chips.map((chip) => (
            <li
              key={chip}
              className="rounded-[var(--dp-radius-md)] bg-dp-soft px-2.5 py-1"
            >
              {chip}
            </li>
          ))}
        </ul>
      ) : null}

      {record?.notes || (record?.favoriteDishes?.length ?? 0) > 0 ? (
        <p className="mt-2 font-sans text-sm text-dp-ink-muted">
          Private visit notes saved
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          className="min-h-11 font-sans text-sm font-medium text-dp-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          onClick={onOpenPlan}
        >
          {hasPlanDetails ? "Edit plan" : "Add planning details"}
        </button>
        <button
          type="button"
          className="min-h-11 font-sans text-sm font-medium text-dp-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          onClick={onOpenVisit}
        >
          {hasVisitDetails ? "Edit visit" : "Record visit"}
        </button>
      </div>
    </div>
  );
}
