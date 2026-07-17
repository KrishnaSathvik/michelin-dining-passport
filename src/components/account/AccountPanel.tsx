"use client";

import { useState, useTransition } from "react";
import {
  exportCloudAccountData,
  requestAccountDeletionAction,
  updateProfileAction,
} from "@/app/personal-data/actions";
import { signOutAction, updatePasswordFormAction } from "@/app/auth/actions";
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

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <header>
        <h1 className="font-display text-4xl text-ink">Account</h1>
        <p className="mt-2 font-sans text-sm text-ink-muted">
          Manage profile, export personal data, or delete your account.
        </p>
      </header>

      <section className="space-y-3 border border-border p-5">
        <h2 className="font-display text-2xl text-ink">Profile</h2>
        <dl className="grid gap-2 font-sans text-sm text-ink-muted">
          <div>
            <dt className="text-ink">Email</dt>
            <dd>{email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-ink">Providers</dt>
            <dd>{providers.length ? providers.join(", ") : "email"}</dd>
          </div>
          <div>
            <dt className="text-ink">Created</dt>
            <dd>
              {createdAt
                ? new Date(createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-ink">Local migration</dt>
            <dd>
              {migrationStatus.completed
                ? `Complete${migrationStatus.completedAt ? ` (${migrationStatus.completedAt})` : ""}`
                : migrationStatus.lastError
                  ? `Needs attention: ${migrationStatus.lastError}`
                  : "Not completed on this device"}
            </dd>
          </div>
        </dl>

        <label className="mt-4 flex flex-col gap-1.5">
          <span className="font-sans text-sm text-ink">Display name</span>
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="border border-border bg-bg px-3 py-2 font-sans text-sm"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-sm text-ink">Home city</span>
          <input
            value={homeCity}
            onChange={(event) => setHomeCity(event.target.value)}
            className="border border-border bg-bg px-3 py-2 font-sans text-sm"
          />
        </label>
        <button
          type="button"
          disabled={pending}
          className="bg-ink px-4 py-2 font-sans text-sm text-bg disabled:opacity-60"
          onClick={() => {
            startTransition(async () => {
              const result = await updateProfileAction({
                displayName,
                homeCity,
              });
              setMessage(
                result.ok ? "Profile updated." : (result.message ?? "Update failed."),
              );
            });
          }}
        >
          Save profile
        </button>
      </section>

      {hasPasswordProvider ? (
        <section className="space-y-3 border border-border p-5">
          <h2 className="font-display text-2xl text-ink">Password</h2>
          <form
            action={updatePasswordFormAction}
            className="flex flex-col gap-3"
          >
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-sm text-ink">New password</span>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="border border-border bg-bg px-3 py-2 font-sans text-sm"
              />
            </label>
            <button
              type="submit"
              className="w-fit border border-border px-4 py-2 font-sans text-sm"
            >
              Update password
            </button>
          </form>
        </section>
      ) : null}

      <section className="space-y-3 border border-border p-5">
        <h2 className="font-display text-2xl text-ink">Export</h2>
        <p className="font-sans text-sm text-ink-muted">
          Download your profile, personal restaurant records, and collections.
        </p>
        <button
          type="button"
          className="border border-border px-4 py-2 font-sans text-sm"
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
        </button>
      </section>

      <section className="space-y-3 border border-border p-5">
        <h2 className="font-display text-2xl text-ink">Sign out</h2>
        <form action={signOutAction}>
          <button
            type="submit"
            className="border border-border px-4 py-2 font-sans text-sm"
          >
            Sign out
          </button>
        </form>
      </section>

      <section className="space-y-3 border border-burgundy/40 p-5">
        <h2 className="font-display text-2xl text-ink">Delete account</h2>
        <p className="font-sans text-sm text-ink-muted">
          Permanently delete your account and personal dining records. Type{" "}
          <span className="text-ink">DELETE</span> to confirm.
        </p>
        <input
          value={deletePhrase}
          onChange={(event) => setDeletePhrase(event.target.value)}
          className="border border-border bg-bg px-3 py-2 font-sans text-sm"
          placeholder="DELETE"
        />
        <button
          type="button"
          disabled={pending}
          className="bg-burgundy px-4 py-2 font-sans text-sm text-bg disabled:opacity-60"
          onClick={() => {
            startTransition(async () => {
              const result = await requestAccountDeletionAction(deletePhrase);
              if (result.ok) {
                window.location.href = "/";
                return;
              }
              setMessage(result.message ?? "Deletion failed.");
            });
          }}
        >
          Delete my account
        </button>
      </section>

      {message ? (
        <p role="status" className="font-sans text-sm text-forest">
          {message}
        </p>
      ) : null}
    </div>
  );
}
