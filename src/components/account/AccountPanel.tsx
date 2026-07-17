"use client";

import { useId, useRef, useState, useTransition } from "react";
import {
  exportCloudAccountData,
  requestAccountDeletionAction,
  updateProfileAction,
} from "@/app/personal-data/actions";
import { signOutAction, updatePasswordFormAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";
import {
  readMigrationState,
  type LocalMigrationState,
} from "@/lib/personal-data/migration-state";

type AccountPanelProps = {
  email: string | null;
  displayName: string;
  homeCity: string;
  providers: string[];
  createdAt: string | null;
  hasPasswordProvider: boolean;
};

export function AccountPanel({
  email,
  displayName: initialName,
  homeCity: initialCity,
  providers,
  createdAt,
  hasPasswordProvider,
}: AccountPanelProps) {
  const [displayName, setDisplayName] = useState(initialName);
  const [homeCity, setHomeCity] = useState(initialCity);
  const [message, setMessage] = useState<string | null>(null);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [migrationStatus] = useState<LocalMigrationState>(() =>
    readMigrationState(),
  );
  const [pending, startTransition] = useTransition();
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const deleteTitleId = useId();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <header>
        <h1 className="font-display text-4xl text-ink">Account</h1>
        <p className="mt-2 font-sans text-sm text-ink-muted">
          Profile, security, Passport sync, and data controls.
        </p>
      </header>

      <section className="space-y-4 rounded-[var(--radius-lg)] border border-border p-5 sm:p-6">
        <h2 className="font-display text-2xl text-ink">Profile</h2>
        <dl className="grid gap-3 font-sans text-sm text-ink-muted sm:grid-cols-2">
          <div>
            <dt className="text-ink">Email</dt>
            <dd className="mt-1">{email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-ink">Providers</dt>
            <dd className="mt-1">
              {providers.length ? providers.join(", ") : "email"}
            </dd>
          </div>
          <div>
            <dt className="text-ink">Created</dt>
            <dd className="mt-1">
              {createdAt
                ? new Date(createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"}
            </dd>
          </div>
        </dl>

        <label className="mt-2 flex flex-col gap-1.5">
          <span className="font-sans text-sm text-ink">Display name</span>
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="min-h-11 rounded-[var(--radius-md)] border border-border bg-bg px-3 font-sans text-sm"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-sm text-ink">Home city</span>
          <input
            value={homeCity}
            onChange={(event) => setHomeCity(event.target.value)}
            className="min-h-11 rounded-[var(--radius-md)] border border-border bg-bg px-3 font-sans text-sm"
          />
        </label>
        <Button
          type="button"
          variant="primary"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              const result = await updateProfileAction({
                displayName,
                homeCity,
              });
              setMessage(
                result.ok
                  ? "Profile updated."
                  : (result.message ?? "Update failed."),
              );
            });
          }}
        >
          Save profile
        </Button>
      </section>

      <section className="space-y-4 rounded-[var(--radius-lg)] border border-border p-5 sm:p-6">
        <h2 className="font-display text-2xl text-ink">
          Authentication and security
        </h2>
        {hasPasswordProvider ? (
          <form action={updatePasswordFormAction} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-sm text-ink">New password</span>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="min-h-11 rounded-[var(--radius-md)] border border-border bg-bg px-3 font-sans text-sm"
              />
            </label>
            <Button type="submit" variant="secondary" className="w-fit">
              Update password
            </Button>
          </form>
        ) : (
          <p className="font-sans text-sm text-ink-muted">
            This account uses an external provider. Password updates are managed
            there.
          </p>
        )}
        <form action={signOutAction} className="pt-2">
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      </section>

      <section className="space-y-3 rounded-[var(--radius-lg)] border border-border p-5 sm:p-6">
        <h2 className="font-display text-2xl text-ink">Passport sync status</h2>
        <p className="font-sans text-sm text-ink-muted">
          Signed in — Passport changes sync to your account when online.
        </p>
        <p className="font-sans text-sm text-ink-secondary">
          Local migration:{" "}
          {migrationStatus.completed
            ? `Complete${migrationStatus.completedAt ? ` (${migrationStatus.completedAt})` : ""}`
            : migrationStatus.lastError
              ? `Needs attention: ${migrationStatus.lastError}`
              : "Not completed on this device"}
        </p>
      </section>

      <section className="space-y-3 rounded-[var(--radius-lg)] border border-border p-5 sm:p-6">
        <h2 className="font-display text-2xl text-ink">Data export</h2>
        <p className="font-sans text-sm text-ink-muted">
          Download your profile, personal restaurant records, and collections.
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            startTransition(async () => {
              const result = await exportCloudAccountData();
              if (!result.ok || !result.payload) {
                setMessage(result.message ?? "Export failed.");
                return;
              }
              const blob = new Blob([JSON.stringify(result.payload, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = "michelin-dining-passport-export.json";
              anchor.click();
              URL.revokeObjectURL(url);
              setMessage("Export downloaded.");
            });
          }}
        >
          Download JSON export
        </Button>
      </section>

      <section className="space-y-3 rounded-[var(--radius-lg)] border border-border p-5 sm:p-6">
        <h2 className="font-display text-2xl text-ink">Account deletion</h2>
        <p className="font-sans text-sm text-ink-muted">
          Permanently delete your account and personal dining records. This
          cannot be undone.
        </p>
        <Button
          type="button"
          variant="ghost"
          className="text-burgundy"
          onClick={() => deleteDialogRef.current?.showModal()}
        >
          Delete my account…
        </Button>
      </section>

      <dialog
        ref={deleteDialogRef}
        aria-labelledby={deleteTitleId}
        className="m-auto w-[min(100%,28rem)] rounded-[var(--radius-lg)] border border-border bg-bg p-0 shadow-[var(--shadow-float)] backdrop:bg-ink/40"
      >
        <div className="space-y-4 p-5 sm:p-6">
          <h3 id={deleteTitleId} className="font-display text-2xl text-ink">
            Confirm account deletion
          </h3>
          <p className="font-sans text-sm text-ink-muted">
            Type <span className="text-ink">DELETE</span> to permanently remove
            your account and cloud Passport data.
          </p>
          <input
            value={deletePhrase}
            onChange={(event) => setDeletePhrase(event.target.value)}
            className="min-h-11 w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 font-sans text-sm"
            placeholder="DELETE"
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => deleteDialogRef.current?.close()}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              className="!bg-burgundy hover:!bg-burgundy/90"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  const result = await requestAccountDeletionAction(deletePhrase);
                  if (result.ok) {
                    window.location.href = "/";
                    return;
                  }
                  setMessage(result.message ?? "Deletion failed.");
                  deleteDialogRef.current?.close();
                });
              }}
            >
              Delete permanently
            </Button>
          </div>
        </div>
      </dialog>

      {message ? (
        <p role="status" className="font-sans text-sm text-forest">
          {message}
        </p>
      ) : null}
    </div>
  );
}
