"use client";

import { useState } from "react";
import { Button } from "@/components/stitch/Button";
import { Dialog } from "@/components/stitch/Dialog";
import { Input } from "@/components/stitch/Input";
import { michelinDistinctionTitle } from "@/components/stitch/restaurant";
import type { UserRestaurantRecord } from "@/lib/passport/types";

export type PlanDraft = {
  plannedFor: string;
  provider: string;
  confirmationNote: string;
};

type PlanningDetailsDialogProps = {
  open: boolean;
  onClose: () => void;
  restaurantName: string;
  stars: 1 | 2 | 3;
  record: UserRestaurantRecord | undefined;
  onSave: (draft: PlanDraft) => void;
};

export function planDraftFromRecord(
  record: UserRestaurantRecord | undefined,
): PlanDraft {
  return {
    plannedFor: record?.reservationPlannedFor ?? "",
    provider: record?.reservationProvider ?? "",
    confirmationNote: record?.reservationConfirmationNote ?? "",
  };
}

/**
 * Plan-your-visit dialog (~520px). Uses Phase 1 Dialog (sheet on mobile).
 * Remount via `key` when opening so the draft rehydrates without an effect.
 */
export function PlanningDetailsDialog({
  open,
  onClose,
  restaurantName,
  stars,
  record,
  onSave,
}: PlanningDetailsDialogProps) {
  const [draft, setDraft] = useState(() => planDraftFromRecord(record));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Plan your visit"
      footer={
        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            Save plan
          </Button>
        </div>
      }
    >
      <div className="space-y-5" data-planning-dialog>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-sans text-base text-dp-ink-secondary">
            {restaurantName}
          </span>
          <span className="rounded-[var(--dp-radius-md)] bg-[color-mix(in_srgb,var(--dp-star-gold)_24%,white)] px-1.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-dp-ink-secondary">
            {michelinDistinctionTitle(stars)}
          </span>
        </div>

        <Input
          label="Planned date"
          type="date"
          value={draft.plannedFor}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, plannedFor: event.target.value }))
          }
        />
        <Input
          label="Reservation provider"
          type="text"
          placeholder="e.g., Tock, OpenTable"
          value={draft.provider}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, provider: event.target.value }))
          }
        />
        <label className="flex w-full flex-col gap-2">
          <span className="dp-label-caps text-dp-ink-muted">
            Confirmation or reference note
          </span>
          <input
            type="text"
            maxLength={280}
            placeholder="Confirmation #"
            className="h-[var(--dp-control-height)] w-full rounded-[var(--dp-radius-md)] border border-dp-border bg-dp-surface px-4 font-sans text-[16px] text-dp-ink"
            value={draft.confirmationNote}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                confirmationNote: event.target.value,
              }))
            }
          />
          <span className="font-sans text-xs text-dp-ink-muted">
            Private planning details stay on your passport. External reserve
            links do not confirm a booking.
          </span>
        </label>
      </div>
    </Dialog>
  );
}
