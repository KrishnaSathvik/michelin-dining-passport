#!/usr/bin/env node
import assert from "node:assert/strict";
import test from "node:test";

// Mirror of src/lib/security/csv.ts for Node unit tests without TS transpile.
function sanitizeCsvCell(value) {
  const raw = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(raw)) {
    return `'${raw}`;
  }
  return raw;
}

function toCsvRow(values) {
  return values
    .map((value) => {
      const sanitized = sanitizeCsvCell(value);
      if (/[",\n\r]/.test(sanitized)) {
        return `"${sanitized.replace(/"/g, '""')}"`;
      }
      return sanitized;
    })
    .join(",");
}

test("CSV formula injection is neutralized", () => {
  assert.equal(sanitizeCsvCell("=CMD()"), "'=CMD()");
  assert.equal(sanitizeCsvCell("+1+1"), "'+1+1");
  assert.equal(sanitizeCsvCell("-1+1"), "'-1+1");
  assert.equal(sanitizeCsvCell("@SUM(A1)"), "'@SUM(A1)");
  assert.equal(sanitizeCsvCell("Normal Name"), "Normal Name");
  assert.equal(
    toCsvRow(["ok", "=1+1", 'He said "hi"']),
    `ok,'=1+1,"He said ""hi"""`,
  );
});
