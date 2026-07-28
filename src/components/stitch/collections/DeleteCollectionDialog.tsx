"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/stitch/Button";
import { Dialog } from "@/components/stitch/Dialog";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { LocalCollection } from "@/lib/passport/types";

type DeleteCollectionDialogProps = {
  open: boolean;
  onClose: () => void;
  collection: LocalCollection;
  /** Detail page returns to the index after deleting; index cards stay put. */
  redirectToIndex?: boolean;
};

/**
 * Deletes the collection and its memberships only. Saved bookmarks, plans, and
 * visits for the member restaurants are deliberately preserved.
 */
export function DeleteCollectionDialog({
  open,
  onClose,
  collection,
  redirectToIndex = false,
}: DeleteCollectionDialogProps) {
  const { removeCollection } = usePassport();
  const router = useRouter();

  const confirm = () => {
    removeCollection(collection.id);
    onClose();
    if (redirectToIndex) router.push("/collections");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Delete this collection?"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={confirm}
            className="!border-dp-error !bg-dp-error hover:!bg-[color-mix(in_srgb,var(--dp-error)_88%,black)]"
            data-destructive="true"
          >
            Delete collection
          </Button>
        </div>
      }
    >
      <div className="space-y-3" data-collections-dialog="delete">
        <p className="font-sans text-[16px] leading-relaxed text-dp-ink">
          Delete <span className="font-semibold">{collection.name}</span>? The
          restaurants will remain saved in My Restaurants.
        </p>
        <p className="font-sans text-[14px] leading-relaxed text-dp-ink-muted">
          Your plans, recorded visits, and private notes are not affected. This
          cannot be undone.
        </p>
      </div>
    </Dialog>
  );
}
