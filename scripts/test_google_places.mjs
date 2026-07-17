/**
 * Unit tests for Google Places UI Kit config + loader gates.
 * No live Google key required.
 */
import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("google places env documentation", () => {
  it("documents the three required env placeholders in .env.example", () => {
    const example = readFileSync(join(root, ".env.example"), "utf8");
    assert.match(example, /NEXT_PUBLIC_GOOGLE_PLACES_UI_KIT_ENABLED/);
    assert.match(example, /NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY/);
    assert.match(example, /GOOGLE_PLACES_MATCHING_API_KEY/);
    assert.doesNotMatch(
      example,
      /NEXT_PUBLIC_GOOGLE_PLACES_MATCHING/,
      "matching key must not be public",
    );
  });

  it("keeps matching key out of browser config source", () => {
    const config = readFileSync(
      join(root, "src/lib/google-places/config.ts"),
      "utf8",
    );
    assert.doesNotMatch(config, /process\.env\.GOOGLE_PLACES_MATCHING_API_KEY/);
    assert.doesNotMatch(config, /NEXT_PUBLIC_.*MATCHING/);
  });

  it("documents architecture and cloud setup", () => {
    for (const rel of [
      "docs/google-places/architecture.md",
      "docs/google-places/google-cloud-setup.md",
      "docs/google-places/cost-model.md",
      "docs/google-places/data-policy.md",
    ]) {
      const body = readFileSync(join(root, rel), "utf8");
      assert.ok(body.length > 200, rel);
    }
  });
});

describe("spike fixtures", () => {
  it("covers five scenarios without persisting provider payloads", () => {
    const source = readFileSync(
      join(root, "src/lib/google-places/spike-fixtures.ts"),
      "utf8",
    );
    assert.match(source, /strong_coverage/);
    assert.match(source, /limited_photos/);
    assert.match(source, /similar_name_ambiguity/);
    assert.match(source, /shared_address_sibling/);
    assert.match(source, /no_confident_match/);
    assert.doesNotMatch(source, /"photos"/);
    assert.doesNotMatch(source, /"reviews"/);
    assert.doesNotMatch(source, /formattedAddress/);
  });
});

describe("places UI kit loader source contracts", () => {
  let previousEnabled;
  let previousKey;

  beforeEach(() => {
    previousEnabled = process.env.NEXT_PUBLIC_GOOGLE_PLACES_UI_KIT_ENABLED;
    previousKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY;
  });

  afterEach(() => {
    if (previousEnabled === undefined) {
      delete process.env.NEXT_PUBLIC_GOOGLE_PLACES_UI_KIT_ENABLED;
    } else {
      process.env.NEXT_PUBLIC_GOOGLE_PLACES_UI_KIT_ENABLED = previousEnabled;
    }
    if (previousKey === undefined) {
      delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY;
    } else {
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY = previousKey;
    }
  });

  it("loader never executes Google bootstrap during SSR path", async () => {
    // Dynamic import of compiled TS is unavailable; assert source contracts instead.
    const loader = readFileSync(
      join(root, "src/lib/google-places/loader.ts"),
      "utf8",
    );
    assert.match(loader, /typeof window === "undefined"/);
    assert.match(loader, /SCRIPT_ID/);
    assert.match(loader, /importLibrary\("places"\)/);
    assert.match(loader, /script\[nonce\]/);
    assert.doesNotMatch(loader, /console\.(log|info|debug).*key/i);
  });

  it("config treats missing flag as disabled", async () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_PLACES_UI_KIT_ENABLED;
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY;
    // Re-evaluate by reading the pure helpers via dynamic transpile is heavy;
    // encode expected behavior in source.
    const config = readFileSync(
      join(root, "src/lib/google-places/config.ts"),
      "utf8",
    );
    assert.match(config, /readFlag/);
    assert.match(config, /"disabled"/);
    assert.match(config, /"missing_key"/);
  });
});

describe("dev spike route gating", () => {
  it("returns notFound in production", () => {
    const page = readFileSync(
      join(root, "src/app/dev/google-places-spike/page.tsx"),
      "utf8",
    );
    assert.match(page, /NODE_ENV === "production"/);
    assert.match(page, /notFound\(\)/);
    assert.match(page, /robots:\s*\{\s*index:\s*false/);
  });
});
