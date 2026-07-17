"use client";

import { useTransition } from "react";
import { Button } from "@/components/stitch/Button";
import { Dialog } from "@/components/stitch/Dialog";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { LocalCollection } from "@/lib/passport/types";

type RemoveRestaurantDialogProps = {
  open: boolean;
  onClose: () => void;
  collection: LocalCollection;
  restaurantSlug: string;
  restaurantName: string;
};

/**
 * Removes collection membership only — never unsaves or clears journey state.
 */
export function RemoveRestaurantDialog({
  open,
  onClose,
  collection,
  restaurantSlug,
  restaurantName,
}: RemoveRestaurantDialogProps) {
  const { editCollection, findCollectionBySlug } = usePassport();
  const live = findCollectionBySlug(collection.slug) ?? collection;
  const [pending, startTransition] = useTransition();

  const handleClose = () => {
    if (pending) return;
    onClose();
  };

  const confirm = () => {
    startTransition(() => {
      const next = live.restaurantSlugs.filter(
        (slug) => slug !== restaurantSlug,
      );
      editCollection(live.id, {
        restaurantSlugs: next,
        coverRestaurantSlug:
          live.coverRestaurantSlug === restaurantSlug
            ? (next[0] ?? null)
            : live.coverRestaurantSlug,
      });
      onClose();
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Remove from collection?"
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
            onClick={confirm}
            disabled={pending}
            className="!border-dp-error !bg-dp-error hover:!bg-[color-mix(in_srgb,var(--dp-error)_88%,black)]"
          >
            {pending ? "Removing…" : "Remove from collection"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3" data-collections-dialog="remove-restaurant">
        <p className="font-sans text-[16px] text-dp-ink">
          Remove <span className="font-semibold">{restaurantName}</span> from{" "}
          <span className="font-semibold">{live.name}</span>?
        </p>
        <p className="font-sans text-[14px] text-dp-ink-muted">
          This only removes collection membership. The restaurant stays in your
          Passport with Saved, Planned, Visited, Favorite, and notes unchanged.
        </p>
      </div>
    </Dialog>
  );
}
