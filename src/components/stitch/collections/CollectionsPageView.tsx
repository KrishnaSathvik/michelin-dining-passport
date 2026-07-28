"use client";

import { useMemo, useState } from "react";
import { PageContainer } from "@/components/stitch/PageContainer";
import { Button } from "@/components/stitch/Button";
import { PassportSyncNotice } from "@/components/stitch/passport/PassportSyncNotice";
import { toSyncState } from "@/components/stitch/passport/adapters";
import { buildCollectionsIndex } from "@/lib/passport/collections";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { LocalCollection } from "@/lib/passport/types";
import { CollectionCard } from "./CollectionCard";
import { CollectionFormDialog } from "./CollectionFormDialog";
import { CollectionsEmptyState } from "./CollectionsEmptyState";
import { CollectionsLoadingState } from "./CollectionsLoadingState";
import { DeleteCollectionDialog } from "./DeleteCollectionDialog";
import type { CollectionsProof } from "./proof";

type CollectionsPageViewProps = {
  proof?: CollectionsProof;
};

export function CollectionsPageView({ proof }: CollectionsPageViewProps) {
  const {
    ready,
    restaurants,
    store,
    mode,
    migrationMessage,
    migrationStatus,
    storageError,
    collectionSyncStatus,
    collectionSyncMessage,
    retryCollectionSync,
  } = usePassport();
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<LocalCollection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LocalCollection | null>(null);

  const summaries = useMemo(
    () => buildCollectionsIndex(store, restaurants),
    [store, restaurants],
  );

  const sync = toSyncState({
    mode: proof === "device-only" ? "local" : mode,
    migrationMessage,
    migrationCompleted: migrationStatus.completed,
    status:
      proof === "sync-pending"
        ? "pending"
        : proof === "sync-failed"
          ? "failed"
          : collectionSyncStatus,
    message:
      proof === "sync-failed"
        ? "Your collections are still saved on this device."
        : collectionSyncMessage,
    storageError,
  });

  if (!ready || proof === "loading") {
    return <CollectionsLoadingState variant="index" />;
  }

  const empty = proof === "empty" || summaries.length === 0;

  return (
    <div className="min-w-0 bg-dp-bg" data-collections-page="index">
      <PageContainer className="min-w-0 pb-[var(--dp-section)] pt-[104px]">
        <header className="mb-8 flex min-w-0 flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 max-w-2xl">
            <h1 className="font-display text-[36px] leading-[1.1] tracking-[-0.01em] text-dp-primary-deep md:text-[48px] md:tracking-[-0.02em]">
              Collections
            </h1>
            <p className="dp-body-lg mt-4 text-dp-ink-secondary">
              Private groups for the restaurants you have saved — a trip, an
              occasion, or a theme. A restaurant can sit in several collections
              at once.
            </p>
          </div>
          {empty ? null : (
            <Button
              type="button"
              variant="primary"
              className="shrink-0"
              onClick={() => setCreateOpen(true)}
            >
              Create collection
            </Button>
          )}
        </header>

        <div className="mb-6">
          <PassportSyncNotice
            sync={sync}
            compact
            onRetry={retryCollectionSync}
          />
        </div>

        {empty ? (
          <CollectionsEmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <ul className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {summaries.map((summary) => {
              const collection = store.collections[summary.id];
              if (!collection) return null;
              return (
                <li key={summary.id} className="min-w-0">
                  <CollectionCard
                    summary={summary}
                    collection={collection}
                    onRename={setRenameTarget}
                    onDelete={setDeleteTarget}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </PageContainer>

      {createOpen ? (
        <CollectionFormDialog open onClose={() => setCreateOpen(false)} />
      ) : null}

      {renameTarget ? (
        <CollectionFormDialog
          key={`rename-${renameTarget.id}`}
          open
          collection={renameTarget}
          onClose={() => setRenameTarget(null)}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteCollectionDialog
          open
          collection={deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}
