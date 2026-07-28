"use client";

import Link from "next/link";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { PassportSyncState } from "./models";

type PassportSyncNoticeProps = {
  sync: PassportSyncState;
  /** Tighter spacing when embedded under a list header. */
  compact?: boolean;
  /** Override for surfaces with their own retryable mutation (collections). */
  onRetry?: () => void;
};

export function PassportSyncNotice({
  sync,
  compact = false,
  onRetry,
}: PassportSyncNoticeProps) {
  const { retrySync } = usePassport();
  const retry = onRetry ?? retrySync;
  const spacing = compact ? "mb-10" : "mb-[var(--dp-section)]";

  if (sync.storageError) {
    return (
      <aside
        className={`${spacing} rounded-[var(--dp-radius-lg)] border border-dp-error bg-dp-error-container px-5 py-4`}
        role="alert"
        data-sync-mode="storage-error"
      >
        <p className="font-sans text-sm font-semibold text-dp-error">
          Your browser could not store your restaurant changes.
        </p>
        <p className="mt-1 font-sans text-sm text-dp-ink-secondary">
          Check private-browsing or storage settings before adding more plans
          or visits.
        </p>
      </aside>
    );
  }

  if (sync.status === "failed" || sync.hasSyncError) {
    return (
      <aside
        className={`${spacing} flex flex-col items-start justify-between gap-3 rounded-[var(--dp-radius-lg)] border border-dp-error bg-dp-error-container px-5 py-4 sm:flex-row sm:items-center`}
        role="alert"
        data-sync-mode="failed"
      >
        <div>
          <p className="font-sans text-sm font-semibold text-dp-error">
            Couldn’t sync your latest change.
          </p>
          <p className="mt-1 font-sans text-sm text-dp-ink-secondary">
            {sync.message ??
              sync.migrationMessage ??
              "Your local copy is still available."}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-error underline-offset-4 hover:underline"
          onClick={retry}
        >
          Retry
        </button>
      </aside>
    );
  }

  if (sync.status === "pending") {
    return (
      <aside
        className={`${spacing} rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface-low px-5 py-4`}
        role="status"
        data-sync-mode="pending"
      >
        <p className="font-sans text-sm text-dp-ink-secondary">
          Sync pending. Your changes are already saved on this device.
        </p>
      </aside>
    );
  }

  if (sync.mode === "cloud") {
    return null;
  }

  return (
    <aside
      className={`${spacing} rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface-low px-5 py-4`}
      data-passport-section="sync-notice"
      data-sync-mode="local"
      aria-label="Device-only saves notice"
    >
      <p className="font-sans text-[14px] text-dp-ink-secondary">
        Your restaurants are stored on this device.{" "}
        <Link
          href="/login?next=/passport"
          className="font-medium text-dp-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        >
          Sign in
        </Link>{" "}
        to sync supported data across devices.
      </p>
    </aside>
  );
}
