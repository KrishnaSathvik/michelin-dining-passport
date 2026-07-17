"use client";

import Link from "next/link";
import { useState } from "react";
import { CollectionCover } from "./CollectionCover";
import { DeleteCollectionDialog } from "./DeleteCollectionDialog";
import { EditCollectionDialog } from "./EditCollectionDialog";
import type { CollectionCardModel } from "./models";
import type { LocalCollection } from "@/lib/passport/types";

type FeaturedCollectionCardProps = {
  model: CollectionCardModel;
  collection: LocalCollection;
};

export function FeaturedCollectionCard({
  model,
  collection,
}: FeaturedCollectionCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <section
      className="mb-[var(--dp-section)]"
      data-collections-section="featured"
      aria-labelledby="featured-collection-heading"
    >
      <article className="group relative flex flex-col overflow-hidden rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface-low transition-shadow motion-safe:hover:shadow-[var(--dp-shadow-hover)] md:h-[400px] md:flex-row">
        <div className="relative h-[300px] w-full overflow-hidden md:h-full md:w-7/12">
          <div className="h-full motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.05]">
            <CollectionCover
              cover={model.cover}
              ratioClass="aspect-auto h-full min-h-[300px] md:min-h-full"
              priority
            />
          </div>
        </div>
        <div className="relative z-10 flex w-full flex-col justify-center p-8 md:w-5/12 md:p-12">
          <span className="mb-4 inline-flex w-fit items-center gap-1 rounded-[var(--dp-radius-md)] bg-[color-mix(in_srgb,var(--dp-star-gold)_20%,transparent)] px-2 py-1 font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-dp-ink-secondary">
            ★ Featured
          </span>
          <h2
            id="featured-collection-heading"
            className="dp-headline-md mb-3 text-dp-primary-deep"
          >
            {model.name}
          </h2>
          <p className="mb-6 font-sans text-[16px] text-dp-ink-muted">
            {model.description ||
              "A personal shortlist from your dining Passport."}
          </p>
          <p className="mb-4 font-sans text-[14px] text-dp-ink-muted">
            {model.restaurantCount}{" "}
            {model.restaurantCount === 1 ? "restaurant" : "restaurants"}
            {model.visitedCount > 0 ? ` · ${model.visitedCount} visited` : ""}
          </p>
          <div className="relative flex items-center gap-3">
            <Link
              href={model.href}
              className="inline-flex h-[var(--dp-control-height)] items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-outline bg-dp-surface px-6 font-sans text-[14px] font-semibold text-dp-primary no-underline transition-colors hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
            >
              View collection
            </Link>
            <button
              type="button"
              aria-label={`More actions for ${model.name}`}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-outline bg-dp-surface text-dp-ink-secondary hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
            >
              ⋯
            </button>
            {menuOpen ? (
              <div
                role="menu"
                className="absolute left-0 top-14 z-20 w-40 overflow-hidden rounded-[var(--dp-radius-md)] border border-dp-outline-variant bg-dp-surface shadow-[var(--dp-shadow-hover)]"
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
      </article>

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
    </section>
  );
}
