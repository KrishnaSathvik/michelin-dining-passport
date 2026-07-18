"use client";

import Link from "next/link";
import { usePassport } from "@/lib/passport/PassportProvider";

export function DeviceSaveNotice() {
  const { mode, migrationMessage } = usePassport();

  if (mode === "cloud") {
    return (
      <div className="space-y-2">
        <p className="border border-dp-border bg-dp-surface/60 px-4 py-3 font-sans text-sm text-dp-ink-muted">
          Signed in — Passport changes sync to your account.{" "}
          <Link
            href="/account"
            className="text-dp-primary underline-offset-4 hover:underline"
          >
            Manage account
          </Link>
        </p>
        {migrationMessage ? (
          <p className="border border-dp-border px-4 py-3 font-sans text-sm text-dp-primary">
            {migrationMessage}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <p className="border border-dp-border bg-dp-surface/60 px-4 py-3 font-sans text-sm text-dp-ink-muted">
      Saved on this device.{" "}
      <Link
        href="/login?next=/passport"
        className="text-dp-primary underline-offset-4 hover:underline"
      >
        Sign in
      </Link>{" "}
      to sync across browsers, or export a backup if you clear site data.
    </p>
  );
}
