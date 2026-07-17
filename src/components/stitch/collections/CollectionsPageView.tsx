"use client";

import { useMemo, useState } from "react";
import { PageContainer } from "@/components/stitch/PageContainer";
import { PassportSyncNotice } from "@/components/stitch/passport/PassportSyncNotice";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { Restaurant } from "@/lib/data/types";
import { toCollectionsIndexModel, toCollectionsSyncState } from "./adapters";
import { filterCollectionsByQuery, sortCollections } from "./filters";
import { CollectionsEmptyState } from "./CollectionsEmptyState";
import { CollectionsHeader } from "./CollectionsHeader";
import { CollectionsLoadingState } from "./CollectionsLoadingState";
import { CollectionsToolbar } from "./CollectionsToolbar";
import { CollectionGrid } from "./CollectionGrid";
import { CreateCollectionDialog } from "./CreateCollectionDialog";
import { FeaturedCollectionCard } from "./FeaturedCollectionCard";
import type { CollectionSortId } from "./models";

type CollectionsPageViewProps = {
  restaurants: Restaurant[];
  /** Dev-only visual QA overrides. */
  proof?: "loading" | "empty" | "active";
};

export function CollectionsPageView({
  restaurants,
  proof,
}: CollectionsPageViewProps) {
  const { ready, mode, store, migrationMessage, migrationStatus } =
    usePassport();
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<CollectionSortId>("updated-desc");

  const sync = useMemo(
    () =>
      toCollectionsSyncState({
        mode,
        migrationMessage,
        migrationCompleted: migrationStatus.completed,
      }),
    [mode, migrationMessage, migrationStatus.completed],
  );

  const indexModel = useMemo(
    () => toCollectionsIndexModel({ store, restaurants, sync }),
    [store, restaurants, sync],
  );

  const showEmpty =
    proof === "empty" ||
    (ready && indexModel.collections.length === 0 && proof !== "active");

  const visibleGrid = useMemo(() => {
    if (showEmpty) return [];
    return sortCollections(
      filterCollectionsByQuery(indexModel.grid, query),
      sort,
    );
  }, [indexModel.grid, query, showEmpty, sort]);

  if (proof === "loading" || !ready) {
    return <CollectionsLoadingState variant="index" />;
  }

  const featuredCollection = indexModel.featured
    ? store.collections[indexModel.featured.id]
    : undefined;

  return (
    <div
      className="border-b border-dp-outline-variant bg-dp-bg"
      data-collections-page="index"
    >
      <PageContainer className="pb-[var(--dp-section)] pt-[104px]">
        <CollectionsHeader onCreate={() => setCreateOpen(true)} />

        {showEmpty ? (
          <CollectionsEmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <>
            {indexModel.featured && featuredCollection ? (
              <FeaturedCollectionCard
                model={indexModel.featured}
                collection={featuredCollection}
              />
            ) : null}
            <CollectionsToolbar
              query={query}
              onQueryChange={setQuery}
              sort={sort}
              onSortChange={setSort}
            />
            <CollectionGrid
              cards={visibleGrid}
              collectionsById={store.collections}
            />
          </>
        )}

        <div className="mt-[var(--dp-section)]">
          <PassportSyncNotice
            sync={{
              mode: sync.mode,
              migrationMessage: sync.migrationMessage,
              hasSyncError: sync.hasSyncError,
            }}
          />
        </div>
      </PageContainer>

      <CreateCollectionDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
