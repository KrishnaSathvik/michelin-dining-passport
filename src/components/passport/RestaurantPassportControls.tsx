"use client";

import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { UserRestaurantRecord } from "@/lib/passport/types";

type RestaurantPassportControlsProps = {
  restaurantSlug: string;
};

const toggleClass =
  "min-h-11 rounded-[var(--radius-md)] border border-border bg-bg px-3.5 font-sans text-sm text-ink transition-colors hover:border-forest data-[active=true]:border-forest data-[active=true]:bg-forest data-[active=true]:text-white";

type ToggleKey = "saved" | "wantToVisit" | "planned" | "visited" | "favorite";

type VisitDraft = {
  visitDate: string;
  personalRating: string;
  notes: string;
  dishes: string;
};

type PlanDraft = {
  plannedFor: string;
  provider: string;
  confirmationNote: string;
};

function visitDraftFromRecord(
  record: UserRestaurantRecord | undefined,
): VisitDraft {
  return {
    visitDate: record?.visitDate ?? "",
    personalRating: record?.personalRating?.toString() ?? "",
    notes: record?.notes ?? "",
    dishes: (record?.favoriteDishes ?? []).join(", "),
  };
}

function planDraftFromRecord(
  record: UserRestaurantRecord | undefined,
): PlanDraft {
  return {
    plannedFor: record?.reservationPlannedFor ?? "",
    provider: record?.reservationProvider ?? "",
    confirmationNote: record?.reservationConfirmationNote ?? "",
  };
}

export function RestaurantPassportControls({
  restaurantSlug,
}: RestaurantPassportControlsProps) {
  const { ready, mode, getRecord, updateRestaurant, removeRestaurant } =
    usePassport();
  const record = getRecord(restaurantSlug);
  const visitDialogRef = useRef<HTMLDialogElement>(null);
  const planDialogRef = useRef<HTMLDialogElement>(null);
  const visitTitleId = useId();
  const planTitleId = useId();

  const [visitDraft, setVisitDraft] = useState<VisitDraft>(() =>
    visitDraftFromRecord(undefined),
  );
  const [planDraft, setPlanDraft] = useState<PlanDraft>(() =>
    planDraftFromRecord(undefined),
  );

  if (!ready) {
    return (
      <p className="font-sans text-sm text-ink-muted">Loading passport…</p>
    );
  }

  const toggle = (key: ToggleKey) => {
    updateRestaurant(restaurantSlug, { [key]: !record?.[key] });
  };

  const openVisit = () => {
    setVisitDraft(visitDraftFromRecord(record));
    visitDialogRef.current?.showModal();
  };

  const openPlan = () => {
    setPlanDraft(planDraftFromRecord(record));
    planDialogRef.current?.showModal();
  };

  const saveVisitDetails = () => {
    updateRestaurant(restaurantSlug, {
      visitDate: visitDraft.visitDate || null,
      visited: visitDraft.visitDate ? true : record?.visited,
      personalRating: visitDraft.personalRating
        ? Number(visitDraft.personalRating)
        : null,
      notes: visitDraft.notes,
      favoriteDishes: visitDraft.dishes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });
    visitDialogRef.current?.close();
  };

  const savePlanDetails = () => {
    updateRestaurant(restaurantSlug, {
      reservationPlannedFor: planDraft.plannedFor || null,
      planned: planDraft.plannedFor ? true : record?.planned,
      reservationProvider: planDraft.provider || null,
      reservationConfirmationNote: planDraft.confirmationNote || null,
    });
    planDialogRef.current?.close();
  };

  const hasVisitDetails = Boolean(
    record?.visitDate ||
      record?.personalRating ||
      record?.notes ||
      (record?.favoriteDishes?.length ?? 0) > 0,
  );
  const hasPlanDetails = Boolean(
    record?.reservationPlannedFor ||
      record?.reservationProvider ||
      record?.reservationConfirmationNote,
  );

  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-bg p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-ink">Your passport</h2>
          <p className="mt-1 font-sans text-sm text-ink-muted">
            {mode === "cloud"
              ? "Synced with your account."
              : "Saved on this device."}
          </p>
        </div>
      </div>

      <div
        className="mt-4 flex flex-wrap gap-2"
        role="group"
        aria-label="Passport status"
      >
        {(
          [
            ["saved", "Save"],
            ["wantToVisit", "Want to visit"],
            ["planned", "Planned"],
            ["visited", "Visited"],
            ["favorite", "Favorite"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={toggleClass}
            data-active={Boolean(record?.[key])}
            aria-pressed={Boolean(record?.[key])}
            onClick={() => toggle(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={openVisit}>
          {hasVisitDetails ? "Edit visit details" : "Add visit details"}
        </Button>
        <Button type="button" variant="secondary" onClick={openPlan}>
          {hasPlanDetails ? "Edit planning details" : "Add planning details"}
        </Button>
      </div>

      {(hasVisitDetails || hasPlanDetails) && (
        <ul className="mt-4 space-y-1 font-sans text-sm text-ink-muted">
          {record?.visitDate ? <li>Visited {record.visitDate}</li> : null}
          {record?.reservationPlannedFor ? (
            <li>Planned for {record.reservationPlannedFor}</li>
          ) : null}
          {record?.notes ? <li>Private notes saved</li> : null}
        </ul>
      )}

      {record ? (
        <button
          type="button"
          className="mt-5 font-sans text-sm text-burgundy underline underline-offset-4"
          onClick={() => removeRestaurant(restaurantSlug)}
        >
          Remove personal data for this restaurant
        </button>
      ) : null}

      <dialog
        ref={visitDialogRef}
        aria-labelledby={visitTitleId}
        className="m-auto w-[min(100%,28rem)] rounded-[var(--radius-lg)] border border-border bg-bg p-0 shadow-[var(--shadow-float)] backdrop:bg-ink/40"
      >
        <form
          className="space-y-4 p-5 sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            saveVisitDetails();
          }}
        >
          <h3 id={visitTitleId} className="font-display text-2xl text-ink">
            Visit details
          </h3>
          <p className="font-sans text-sm text-ink-muted">
            Private notes stay on your passport. They are never published.
          </p>
          <label className="block font-sans text-sm text-ink">
            Visit date
            <input
              type="date"
              className="mt-2 min-h-11 w-full rounded-[var(--radius-md)] border border-border bg-bg px-3"
              value={visitDraft.visitDate}
              onChange={(event) =>
                setVisitDraft((prev) => ({
                  ...prev,
                  visitDate: event.target.value,
                }))
              }
            />
          </label>
          <label className="block font-sans text-sm text-ink">
            Personal rating
            <select
              className="mt-2 min-h-11 w-full rounded-[var(--radius-md)] border border-border bg-bg px-3"
              value={visitDraft.personalRating}
              onChange={(event) =>
                setVisitDraft((prev) => ({
                  ...prev,
                  personalRating: event.target.value,
                }))
              }
            >
              <option value="">Unset</option>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value} / 5
                </option>
              ))}
            </select>
          </label>
          <label className="block font-sans text-sm text-ink">
            Private notes
            <textarea
              className="mt-2 min-h-24 w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2"
              value={visitDraft.notes}
              onChange={(event) =>
                setVisitDraft((prev) => ({
                  ...prev,
                  notes: event.target.value,
                }))
              }
            />
          </label>
          <label className="block font-sans text-sm text-ink">
            Favorite dishes
            <input
              type="text"
              className="mt-2 min-h-11 w-full rounded-[var(--radius-md)] border border-border bg-bg px-3"
              placeholder="Comma-separated"
              value={visitDraft.dishes}
              onChange={(event) =>
                setVisitDraft((prev) => ({
                  ...prev,
                  dishes: event.target.value,
                }))
              }
            />
          </label>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => visitDialogRef.current?.close()}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save visit details
            </Button>
          </div>
        </form>
      </dialog>

      <dialog
        ref={planDialogRef}
        aria-labelledby={planTitleId}
        className="m-auto w-[min(100%,28rem)] rounded-[var(--radius-lg)] border border-border bg-bg p-0 shadow-[var(--shadow-float)] backdrop:bg-ink/40"
      >
        <form
          className="space-y-4 p-5 sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            savePlanDetails();
          }}
        >
          <h3 id={planTitleId} className="font-display text-2xl text-ink">
            Planning details
          </h3>
          <p className="font-sans text-sm text-ink-muted">
            Optional private planning fields. External reserve links do not
            confirm a booking.
          </p>
          <label className="block font-sans text-sm text-ink">
            Planned for
            <input
              type="date"
              className="mt-2 min-h-11 w-full rounded-[var(--radius-md)] border border-border bg-bg px-3"
              value={planDraft.plannedFor}
              onChange={(event) =>
                setPlanDraft((prev) => ({
                  ...prev,
                  plannedFor: event.target.value,
                }))
              }
            />
          </label>
          <label className="block font-sans text-sm text-ink">
            Provider
            <input
              type="text"
              className="mt-2 min-h-11 w-full rounded-[var(--radius-md)] border border-border bg-bg px-3"
              placeholder="Resy, Tock, phone…"
              value={planDraft.provider}
              onChange={(event) =>
                setPlanDraft((prev) => ({
                  ...prev,
                  provider: event.target.value,
                }))
              }
            />
          </label>
          <label className="block font-sans text-sm text-ink">
            Confirmation note
            <input
              type="text"
              maxLength={280}
              className="mt-2 min-h-11 w-full rounded-[var(--radius-md)] border border-border bg-bg px-3"
              placeholder="Short private note only"
              value={planDraft.confirmationNote}
              onChange={(event) =>
                setPlanDraft((prev) => ({
                  ...prev,
                  confirmationNote: event.target.value,
                }))
              }
            />
          </label>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => planDialogRef.current?.close()}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save planning details
            </Button>
          </div>
        </form>
      </dialog>
    </section>
  );
}
