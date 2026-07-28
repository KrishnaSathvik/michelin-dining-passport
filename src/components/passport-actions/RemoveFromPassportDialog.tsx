"use client";

import { Button } from "@/components/stitch/Button";
import { Dialog } from "@/components/stitch/Dialog";

export type RemoveFromPassportConsequences = {
  planCount: number;
  visitCount: number;
  collectionCount: number;
  hasPrivateDetails: boolean;
};

type RemoveFromPassportDialogProps = {
  open: boolean;
  restaurantName: string;
  consequences: RemoveFromPassportConsequences;
  onClose: () => void;
  onConfirm: () => void;
  pending?: boolean;
};

export function consequencePhrases(
  consequences: RemoveFromPassportConsequences,
): string[] {
  const phrases: string[] = [];
  if (consequences.planCount > 0) {
    phrases.push(
      consequences.planCount === 1
        ? "one upcoming plan"
        : `${consequences.planCount} upcoming plans`,
    );
  }
  if (consequences.visitCount > 0) {
    phrases.push(
      consequences.visitCount === 1
        ? "one recorded visit"
        : consequences.visitCount === 2
          ? "two recorded visits"
          : `${consequences.visitCount} recorded visits`,
    );
  }
  if (consequences.collectionCount > 0) {
    phrases.push(
      consequences.collectionCount === 1
        ? "membership in one collection"
        : `membership in ${consequences.collectionCount} collections`,
    );
  }
  if (consequences.hasPrivateDetails) {
    phrases.push("private planning and visit details");
  }
  return phrases;
}

export function RemoveFromPassportDialog({
  open,
  restaurantName,
  consequences,
  onClose,
  onConfirm,
  pending = false,
}: RemoveFromPassportDialogProps) {
  const phrases = consequencePhrases(consequences);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      closeDisabled={pending}
      title={`Remove ${restaurantName} from My Restaurants?`}
      description="This permanently removes the personal records listed below from this device."
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            data-dialog-initial-focus
            disabled={pending}
            onClick={onClose}
          >
            Keep saved
          </Button>
          <Button
            className="border-dp-error bg-dp-error hover:bg-dp-error"
            disabled={pending}
            aria-busy={pending || undefined}
            onClick={onConfirm}
          >
            {pending ? "Removing…" : "Remove everything"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {phrases.length > 0 ? (
          <ul className="space-y-3 font-sans text-base text-dp-ink-secondary">
            {phrases.map((phrase) => (
              <li key={phrase} className="flex gap-3">
                <span aria-hidden="true" className="text-dp-error">
                  —
                </span>
                <span>{phrase}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-sans text-base text-dp-ink-secondary">
            Your saved bookmark will be removed.
          </p>
        )}
        <p className="border-t border-dp-border pt-4 font-sans text-sm leading-relaxed text-dp-ink-muted">
          This does not cancel a restaurant reservation or delete the
          collections themselves.
        </p>
      </div>
    </Dialog>
  );
}
