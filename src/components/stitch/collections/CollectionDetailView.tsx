"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageContainer } from "@/components/stitch/PageContainer";
import { Button } from "@/components/stitch/Button";
import { PassportSyncNotice } from "@/components/stitch/passport/PassportSyncNotice";
import { toSyncState } from "@/components/stitch/passport/adapters";
import {
  buildCollectionDetail,
  findCollectionBySlug,
  type CollectionRestaurantItem,
} from "@/lib/passport/collections";
import { usePassport } from "@/lib/passport/PassportProvider";
import { AddRestaurantsDialog } from "./AddRestaurantsDialog";
import { CollectionFormDialog } from "./CollectionFormDialog";
import { CollectionRestaurantCard } from "./CollectionRestaurantCard";
import { CollectionsLoadingState } from "./CollectionsLoadingState";
import { DeleteCollectionDialog } from "./DeleteCollectionDialog";
import type { CollectionDetailProof } from "./proof";

type CollectionDetailViewProps = {
  slug: string;
  proof?: CollectionDetailProof;
};

function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

function CollectionMissing() {
  return (
    <div className="min-w-0 bg-dp-bg" data-collections-page="missing">
      <PageContainer className="min-w-0 pb-[var(--dp-section)] pt-[104px]">
        <div className="rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface px-6 py-14 text-center">
          <h1 className="dp-headline-sm text-dp-primary-deep">
            Collection not found
          </h1>
          <p className="mx-auto mt-3 max-w-lg font-sans text-[15px] leading-relaxed text-dp-ink-secondary">
            This collection may have been deleted, or it belongs to a different
            device. Your saved restaurants are unaffected.
          </p>
          <Link
            href="/collections"
            className="mt-7 inline-flex h-12 min-h-11 items-center justify-center rounded-[var(--dp-radius-md)] bg-dp-primary px-5 font-sans text-[14px] font-semibold text-dp-on-primary no-underline hover:bg-dp-primary-hover"
          >
            Back to collections
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}

export function CollectionDetailView({
  slug,
  proof,
}: CollectionDetailViewProps) {
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
    removeFromCollection,
  } = usePassport();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const collection = findCollectionBySlug(store, slug);
  const detail = useMemo(
    () =>
      collection
        ? buildCollectionDetail(store, restaurants, collection, today())
        : null,
    [collection, store, restaurants],
  );

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

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
        ? "This collection is still saved on this device."
        : collectionSyncMessage,
    storageError,
  });

  if (!ready || proof === "loading") {
    return <CollectionsLoadingState variant="detail" />;
  }

  if (proof === "missing" || !collection || !detail) {
    return <CollectionMissing />;
  }

  const items: CollectionRestaurantItem[] = proof === "empty" ? [] : detail.items;
  const countLabel = `${items.length} ${
    items.length === 1 ? "restaurant" : "restaurants"
  }`;

  return (
    <div
      className="min-w-0 bg-dp-bg"
      data-collections-page="detail"
      data-collection-slug={collection.slug}
    >
      <PageContainer className="min-w-0 pb-[var(--dp-section)] pt-[104px]">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 font-sans text-[14px] text-dp-ink-muted">
            <li>
              <Link href="/passport" className="no-underline hover:underline">
                My Restaurants
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/collections" className="no-underline hover:underline">
                Collections
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="min-w-0 truncate">
              {collection.name}
            </li>
          </ol>
        </nav>

        <header className="mb-8 flex min-w-0 flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-2xl">
            <h1 className="font-display text-[36px] leading-[1.1] tracking-[-0.01em] break-words text-dp-primary-deep md:text-[48px] md:tracking-[-0.02em]">
              {collection.name}
            </h1>
            {collection.description ? (
              <p className="dp-body-lg mt-4 text-dp-ink-secondary">
                {collection.description}
              </p>
            ) : null}
            <p className="mt-4 font-sans text-sm font-medium text-dp-ink-muted">
              {countLabel}
              {detail.updatedLabel ? ` · ${detail.updatedLabel}` : ""}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {/* The empty state already offers this, so it is not repeated here. */}
            {items.length > 0 ? (
              <Button
                type="button"
                variant="primary"
                onClick={() => setAddOpen(true)}
              >
                Add restaurants
              </Button>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditOpen(true)}
            >
              Edit collection
            </Button>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-label="More collection actions"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen((open) => !open)}
                className="inline-flex h-12 w-12 items-center justify-center rounded-[var(--dp-radius-md)] border border-dp-outline-variant font-sans text-lg leading-none text-dp-ink-secondary hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
              >
                <span aria-hidden="true">⋯</span>
              </button>
              {menuOpen ? (
                <div
                  role="menu"
                  aria-label="Collection actions"
                  className="absolute right-0 top-14 z-20 w-52 overflow-hidden rounded-[var(--dp-radius-md)] border border-dp-outline-variant bg-dp-surface shadow-[var(--dp-shadow-hover)]"
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
          </div>
        </header>

        <div className="mb-6">
          <PassportSyncNotice sync={sync} compact onRetry={retryCollectionSync} />
        </div>

        {detail.missingCount > 0 ? (
          <p className="mb-6 rounded-[var(--dp-radius-md)] border border-dp-outline-variant bg-dp-surface-low px-4 py-3 font-sans text-sm text-dp-ink-secondary">
            {detail.missingCount}{" "}
            {detail.missingCount === 1 ? "restaurant is" : "restaurants are"} no
            longer in the guide and {detail.missingCount === 1 ? "is" : "are"}{" "}
            hidden from this collection.
          </p>
        ) : null}

        {items.length === 0 ? (
          <div
            className="rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface px-6 py-12 text-center"
            data-collections-state="detail-empty"
          >
            <h2 className="dp-headline-sm text-dp-primary-deep">
              Nothing in this collection yet
            </h2>
            <p className="mx-auto mt-3 max-w-lg font-sans text-[15px] leading-relaxed text-dp-ink-secondary">
              Add restaurants you have already saved. Adding one here also keeps
              it saved in My Restaurants.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                type="button"
                variant="primary"
                onClick={() => setAddOpen(true)}
              >
                Add restaurants
              </Button>
              <Link
                href="/explore"
                className="inline-flex h-[var(--dp-control-height)] min-h-11 items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface px-5 font-sans text-[14px] font-semibold text-dp-primary no-underline hover:bg-dp-soft"
              >
                Explore restaurants
              </Link>
            </div>
          </div>
        ) : (
          <ul className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <li key={item.slug} className="min-w-0">
                <CollectionRestaurantCard
                  item={item}
                  onRemove={() => removeFromCollection(collection.id, item.slug)}
                />
              </li>
            ))}
          </ul>
        )}
      </PageContainer>

      {editOpen ? (
        <CollectionFormDialog
          key={`edit-${collection.id}`}
          open
          collection={collection}
          onClose={() => setEditOpen(false)}
        />
      ) : null}

      {deleteOpen ? (
        <DeleteCollectionDialog
          open
          collection={collection}
          redirectToIndex
          onClose={() => setDeleteOpen(false)}
        />
      ) : null}

      {addOpen ? (
        <AddRestaurantsDialog
          open
          collection={collection}
          onClose={() => setAddOpen(false)}
        />
      ) : null}
    </div>
  );
}
