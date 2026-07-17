"use client";

import Link from "next/link";
import { useState } from "react";
import { CollectionCover } from "./CollectionCover";
import { DeleteCollectionDialog } from "./DeleteCollectionDialog";
import { EditCollectionDialog } from "./EditCollectionDialog";
import type { CollectionCardModel } from "./models";
import type { LocalCollection } from "@/lib/passport/types";

type CollectionGridCardProps = {
  model: CollectionCardModel;
  collection: LocalCollection;
};

export function CollectionGridCard({
  model,
  collection,
}: CollectionGridCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface transition-shadow motion-safe:hover:shadow-[var(--dp-shadow-hover)]"
      data-collections-card="grid"
      data-collection-id={model.id}
    >
      <div className="relative">
        <Link
          href={model.href}
          aria-label={`Open ${model.name}, ${model.restaurantCount} restaurants, ${model.visitedCount} visited`}
          className="block overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        >
          <div className="motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.05]">
            <CollectionCover cover={model.cover} ratioClass="aspect-[4/3]" />
          </div>
        </Link>
        <div className="absolute right-3 top-3 z-10">
          <button
            type="button"
            aria-label={`Actions for ${model.name}`}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface/95 text-dp-ink-secondary backdrop-blur-sm hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          >
            ⋯
          </button>
          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-40 overflow-hidden rounded-[var(--dp-radius-md)] border border-dp-outline-variant bg-dp-surface shadow-[var(--dp-shadow-hover)]"
            >
              <button
                type="button"
                role="menuitem"
                className="block w-full px-4 py-3 text-left font-sans text-[14px] text-dp-ink hover:bg-dp-soft"
                onClick={() => {
                  setMenuOpen(false);
                  setEditOpen(true);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-4 py-3 text-left font-sans text-[14px] text-dp-error hover:bg-dp-soft"
                onClick={() => {
                  setMenuOpen(false);
                  setDeleteOpen(true);
                }}
              >
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="dp-headline-sm text-dp-primary-deep transition-colors group-hover:text-dp-burgundy">
          <Link
            href={model.href}
            className="no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          >
            {model.name}
          </Link>
        </h3>
        {model.description ? (
          <p className="mt-1 line-clamp-2 font-sans text-[16px] text-dp-ink-muted">
            {model.description}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4 font-sans text-[14px] text-dp-ink-muted">
          <span>
            {model.restaurantCount}{" "}
            {model.restaurantCount === 1 ? "item" : "items"}
          </span>
          {model.visitedCount > 0 ? (
            <span className="font-medium text-dp-primary">
              {model.visitedCount} visited
            </span>
          ) : model.updatedLabel ? (
            <span>{model.updatedLabel}</span>
          ) : null}
        </div>
      </div>

      <EditCollectionDialog
        key={`edit-${collection.id}-${editOpen ? "open" : "closed"}`}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        collection={collection}
      />
      <DeleteCollectionDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        collection={collection}
      />
    </article>
  );
}
