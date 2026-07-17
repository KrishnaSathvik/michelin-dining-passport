"use client";

import { useState, useTransition } from "react";
import { requestAccountDeletionAction } from "@/app/personal-data/actions";
import { Button } from "@/components/stitch/Button";
import { Dialog } from "@/components/stitch/Dialog";
import { Input } from "@/components/stitch/Input";

type DeleteAccountDialogProps = {
  open: boolean;
  onClose: () => void;
  onError: (message: string) => void;
};

export function DeleteAccountDialog({
  open,
  onClose,
  onError,
}: DeleteAccountDialogProps) {
  const [phrase, setPhrase] = useState("");
  const [pending, startTransition] = useTransition();

  const handleClose = () => {
    if (pending) return;
    setPhrase("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Delete Account?"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={handleClose}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            fullWidth
            disabled={pending || phrase.trim().toUpperCase() !== "DELETE"}
            className="!border-dp-error !bg-dp-error hover:!bg-[color-mix(in_srgb,var(--dp-error)_88%,black)]"
            data-destructive="true"
            onClick={() => {
              startTransition(async () => {
                const result = await requestAccountDeletionAction(phrase);
                if (result.ok) {
                  window.location.href = "/";
                  return;
                }
                onError(result.message ?? "Deletion failed.");
                setPhrase("");
                onClose();
              });
            }}
          >
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4" data-account-dialog="delete">
        <p className="font-sans text-[16px] text-dp-ink">
          This permanently deletes your authentication account and cloud
          Passport records (personal restaurants and collections).
        </p>
        <p className="font-sans text-[14px] text-dp-ink-muted">
          Device-local Passport data on this browser is not cleared by this
          action. Type <span className="font-semibold text-dp-ink">DELETE</span>{" "}
          to confirm.
        </p>
        <Input
          label="Confirmation"
          value={phrase}
          onChange={(event) => setPhrase(event.target.value)}
          placeholder="DELETE"
          autoComplete="off"
          disabled={pending}
        />
      </div>
    </Dialog>
  );
}
