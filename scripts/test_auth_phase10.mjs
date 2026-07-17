import assert from "node:assert/strict";
import { describe, it } from "node:test";

/**
 * Mirrors Phase 10 account adapters (plain Node, no TS).
 */

const ACCOUNT_NAV = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "sync", label: "Passport Sync" },
  { id: "data", label: "Data & Export" },
  { id: "danger", label: "Delete Account", destructive: true },
];

function toSyncPresentation(migration) {
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

function toAccountFlash(passwordUpdated, error) {
  if (passwordUpdated) return { kind: "success", message: "Password updated." };
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

function safeInternalPath(next, fallback = "/passport") {
  if (typeof next !== "string" || !next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.includes("://") || next.includes("\\")) {
    return fallback;
  }
  if (next.includes("\n") || next.includes("\r")) return fallback;
  return next;
}

describe("Phase 10 account IA", () => {
  it("nav includes only real sections and omits Notifications", () => {
    const labels = ACCOUNT_NAV.map((item) => item.label);
    assert.deepEqual(labels, [
      "Profile",
      "Security",
      "Passport Sync",
      "Data & Export",
      "Delete Account",
    ]);
    assert.equal(
      labels.some((label) => /notification/i.test(label)),
      false,
    );
  });

  it("sync presentation never invents device counts", () => {
    const sync = toSyncPresentation({
      completed: true,
      completedAt: "2026-01-01T00:00:00.000Z",
      lastError: null,
    });
    assert.match(sync.detail, /migration completed/i);
    assert.equal(/devices? synced|142 Visited|last sync/i.test(sync.detail), false);
  });

  it("sync error surfaces lastError without fake health %", () => {
    const sync = toSyncPresentation({
      completed: false,
      completedAt: null,
      lastError: "network failed",
    });
    assert.equal(sync.tone, "error");
    assert.equal(sync.detail, "network failed");
  });

  it("maps password flash states safely", () => {
    assert.equal(toAccountFlash(true, null)?.kind, "success");
    assert.match(toAccountFlash(false, "weak-password")?.message ?? "", /8 characters/);
    assert.equal(toAccountFlash(false, null), null);
  });
});

describe("Phase 10 redirect safety (mirror)", () => {
  it("accepts internal next and rejects external", () => {
    assert.equal(safeInternalPath("/account"), "/account");
    assert.equal(safeInternalPath("/passport?tab=saved"), "/passport?tab=saved");
    assert.equal(safeInternalPath("https://evil.example"), "/passport");
    assert.equal(safeInternalPath("//evil.example"), "/passport");
    assert.equal(safeInternalPath("/login\n/evil"), "/passport");
  });
});
