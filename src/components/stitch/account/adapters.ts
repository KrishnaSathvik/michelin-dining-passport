import type { LocalMigrationState } from "@/lib/personal-data/migration-state";
import type {
  AccountNavItem,
  AccountPageModel,
  AccountProfileModel,
  PassportSyncPresentation,
} from "./models";

/** Real capabilities only — no Notifications / sessions / fake export. */
export const ACCOUNT_NAV: AccountNavItem[] = [
  { id: "profile", label: "Profile", href: "#profile" },
  { id: "security", label: "Security", href: "#security" },
  { id: "sync", label: "Passport Sync", href: "#sync" },
  { id: "data", label: "Data & Export", href: "#data" },
  {
    id: "danger",
    label: "Delete Account",
    href: "#danger",
    destructive: true,
  },
];

export function toSyncPresentation(
  migration: LocalMigrationState,
): PassportSyncPresentation {
  if (migration.completed) {
    return {
      headline: "Signed in — Passport syncs to your account when online.",
      detail: migration.completedAt
        ? `Local device migration completed (${migration.completedAt}).`
        : "Local device migration completed on this browser.",
      tone: "ok",
    };
  }
  if (migration.lastError) {
    return {
      headline: "Local migration needs attention.",
      detail: migration.lastError,
      tone: "error",
    };
  }
  return {
    headline: "Signed in — Passport changes sync to your account when online.",
    detail:
      "Local migration has not completed on this device yet. It runs automatically after sign-in.",
    tone: "pending",
  };
}

export function toAccountFlash(
  passwordUpdated: boolean,
  error: string | null,
): AccountPageModel["flash"] {
  if (passwordUpdated) {
    return { kind: "success", message: "Password updated." };
  }
  if (error === "weak-password") {
    return {
      kind: "error",
      message: "Choose a stronger password (at least 8 characters).",
    };
  }
  if (error === "password") {
    return { kind: "error", message: "Unable to update password." };
  }
  if (error) {
    return { kind: "error", message: "Something went wrong. Try again." };
  }
  return null;
}

export function toAccountPageModel(input: {
  profile: AccountProfileModel;
  migration: LocalMigrationState;
  passwordUpdated?: boolean;
  error?: string | null;
}): AccountPageModel {
  return {
    profile: input.profile,
    nav: ACCOUNT_NAV,
    sync: toSyncPresentation(input.migration),
    flash: toAccountFlash(Boolean(input.passwordUpdated), input.error ?? null),
  };
}
