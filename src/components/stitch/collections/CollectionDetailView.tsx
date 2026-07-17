"use client";

import { useMemo, useState } from "react";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { PageContainer } from "@/components/stitch/PageContainer";
import { Button } from "@/components/stitch/Button";
import { PassportSyncNotice } from "@/components/stitch/passport/PassportSyncNotice";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { Restaurant } from "@/lib/data/types";
import {
  toCollectionDetailModel,
  toCollectionsSyncState,
} from "./adapters";
import { AddRestaurantsDialog } from "./AddRestaurantsDialog";
import { CollectionDetailEmptyState } from "./CollectionDetailEmptyState";
import { CollectionDetailHero } from "./CollectionDetailHero";
import { CollectionDetailMissing } from "./CollectionDetailMissing";
import { CollectionRestaurantList } from "./CollectionRestaurantList";
import { CollectionsLoadingState } from "./CollectionsLoadingState";
import { DeleteCollectionDialog } from "./DeleteCollectionDialog";
import { EditCollectionDialog } from "./EditCollectionDialog";

type CollectionDetailViewProps = {
  slug: string;
  restaurants: Restaurant[];
  /** Dev-only visual QA overrides. */
  proof?: "loading" | "empty" | "missing";
};

export function CollectionDetailView({
  slug,
  restaurants,
  proof,
}: CollectionDetailViewProps) {
  const {
    ready,
    mode,
    store,
    migrationMessage,
    migrationStatus,
    findCollectionBySlug,
  } = usePassport();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const sync = useMemo(
    () =>
      toCollectionsSyncState({
        mode,
        migrationMessage,
        migrationCompleted: migrationStatus.completed,
      }),
    [mode, migrationMessage, migrationStatus.completed],
  );

  const collection = findCollectionBySlug(slug);

  if (proof === "loading" || !ready) {
    return <CollectionsLoadingState variant="detail" />;
  }

  if (proof === "missing" || !collection) {
    return <CollectionDetailMissing />;
  }

  const model = toCollectionDetailModel({
    collection,
    store,
    restaurants,
    sync,
  });

  const members = proof === "empty" ? [] : model.members;
  const progress =
    proof === "empty"
      ? {
          ...model.progress,
          totalMembers: 0,
          visitedMembers: 0,
          remainingMembers: 0,
          percent: 0,
          starsInCollection: 0,
          statesRepresented: 0,
          stateLabels: [] as string[],
        }
      : model.progress;

  return (
    <div
      className="border-b border-dp-outline-variant bg-dp-bg"
      data-collections-page="detail"
      data-collection-slug={collection.slug}
    >
      <PageContainer className="pb-[var(--dp-section)] pt-[104px]">
        <div className="mb-12">
          <Breadcrumbs items={model.breadcrumbs} />
        </div>

        <section
          className="mb-[var(--dp-section)] grid grid-cols-1 items-end gap-[var(--dp-gutter)] lg:grid-cols-12"
          data-collections-section="title"
        >
          <div className="lg:col-span-8">
            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-[14px] text-dp-ink-muted">
              <span>
                {progress.totalMembers}{" "}
                {progress.totalMembers === 1 ? "restaurant" : "restaurants"}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-dp-primary">
                {progress.visitedMembers} visited
              </span>
              {progress.statesRepresented > 0 ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    {progress.statesRepresented}{" "}
                    {progress.statesRepresented === 1 ? "state" : "states"}
                    {progress.stateLabels.length
                      ? ` (${progress.stateLabels.join(", ")})`
                      : ""}
                  </span>
                </>
              ) : null}
            </div>
            <h1 className="dp-display-lg break-words text-dp-ink max-md:dp-display-lg-mobile">
              {model.name}
            </h1>
            {model.description ? (
              <p className="mt-4 max-w-2xl font-sans text-[18px] leading-relaxed text-dp-ink-muted">
                {model.description}
              </p>
            ) : null}
          </div>
          <div className="relative flex flex-wrap items-center gap-3 lg:col-span-4 lg:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditOpen(true)}
              data-collections-action="edit"
            >
              Edit
            </Button>
            <button
              type="button"
              aria-label="More collection actions"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-dp-outline-variant text-dp-primary hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
            >
              ⋯
            </button>
            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-14 z-20 w-44 overflow-hidden rounded-[var(--dp-radius-md)] border border-dp-outline-variant bg-dp-surface shadow-[var(--dp-shadow-hover)]"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full px-4 py-3 text-left font-sans text-[14px] text-dp-error hover:bg-dp-soft"
                  onClick={() => {
                    setMenuOpen(false);
                    setDeleteOpen(true);
                  }}
                >
                  Delete collection
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <CollectionDetailHero
          cover={model.cover}
          progress={progress}
          onAddRestaurants={() => setAddOpen(true)}
        />

        {members.length === 0 ? (
          <div className="mt-[var(--dp-section)]">
            <CollectionDetailEmptyState
              onAddRestaurants={() => setAddOpen(true)}
            />
          </div>
        ) : (
          <CollectionRestaurantList members={members} collection={collection} />
        )}

        <div className="mt-[var(--dp-section)]">
          <PassportSyncNotice
            sync={{
              mode: sync.mode,
              migrationMessage: sync.migrationMessage,
              hasSyncError: sync.hasSyncError,
            }}
            compact
          />
        </div>
      </PageContainer>

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
      <AddRestaurantsDialog
        key={`add-${collection.id}`}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        collection={collection}
        restaurants={restaurants}
      />
    </div>
  );
}
