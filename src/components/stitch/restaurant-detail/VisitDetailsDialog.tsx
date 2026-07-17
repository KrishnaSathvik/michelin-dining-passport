"use client";

import { useState } from "react";
import { Button } from "@/components/stitch/Button";
import { Dialog } from "@/components/stitch/Dialog";
import { Input } from "@/components/stitch/Input";
import { michelinDistinctionTitle } from "@/components/stitch/restaurant";
import type { UserRestaurantRecord } from "@/lib/passport/types";

export type VisitDraft = {
  visitDate: string;
  notes: string;
  dishes: string;
  favorite: boolean;
  visited: boolean;
  /** Preserved when saving — not shown in Stitch visit dialog. */
  personalRating: string;
};

type VisitDetailsDialogProps = {
  open: boolean;
  onClose: () => void;
  restaurantName: string;
  stars: 1 | 2 | 3;
  record: UserRestaurantRecord | undefined;
  onSave: (draft: VisitDraft) => void;
};

export function visitDraftFromRecord(
  record: UserRestaurantRecord | undefined,
): VisitDraft {
  return {
    visitDate: record?.visitDate ?? "",
    notes: record?.notes ?? "",
    dishes: (record?.favoriteDishes ?? []).join(", "),
    favorite: Boolean(record?.favorite),
    visited: Boolean(record?.visited || record?.visitDate),
    personalRating: record?.personalRating?.toString() ?? "",
  };
}

/**
 * Record-your-visit dialog (~560px). Uses Phase 1 Dialog (sheet on mobile).
 * Remount via `key` when opening so the draft rehydrates without an effect.
 */
export function VisitDetailsDialog({
  open,
  onClose,
  restaurantName,
  stars,
  record,
  onSave,
}: VisitDetailsDialogProps) {
  const [draft, setDraft] = useState(() => visitDraftFromRecord(record));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Record your visit"
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
            Save visit
          </Button>
        </div>
      }
    >
      <div className="space-y-[18px]" data-visit-dialog>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-sans text-base text-dp-ink-secondary">
            {restaurantName}
          </span>
          <span className="rounded-[var(--dp-radius-md)] bg-[color-mix(in_srgb,var(--dp-star-gold)_24%,white)] px-1.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-dp-ink-secondary">
            {michelinDistinctionTitle(stars)}
          </span>
        </div>

        <Input
          label="Visit date"
          type="date"
          value={draft.visitDate}
          onChange={(event) =>
            setDraft((prev) => ({
              ...prev,
              visitDate: event.target.value,
              visited: event.target.value ? true : prev.visited,
            }))
          }
        />

        <label className="flex w-full flex-col gap-2">
          <span className="dp-label-caps text-dp-ink-muted">
            Favorite dishes
          </span>
          <textarea
            className="min-h-[80px] w-full rounded-[var(--dp-radius-md)] border border-dp-border bg-dp-surface p-4 font-sans text-[16px] text-dp-ink"
            placeholder="e.g. Signature tasting courses you loved"
            value={draft.dishes}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, dishes: event.target.value }))
            }
          />
        </label>

        <label className="flex w-full flex-col gap-2">
          <span className="dp-label-caps text-dp-ink-muted">Private notes</span>
          <textarea
            className="min-h-[80px] w-full rounded-[var(--dp-radius-md)] border border-dp-border bg-dp-surface p-4 font-sans text-[16px] text-dp-ink"
            placeholder="Add your personal thoughts…"
            value={draft.notes}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, notes: event.target.value }))
            }
          />
        </label>

        <div className="flex items-center justify-between gap-3 py-2">
          <span className="font-sans text-base text-dp-ink">
            Mark as favorite
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={draft.favorite}
            aria-label={
              draft.favorite ? "Unmark as favorite" : "Mark as favorite"
            }
            className={`relative h-6 w-12 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus ${
              draft.favorite ? "bg-dp-primary" : "bg-dp-border"
            }`}
            onClick={() =>
              setDraft((prev) => ({ ...prev, favorite: !prev.favorite }))
            }
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-dp-surface transition-transform ${
                draft.favorite ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center gap-2 text-dp-primary">
          <span aria-hidden="true">✓</span>
          <span className="dp-label-caps">
            Status: {draft.visited || draft.visitDate ? "Visited" : "Not visited"}
          </span>
        </div>
      </div>
    </Dialog>
  );
}
