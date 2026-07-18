/**
 * Phase 12 static + production HTTP status checks.
 * Run after `npm run build`. Optionally set PHASE12_BASE_URL to a running
 * `next start` origin (default http://127.0.0.1:3112).
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.env.PHASE12_BASE_URL ?? "http://127.0.0.1:3112";

describe("Phase 12 presentation cleanup", () => {
  it("removes legacy presentation trees", () => {
    for (const rel of [
      "src/components/home",
      "src/components/explore",
      "src/components/restaurant",
      "src/components/layout",
      "src/components/ui",
      "src/app/dev/google-places-spike",
      "src/components/google-places/GooglePlacesSpikeClient.tsx",
      "src/app/dev/stitch-account-preview",
    ]) {
      assert.equal(existsSync(join(root, rel)), false, `${rel} should be gone`);
    }
  });

  it("keeps a single Stitch styleguide + restaurant gallery", () => {
    assert.equal(
      existsSync(join(root, "src/app/dev/stitch-foundation/page.tsx")),
      true,
    );
    assert.equal(
      existsSync(join(root, "src/app/dev/stitch-restaurant-components/page.tsx")),
      true,
    );
  });

  it("ships App Router not-found and error boundaries", () => {
    for (const rel of [
      "src/app/not-found.tsx",
      "src/app/error.tsx",
      "src/app/global-error.tsx",
    ]) {
      assert.equal(existsSync(join(root, rel)), true, `${rel} missing`);
    }
    const notFound = readFileSync(join(root, "src/app/not-found.tsx"), "utf8");
    assert.match(notFound, /NotFoundState|This table could not be found/);
  });

  it("globals.css uses --dp-* as the body source of truth", () => {
    const css = readFileSync(join(root, "src/app/globals.css"), "utf8");
    assert.match(css, /background:\s*var\(--dp-bg\)/);
    assert.match(css, /color:\s*var\(--dp-ink\)/);
    assert.doesNotMatch(css, /--shadow-float/);
    assert.doesNotMatch(css, /\.container-editorial/);
    assert.doesNotMatch(css, /\.paper-texture/);
    assert.doesNotMatch(css, /--radius-sm:\s*6px/);
  });

  it("Google unavailable copy matches Phase 12 language", () => {
    const config = readFileSync(
      join(root, "src/lib/google-places/config.ts"),
      "utf8",
    );
    assert.match(
      config,
      /Live Google place information is currently unavailable/,
    );
  });
});

describe("Phase 12 production HTTP status (opt-in live server)", () => {
  it("invalid public resources return HTTP 404", async (t) => {
    let healthy;
    try {
      const home = await fetch(`${base}/`, { redirect: "manual" });
      const html = await home.text();
      healthy =
        home.ok &&
        /Dining Passport/i.test(html) &&
        !/wrong application/i.test(html);
    } catch {
      healthy = false;
    }
    if (!healthy) {
      t.skip(
        `No Dining Passport server at ${base}. Start with: npm run start -- --hostname 127.0.0.1 --port 3112`,
      );
      return;
    }

    const paths = [
      "/this-route-does-not-exist-phase12",
      "/restaurants/not-a-real-slug-zzz",
      "/usa/not-a-real-state-zzz",
      "/cities/not-a-real-city-zzz",
      "/cuisines/not-a-real-cuisine-zzz",
      "/stars/4",
    ];

    for (const path of paths) {
      const res = await fetch(`${base}${path}`, { redirect: "manual" });
      assert.equal(res.status, 404, `${path} expected 404, got ${res.status}`);
      const body = await res.text();
      assert.match(body, /This table could not be found/i);
      assert.match(body, /Dining Passport/i);
    }

    const okHome = await fetch(`${base}/`);
    assert.equal(okHome.status, 200);
    const okExplore = await fetch(`${base}/explore`);
    assert.equal(okExplore.status, 200);
  });
});
