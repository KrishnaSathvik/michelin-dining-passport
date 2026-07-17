"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/stitch/Button";
import { Dialog } from "@/components/stitch/Dialog";
import { Input } from "@/components/stitch/Input";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { LocalCollection } from "@/lib/passport/types";

type EditCollectionDialogProps = {
  open: boolean;
  onClose: () => void;
  collection: LocalCollection;
};

/**
 * Edit name/description only. Preserves id, slug, membership, and other fields.
 * Slug does not change when the name changes (current store behavior).
 */
export function EditCollectionDialog({
  open,
  onClose,
  collection,
}: EditCollectionDialogProps) {
  const { editCollection } = usePassport();
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleClose = () => {
    if (pending) return;
    setName(collection.name);
    setDescription(collection.description);
    setError(null);
    onClose();
  };

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Collection name is required.");
      return;
    }

    startTransition(() => {
      editCollection(collection.id, {
        name: trimmed,
        description: description.trim(),
      });
      onClose();
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Edit collection"
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
            type="submit"
            form="edit-collection-form"
            variant="primary"
            disabled={pending}
          >
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      }
    >
      <form
        id="edit-collection-form"
        className="space-y-5"
        data-collections-dialog="edit"
        key={collection.id}
        onSubmit={(event) => {
          event.preventDefault();
          if (!pending) submit();
        }}
      >
        <Input
          label="Collection name"
          name="edit-collection-name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (error) setError(null);
          }}
          error={error ?? undefined}
          disabled={pending}
        />
        <label className="flex w-full flex-col gap-2">
          <span className="dp-label-caps text-dp-ink-muted">
            Description (optional)
          </span>
          <textarea
            name="edit-collection-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            disabled={pending}
            className="w-full resize-none rounded-[var(--dp-radius-md)] border border-dp-border bg-dp-surface p-4 font-sans text-[16px] text-dp-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          />
        </label>
      </form>
    </Dialog>
  );
}
