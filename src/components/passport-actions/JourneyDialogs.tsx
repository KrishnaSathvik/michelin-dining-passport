"use client";

import { useId, useMemo, useState } from "react";
import { Button } from "@/components/stitch/Button";
import { Dialog } from "@/components/stitch/Dialog";
import { Input } from "@/components/stitch/Input";
import type {
  RestaurantPlan,
  RestaurantVisit,
} from "@/lib/passport/types";

export type PlanFormDraft = {
  plannedDate: string;
  plannedTime: string;
  reservationProvider: string;
  confirmationReference: string;
  privateNotes: string;
};

export type VisitFormDraft = {
  visitDate: string;
  favoriteDishes: string;
  privateNotes: string;
  wouldReturn: boolean | null;
  personalFavorite: boolean;
};

function localToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysBetween(start: string, end: string): number {
  return Math.round(
    (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) /
      86_400_000,
  );
}

type JourneyPlanDialogProps = {
  open: boolean;
  restaurantName: string;
  plan: RestaurantPlan | null;
  onClose: () => void;
  onSave: (draft: PlanFormDraft) => void;
  onRemove?: () => void;
  startWithRemove?: boolean;
};

export function JourneyPlanDialog({
  open,
  restaurantName,
  plan,
  onClose,
  onSave,
  onRemove,
  startWithRemove = false,
}: JourneyPlanDialogProps) {
  const formId = useId();
  const [confirmRemove, setConfirmRemove] = useState(startWithRemove);
  const [draft, setDraft] = useState<PlanFormDraft>(() => ({
    plannedDate: plan?.plannedDate ?? "",
    plannedTime: plan?.plannedTime ?? "",
    reservationProvider: plan?.reservationProvider ?? "",
    confirmationReference: plan?.confirmationReference ?? "",
    privateNotes: plan?.privateNotes ?? "",
  }));
  const [error, setError] = useState<string | null>(null);

  if (confirmRemove && plan && onRemove) {
    return (
      <Dialog
        open={open}
        onClose={() => setConfirmRemove(false)}
        title="Remove plan?"
        description={`This removes the plan for ${restaurantName}. It does not cancel a restaurant reservation.`}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setConfirmRemove(false)}
            >
              Keep plan
            </Button>
            <Button
              className="border-dp-error bg-dp-error hover:bg-dp-error"
              onClick={() => {
                onRemove();
                onClose();
              }}
            >
              Remove plan
            </Button>
          </div>
        }
      >
        <p className="font-sans text-base text-dp-ink-secondary">
          Your saved restaurant, past visits, and collection memberships will
          remain in My Restaurants.
        </p>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={plan ? "Edit your plan" : "Plan a visit"}
      description={`${restaurantName} · Private planning details`}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {plan && onRemove ? (
            <Button
              variant="ghost"
              className="text-dp-error"
              onClick={() => setConfirmRemove(true)}
            >
              Remove plan
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" form={formId}>
              {plan ? "Save changes" : "Save plan"}
            </Button>
          </div>
        </div>
      }
    >
      <form
        id={formId}
        className="space-y-5"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.plannedDate) {
            setError("Choose a date for this plan.");
            return;
          }
          if (draft.plannedDate < localToday()) {
            setError("Choose today or a future date.");
            return;
          }
          setError(null);
          onSave(draft);
          onClose();
        }}
      >
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-[1fr_10rem]">
          <Input
            label="Planned date"
            name="planned-date"
            type="date"
            data-dialog-initial-focus
            min={localToday()}
            required
            value={draft.plannedDate}
            error={error ?? undefined}
            onChange={(event) => {
              setDraft((current) => ({
                ...current,
                plannedDate: event.target.value,
              }));
              setError(null);
            }}
          />
          <Input
            label="Time (optional)"
            name="planned-time"
            type="time"
            value={draft.plannedTime}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                plannedTime: event.target.value,
              }))
            }
          />
        </div>
        <Input
          label="Reservation provider (optional)"
          name="reservation-provider"
          maxLength={80}
          placeholder="Tock, OpenTable, restaurant"
          value={draft.reservationProvider}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              reservationProvider: event.target.value,
            }))
          }
        />
        <Input
          label="Confirmation reference (optional)"
          name="confirmation-reference"
          maxLength={120}
          autoComplete="off"
          value={draft.confirmationReference}
          hint="Private and masked outside editing."
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              confirmationReference: event.target.value,
            }))
          }
        />
        <label className="flex min-w-0 flex-col gap-2">
          <span className="dp-label-caps text-dp-ink-muted">
            Private planning notes (optional)
          </span>
          <textarea
            name="planning-notes"
            rows={5}
            maxLength={2000}
            value={draft.privateNotes}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                privateNotes: event.target.value,
              }))
            }
            className="min-h-28 w-full min-w-0 resize-y rounded-[var(--dp-radius-md)] border border-dp-border bg-dp-surface p-4 font-sans text-base text-dp-ink"
          />
          <span className="font-sans text-xs text-dp-ink-muted">
            {draft.privateNotes.length.toLocaleString()} / 2,000
          </span>
        </label>
      </form>
    </Dialog>
  );
}

type JourneyVisitDialogProps = {
  open: boolean;
  restaurantName: string;
  visit: RestaurantVisit | null;
  plan: RestaurantPlan | null;
  otherVisits: RestaurantVisit[];
  onClose: () => void;
  onSave: (draft: VisitFormDraft, completePlan: boolean) => void;
  onDelete?: () => void;
  startWithDelete?: boolean;
};

export function JourneyVisitDialog({
  open,
  restaurantName,
  visit,
  plan,
  otherVisits,
  onClose,
  onSave,
  onDelete,
  startWithDelete = false,
}: JourneyVisitDialogProps) {
  const formId = useId();
  const initialDate =
    visit?.visitDate ??
    (plan?.plannedDate && plan.plannedDate <= localToday()
      ? plan.plannedDate
      : localToday());
  const [confirmDelete, setConfirmDelete] = useState(startWithDelete);
  const [draft, setDraft] = useState<VisitFormDraft>(() => ({
    visitDate: initialDate,
    favoriteDishes: visit?.favoriteDishes ?? "",
    privateNotes: visit?.privateNotes ?? "",
    wouldReturn: visit?.wouldReturn ?? null,
    personalFavorite: visit?.personalFavorite ?? false,
  }));
  const [error, setError] = useState<string | null>(null);
  const canCompletePlan = useMemo(() => {
    if (!plan?.plannedDate || !draft.visitDate) return false;
    const difference = daysBetween(plan.plannedDate, draft.visitDate);
    return difference >= 0 && difference <= 7;
  }, [draft.visitDate, plan?.plannedDate]);
  const [completePlan, setCompletePlan] = useState(
    Boolean(
      plan?.plannedDate &&
        initialDate &&
        daysBetween(plan.plannedDate, initialDate) >= 0 &&
        daysBetween(plan.plannedDate, initialDate) <= 7,
    ),
  );
  const sameDayDuplicate = otherVisits.some(
    (item) => item.id !== visit?.id && item.visitDate === draft.visitDate,
  );

  if (confirmDelete && visit && onDelete) {
    return (
      <Dialog
        open={open}
        onClose={() => setConfirmDelete(false)}
        title="Delete visit?"
        description={
          visit.visitDate
            ? `Delete your ${new Date(`${visit.visitDate}T12:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })} visit to ${restaurantName}?`
            : `Delete this visit to ${restaurantName} with no recorded date?`
        }
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setConfirmDelete(false)}
            >
              Keep visit
            </Button>
            <Button
              className="border-dp-error bg-dp-error hover:bg-dp-error"
              onClick={() => {
                onDelete();
                onClose();
              }}
            >
              Delete visit
            </Button>
          </div>
        }
      >
        <p className="font-sans text-base text-dp-ink-secondary">
          Other visits, an active plan, and the saved restaurant will remain.
        </p>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={visit ? "Edit your visit" : "Record a visit"}
      description={`Your visit details for ${restaurantName} are private.`}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {visit && onDelete ? (
            <Button
              variant="ghost"
              className="text-dp-error"
              onClick={() => setConfirmDelete(true)}
            >
              Delete visit
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" form={formId}>
              {visit ? "Save changes" : "Save visit"}
            </Button>
          </div>
        </div>
      }
    >
      <form
        id={formId}
        className="space-y-5"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.visitDate) {
            setError("Choose the date you visited.");
            return;
          }
          if (draft.visitDate > localToday()) {
            setError("Visit dates cannot be in the future.");
            return;
          }
          setError(null);
          onSave(draft, canCompletePlan && completePlan);
          onClose();
        }}
      >
        <Input
          label="Visit date"
          name="visit-date"
          type="date"
          data-dialog-initial-focus
          max={localToday()}
          required
          value={draft.visitDate}
          error={error ?? undefined}
          onChange={(event) => {
            setDraft((current) => ({
              ...current,
              visitDate: event.target.value,
            }));
            setError(null);
          }}
        />
        {sameDayDuplicate ? (
          <p
            className="rounded-[var(--dp-radius-md)] border border-dp-outline-variant bg-dp-surface-low px-4 py-3 font-sans text-sm text-dp-ink-secondary"
            role="status"
          >
            You already recorded a visit on this date. You can still save
            another visit for a separate meal.
          </p>
        ) : null}
        {canCompletePlan && plan ? (
          <label className="flex min-h-11 items-start gap-3 rounded-[var(--dp-radius-md)] bg-dp-surface-low p-4">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-dp-primary"
              checked={completePlan}
              onChange={(event) => setCompletePlan(event.target.checked)}
            />
            <span>
              <span className="block font-sans text-sm font-semibold text-dp-ink">
                Remove the completed plan
              </span>
              <span className="mt-1 block font-sans text-xs text-dp-ink-muted">
                Confirm that this visit represents the planned meal.
              </span>
            </span>
          </label>
        ) : null}
        <label className="flex min-w-0 flex-col gap-2">
          <span className="dp-label-caps text-dp-ink-muted">
            Favorite dishes (optional)
          </span>
          <textarea
            name="favorite-dishes"
            rows={3}
            maxLength={500}
            value={draft.favoriteDishes}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                favoriteDishes: event.target.value,
              }))
            }
            className="w-full min-w-0 resize-y rounded-[var(--dp-radius-md)] border border-dp-border bg-dp-surface p-4 font-sans text-base text-dp-ink"
          />
          <span className="font-sans text-xs text-dp-ink-muted">
            {draft.favoriteDishes.length} / 500
          </span>
        </label>
        <label className="flex min-w-0 flex-col gap-2">
          <span className="dp-label-caps text-dp-ink-muted">
            Private notes (optional)
          </span>
          <textarea
            name="visit-notes"
            rows={6}
            maxLength={4000}
            value={draft.privateNotes}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                privateNotes: event.target.value,
              }))
            }
            className="min-h-32 w-full min-w-0 resize-y rounded-[var(--dp-radius-md)] border border-dp-border bg-dp-surface p-4 font-sans text-base text-dp-ink"
          />
          <span className="font-sans text-xs text-dp-ink-muted">
            {draft.privateNotes.length.toLocaleString()} / 4,000
          </span>
        </label>
        <fieldset className="space-y-3">
          <legend className="dp-label-caps text-dp-ink-muted">
            Would you return?
          </legend>
          <div className="flex flex-wrap gap-2">
            {[
              { value: true, label: "Yes" },
              { value: false, label: "No" },
              { value: null, label: "Not set" },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                aria-pressed={draft.wouldReturn === option.value}
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    wouldReturn: option.value,
                  }))
                }
                className={`inline-flex min-h-11 items-center rounded-[var(--dp-radius-md)] border px-4 font-sans text-sm ${
                  draft.wouldReturn === option.value
                    ? "border-dp-primary bg-dp-primary text-dp-on-primary"
                    : "border-dp-border bg-dp-surface text-dp-ink-secondary"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            checked={draft.personalFavorite}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                personalFavorite: event.target.checked,
              }))
            }
            className="h-5 w-5 accent-dp-primary"
          />
          <span className="font-sans text-sm text-dp-ink">
            Mark this visit as a personal favorite
          </span>
        </label>
      </form>
    </Dialog>
  );
}
