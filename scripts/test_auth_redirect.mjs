import assert from "node:assert/strict";
import test from "node:test";

/**
 * Mirror of src/lib/auth/redirect.ts for unit coverage without a TS loader.
 */
function safeInternalPath(next, fallback = "/passport") {
  if (!next || typeof next !== "string") return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://")) return fallback;
  if (trimmed.includes("\\")) return fallback;
  if (trimmed.includes("\n") || trimmed.includes("\r")) return fallback;
  return trimmed;
}

test("accepts internal paths", () => {
  assert.equal(safeInternalPath("/account"), "/account");
  assert.equal(safeInternalPath("/passport?tab=saved"), "/passport?tab=saved");
});

test("rejects external redirects", () => {
  assert.equal(safeInternalPath("https://evil.example"), "/passport");
  assert.equal(safeInternalPath("//evil.example"), "/passport");
  assert.equal(safeInternalPath("https://evil.example/x"), "/passport");
  assert.equal(safeInternalPath("javascript:alert(1)"), "/passport");
});

test("uses fallback for empty values", () => {
  assert.equal(safeInternalPath(null, "/account"), "/account");
  assert.equal(safeInternalPath("", "/login"), "/login");
});
