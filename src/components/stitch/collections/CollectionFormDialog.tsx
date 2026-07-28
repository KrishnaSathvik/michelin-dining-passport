"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/stitch/Button";
import { Dialog } from "@/components/stitch/Dialog";
import { Input } from "@/components/stitch/Input";
import { usePassport } from "@/lib/passport/PassportProvider";
import {
  COLLECTION_DESCRIPTION_MAX_LENGTH,
  COLLECTION_NAME_MAX_LENGTH,
  type CollectionInputError,
} from "@/lib/passport/store";
import type { LocalCollection } from "@/lib/passport/types";

type CollectionFormDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Omit to create; pass a collection to rename / edit its description. */
  collection?: LocalCollection;
  /** Navigate to the new collection after creating it. Default true. */
  navigateOnCreate?: boolean;
};

const ERROR_COPY: Record<CollectionInputError, string> = {
  "name-required": "Enter a name for this collection.",
  "name-too-long": `Collection names are limited to ${COLLECTION_NAME_MAX_LENGTH} characters.`,
  "description-too-long": `Descriptions are limited to ${COLLECTION_DESCRIPTION_MAX_LENGTH} characters.`,
  "duplicate-name": "You already have a collection with this name.",
};

export function CollectionFormDialog({
  open,
  onClose,
  collection,
  navigateOnCreate = true,
}: CollectionFormDialogProps) {
  const { addCollection, editCollection } = usePassport();
  const router = useRouter();
  const isEdit = Boolean(collection);
  const [name, setName] = useState(collection?.name ?? "");
  const [description, setDescription] = useState(collection?.description ?? "");
  const [error, setError] = useState<CollectionInputError | null>(null);

  const nameRemaining = COLLECTION_NAME_MAX_LENGTH - name.trim().length;
  const descriptionRemaining =
    COLLECTION_DESCRIPTION_MAX_LENGTH - description.trim().length;

  const submit = () => {
    if (isEdit && collection) {
      const failure = editCollection(collection.id, {
        name: name.trim(),
        description: description.trim(),
      });
      if (failure) {
        setError(failure);
        return;
      }
      onClose();
      return;
    }

    const result = addCollection({
      name: name.trim(),
      description: description.trim(),
    });
    if (result.error || !result.collection) {
      setError(result.error);
      return;
    }
    onClose();
    if (navigateOnCreate) {
      router.push(`/collections/${result.collection.slug}`);
    }
  };

  const formId = isEdit ? "edit-collection-form" : "create-collection-form";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit collection" : "Create collection"}
      description={
        isEdit
          ? undefined
          : "Group saved restaurants for a trip, a city, or an occasion."
      }
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} variant="primary">
            {isEdit ? "Save changes" : "Create collection"}
          </Button>
        </div>
      }
    >
      <form
        id={formId}
        className="space-y-5"
        data-collections-dialog={isEdit ? "edit" : "create"}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div>
          <Input
            label="Collection name"
            name="collection-name"
            value={name}
            maxLength={COLLECTION_NAME_MAX_LENGTH + 40}
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError(null);
            }}
            placeholder="New York weekend"
            autoComplete="off"
            data-dialog-initial-focus
            error={
              error && error !== "description-too-long"
                ? ERROR_COPY[error]
                : undefined
            }
          />
          <p
            className={`mt-1 font-sans text-xs ${
              nameRemaining < 0 ? "text-dp-error" : "text-dp-ink-muted"
            }`}
          >
            {nameRemaining < 0
              ? `${Math.abs(nameRemaining)} over the limit`
              : `${nameRemaining} characters remaining`}
          </p>
        </div>

        <label className="flex w-full flex-col gap-2">
          <span className="dp-label-caps text-dp-ink-muted">
            Description (optional)
          </span>
          <textarea
            name="collection-description"
            value={description}
            rows={3}
            onChange={(event) => {
              setDescription(event.target.value);
              if (error) setError(null);
            }}
            placeholder="What ties these restaurants together?"
            aria-invalid={error === "description-too-long"}
            className={`w-full resize-none rounded-[var(--dp-radius-md)] border bg-dp-surface p-4 font-sans text-[16px] text-dp-ink placeholder:text-dp-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus ${
              error === "description-too-long"
                ? "border-dp-error"
                : "border-dp-border"
            }`}
          />
          {error === "description-too-long" ? (
            <span className="dp-meta text-dp-error">{ERROR_COPY[error]}</span>
          ) : (
            <span
              className={`dp-meta ${
                descriptionRemaining < 0 ? "text-dp-error" : "text-dp-ink-muted"
              }`}
            >
              {descriptionRemaining < 0
                ? `${Math.abs(descriptionRemaining)} over the limit`
                : `${descriptionRemaining} characters remaining`}
            </span>
          )}
        </label>

        <p className="font-sans text-[13px] leading-relaxed text-dp-ink-muted">
          Collections are private to My Restaurants. Adding a restaurant to a
          collection also saves it; removing it later keeps it saved.
        </p>
      </form>
    </Dialog>
  );
}
