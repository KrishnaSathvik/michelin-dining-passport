"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/stitch/Button";
import { Dialog } from "@/components/stitch/Dialog";
import { Input } from "@/components/stitch/Input";
import { usePassport } from "@/lib/passport/PassportProvider";

type CreateCollectionDialogProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Create collection — Name + optional Description.
 * Public toggle intentionally omitted (OD-11).
 * After create: navigate to detail (preserves prior product flow).
 */
export function CreateCollectionDialog({
  open,
  onClose,
}: CreateCollectionDialogProps) {
  const { addCollection } = usePassport();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const reset = () => {
    setName("");
    setDescription("");
    setError(null);
  };

  const handleClose = () => {
    if (pending) return;
    reset();
    onClose();
  };

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Collection name is required.");
      return;
    }

    startTransition(() => {
      const created = addCollection({
        name: trimmed,
        description: description.trim(),
        private: true,
      });
      if (!created) {
        setError("Could not create collection. Try again.");
        return;
      }
      reset();
      onClose();
      router.push(`/collections/${created.slug}`);
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Create new collection"
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
            form="create-collection-form"
            variant="primary"
            disabled={pending}
          >
            {pending ? "Creating…" : "Create collection"}
          </Button>
        </div>
      }
    >
      <form
        id="create-collection-form"
        className="space-y-5"
        data-collections-dialog="create"
        onSubmit={(event) => {
          event.preventDefault();
          if (!pending) submit();
        }}
      >
        <Input
          label="Collection name"
          name="collection-name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (error) setError(null);
          }}
          placeholder="e.g. California Celebration Trip"
          autoComplete="off"
          error={error ?? undefined}
          disabled={pending}
        />
        <label className="flex w-full flex-col gap-2">
          <span className="dp-label-caps text-dp-ink-muted">
            Description (optional)
          </span>
          <textarea
            name="collection-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder="What is this collection about?"
            disabled={pending}
            className="w-full resize-none rounded-[var(--dp-radius-md)] border border-dp-border bg-dp-surface p-4 font-sans text-[16px] text-dp-ink placeholder:text-dp-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          />
        </label>
        <p className="font-sans text-[13px] text-dp-ink-muted">
          Collections are private to your Passport. They organize restaurants
          without changing Saved, Planned, or Visited state.
        </p>
      </form>
    </Dialog>
  );
}
