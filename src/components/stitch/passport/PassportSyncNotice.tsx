import Link from "next/link";
import type { PassportSyncState } from "./models";

type PassportSyncNoticeProps = {
  sync: PassportSyncState;
  /** Tighter spacing when embedded under a list header. */
  compact?: boolean;
};

export function PassportSyncNotice({
  sync,
  compact = false,
}: PassportSyncNoticeProps) {
  const spacing = compact ? "mb-0" : "mb-[var(--dp-section)]";

  if (sync.mode === "cloud") {
    return (
      <aside
        className={`${spacing} rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface-low px-5 py-4`}
        data-passport-section="sync-notice"
        data-sync-mode="cloud"
        aria-label="Passport sync status"
      >
        <p className="font-sans text-[14px] text-dp-ink-secondary">
          Signed in — Passport changes sync to your account.{" "}
          <Link
            href="/account"
            className="font-medium text-dp-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          >
            Manage account
          </Link>
        </p>
        {sync.migrationMessage ? (
          <p
            className={`mt-2 font-sans text-[14px] ${
              sync.hasSyncError ? "text-dp-error" : "text-dp-primary"
            }`}
          >
            {sync.migrationMessage}
          </p>
        ) : null}
      </aside>
    );
  }

  return (
    <aside
      className={`${spacing} rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface-low px-5 py-4`}
      data-passport-section="sync-notice"
      data-sync-mode="local"
      aria-label="Device-only passport notice"
    >
      <p className="font-sans text-[14px] text-dp-ink-secondary">
        Passport data is stored on this device.{" "}
        <Link
          href="/login?next=/passport"
          className="font-medium text-dp-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        >
          Sign in
        </Link>{" "}
        to enable supported cloud synchronization across browsers.
      </p>
    </aside>
  );
}
