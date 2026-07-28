"use client";

import { useMemo } from "react";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { Restaurant } from "@/lib/data/types";
import {
  hasPassportActivity,
  toPassportActiveModel,
  toPassportEmptyModel,
  toSyncState,
} from "./adapters";
import { PassportActiveView } from "./PassportActiveView";
import { PassportEmptyView } from "./PassportEmptyView";
import { PassportLoadingState } from "./PassportLoadingState";
import type { CatalogDenominators } from "./models";

type PassportPageViewProps = {
  restaurants: Restaurant[];
  denominators: CatalogDenominators;
  /** Dev-only visual QA overrides. */
  proof?:
    | "loading"
    | "empty"
    | "active"
    | "pending"
    | "failed"
    | "storage-error";
};

export function PassportPageView({
  restaurants,
  denominators,
  proof,
}: PassportPageViewProps) {
  const {
    ready,
    mode,
    store,
    migrationMessage,
    migrationStatus,
    storageError,
    syncStatus,
    syncMessage,
  } = usePassport();

  const sync = useMemo(
    () =>
      toSyncState({
        mode,
        migrationMessage,
        migrationCompleted: migrationStatus.completed,
        status: syncStatus,
        message: syncMessage,
        storageError,
      }),
    [
      mode,
      migrationMessage,
      migrationStatus.completed,
      storageError,
      syncMessage,
      syncStatus,
    ],
  );
  const displaySync =
    proof === "pending"
      ? { ...sync, status: "pending" as const }
      : proof === "failed"
        ? {
            ...sync,
            mode: "cloud" as const,
            status: "failed" as const,
            message: "Your local copy is still available.",
          }
        : proof === "storage-error"
          ? { ...sync, storageError: true }
          : sync;

  if (proof === "loading" || !ready) {
    return <PassportLoadingState variant="passport" />;
  }

  const showEmpty =
    proof === "empty" || (!hasPassportActivity(store) && proof !== "active");

  if (showEmpty) {
    return <PassportEmptyView model={toPassportEmptyModel(displaySync)} />;
  }

  const model = toPassportActiveModel({
    store,
    restaurants,
    denominators,
    sync: displaySync,
    today: (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    })(),
  });

  return <PassportActiveView model={model} />;
}
