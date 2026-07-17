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
  proof?: "loading" | "empty" | "active";
};

export function PassportPageView({
  restaurants,
  denominators,
  proof,
}: PassportPageViewProps) {
  const { ready, mode, store, migrationMessage, migrationStatus } =
    usePassport();

  const sync = useMemo(
    () =>
      toSyncState({
        mode,
        migrationMessage,
        migrationCompleted: migrationStatus.completed,
      }),
    [mode, migrationMessage, migrationStatus.completed],
  );

  if (proof === "loading" || !ready) {
    return <PassportLoadingState variant="passport" />;
  }

  const showEmpty =
    proof === "empty" || (!hasPassportActivity(store) && proof !== "active");

  if (showEmpty) {
    return <PassportEmptyView model={toPassportEmptyModel(sync)} />;
  }

  const model = toPassportActiveModel({
    store,
    restaurants,
    denominators,
    sync,
  });

  return <PassportActiveView model={model} />;
}
