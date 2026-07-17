"use client";

import { useMemo, useState } from "react";
import { PageContainer } from "@/components/stitch/PageContainer";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { Restaurant } from "@/lib/data/types";
import {
  countStaleRecords,
  listPlannedRows,
  listSavedCards,
  listVisitedCards,
  toListPageModel,
  toSyncState,
} from "./adapters";
import {
  defaultFiltersForMode,
  filterPlannedRows,
  filterSavedCards,
  filterVisitedCards,
  sortPlannedRows,
  sortSavedCards,
  sortVisitedCards,
  type PersonalListFilters,
} from "./filters";
import { PassportListEmptyState } from "./PassportListEmptyState";
import { PassportListHeader } from "./PassportListHeader";
import { PassportListToolbar } from "./PassportListToolbar";
import { PassportLoadingState } from "./PassportLoadingState";
import { PassportSyncNotice } from "./PassportSyncNotice";
import { PlannedRestaurantRow } from "./PlannedRestaurantRow";
import { SavedRestaurantCard } from "./SavedRestaurantCard";
import { VisitedRestaurantCard } from "./VisitedRestaurantCard";
import type { PassportListMode } from "./models";

type PassportListPageProps = {
  mode: PassportListMode;
  restaurants: Restaurant[];
  /** Dev-only visual QA overrides. */
  proof?: "loading" | "empty";
};

export function PassportListPage({
  mode,
  restaurants,
  proof,
}: PassportListPageProps) {
  const { ready, store, mode: syncMode, migrationMessage, migrationStatus } =
    usePassport();
  const [filters, setFilters] = useState<PersonalListFilters>(() =>
    defaultFiltersForMode(mode),
  );

  const pageModel = useMemo(() => toListPageModel(mode), [mode]);
  const sync = useMemo(
    () =>
      toSyncState({
        mode: syncMode,
        migrationMessage,
        migrationCompleted: migrationStatus.completed,
      }),
    [syncMode, migrationMessage, migrationStatus.completed],
  );

  const savedItems = useMemo(
    () => listSavedCards(store, restaurants),
    [store, restaurants],
  );
  const plannedItems = useMemo(
    () => listPlannedRows(store, restaurants),
    [store, restaurants],
  );
  const visitedItems = useMemo(
    () => listVisitedCards(store, restaurants),
    [store, restaurants],
  );

  const sourceItems =
    mode === "saved"
      ? savedItems
      : mode === "planned"
        ? plannedItems
        : visitedItems;

  const stateOptions = useMemo(() => {
    const states = new Set(
      sourceItems.map((item) => {
        const parts = item.location.split(", ");
        return parts[parts.length - 1] ?? item.location;
      }),
    );
    return [...states].sort((a, b) => a.localeCompare(b));
  }, [sourceItems]);

  const cuisineOptions = useMemo(() => {
    const cuisines = new Set(
      sourceItems
        .map((item) => item.cuisine)
        .filter((value): value is string => Boolean(value)),
    );
    return [...cuisines].sort((a, b) => a.localeCompare(b));
  }, [sourceItems]);

  const visibleSaved = useMemo(
    () => sortSavedCards(filterSavedCards(savedItems, filters), filters.sort),
    [savedItems, filters],
  );
  const visiblePlanned = useMemo(
    () =>
      sortPlannedRows(filterPlannedRows(plannedItems, filters), filters.sort),
    [plannedItems, filters],
  );
  const visibleVisited = useMemo(
    () =>
      sortVisitedCards(filterVisitedCards(visitedItems, filters), filters.sort),
    [visitedItems, filters],
  );

  const visibleCount =
    mode === "saved"
      ? visibleSaved.length
      : mode === "planned"
        ? visiblePlanned.length
        : visibleVisited.length;

  const staleCount = countStaleRecords(store, restaurants);

  if (proof === "loading" || !ready) {
    return (
      <PassportLoadingState
        variant={mode === "planned" ? "planned" : "list"}
      />
    );
  }

  const isEmpty =
    proof === "empty" ||
    (mode === "saved"
      ? savedItems.length === 0
      : mode === "planned"
        ? plannedItems.length === 0
        : visitedItems.length === 0);

  return (
    <div className="bg-dp-bg" data-passport-list={mode}>
      <PageContainer className="pb-[var(--dp-section)] pt-[104px]">
        <PassportListHeader model={{ ...pageModel, resultCount: visibleCount }} />
        <div className="mb-6">
          <PassportSyncNotice sync={sync} compact />
        </div>

        {isEmpty ? (
          <PassportListEmptyState model={pageModel} />
        ) : (
          <>
            <PassportListToolbar
              mode={mode}
              count={visibleCount}
              filters={filters}
              onChange={setFilters}
              stateOptions={stateOptions}
              cuisineOptions={cuisineOptions}
              showViewToggle={mode === "saved"}
            />

            {staleCount > 0 ? (
              <p
                className="mb-6 font-sans text-[13px] text-dp-ink-muted"
                role="status"
              >
                {staleCount}{" "}
                {staleCount === 1
                  ? "saved restaurant is"
                  : "saved restaurants are"}{" "}
                unavailable in the current catalog and{" "}
                {staleCount === 1 ? "was" : "were"} omitted from this list.
              </p>
            ) : null}

            {mode === "saved" ? (
              <ul
                className={
                  filters.view === "list"
                    ? "space-y-4"
                    : "grid grid-cols-1 gap-[var(--dp-gutter)] md:grid-cols-2 lg:grid-cols-3"
                }
              >
                {visibleSaved.map((item) => (
                  <li key={item.slug}>
                    <SavedRestaurantCard model={item} />
                  </li>
                ))}
              </ul>
            ) : null}

            {mode === "planned" ? (
              <ul className="space-y-6">
                {visiblePlanned.map((item) => (
                  <li key={item.slug}>
                    <PlannedRestaurantRow model={item} />
                  </li>
                ))}
              </ul>
            ) : null}

            {mode === "visited" ? (
              <ul className="grid grid-cols-1 gap-[var(--dp-gutter)] md:grid-cols-2 lg:grid-cols-3">
                {visibleVisited.map((item) => (
                  <li key={item.slug}>
                    <VisitedRestaurantCard model={item} />
                  </li>
                ))}
              </ul>
            ) : null}

            {visibleCount === 0 ? (
              <p className="mt-8 text-center font-sans text-[14px] text-dp-ink-muted">
                No restaurants match the current filters.
              </p>
            ) : null}
          </>
        )}
      </PageContainer>
    </div>
  );
}
