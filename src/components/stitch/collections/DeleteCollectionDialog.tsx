"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/stitch/Button";
import { Dialog } from "@/components/stitch/Dialog";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { LocalCollection } from "@/lib/passport/types";

type DeleteCollectionDialogProps = {
  open: boolean;
  onClose: () => void;
  collection: LocalCollection;
};

/**
 * Deletes the collection only. Member restaurants remain in the Passport
 * with Saved / Planned / Visited / Favorite / notes intact.
 */
export function DeleteCollectionDialog({
  open,
  onClose,
  collection,
}: DeleteCollectionDialogProps) {
  const { removeCollection } = usePassport();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleClose = () => {
    if (pending) return;
    onClose();
  };

  const confirmDelete = () => {
    startTransition(() => {
      removeCollection(collection.id);
      onClose();
      router.push("/collections");
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Delete collection?"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={confirmDelete}
            disabled={pending}
            className="!border-dp-error !bg-dp-error hover:!bg-[color-mix(in_srgb,var(--dp-error)_88%,black)]"
            data-destructive="true"
          >
            {pending ? "Deleting…" : "Delete collection"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3" data-collections-dialog="delete">
        <p className="font-sans text-[16px] text-dp-ink">
          Delete <span className="font-semibold">{collection.name}</span>? This
          cannot be undone.
        </p>
        <p className="font-sans text-[14px] text-dp-ink-muted">
          Member restaurants stay in your Passport. Saved, Planned, Visited,
          Favorite, notes, and visit details are not deleted.
        </p>
      </div>
    </Dialog>
  );
}
