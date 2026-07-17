#!/usr/bin/env node
/**
 * Fixture tests for restaurant diff + dry-run apply safety.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function runPython(script, args, env = {}) {
  return spawnSync("python3", [script, ...args], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

test("data:diff detects new, removed, star change, and field changes", () => {
  const dir = mkdtempSync(join(tmpdir(), "mdp-diff-"));
  try {
    const canonical = JSON.parse(
      readFileSync(join(root, "data/restaurants.json"), "utf8"),
    );
    assert.equal(canonical.restaurants.length, 271);

    const sample = structuredClone(canonical);
    const first = sample.restaurants[0];
    const second = sample.restaurants[1];
    const removed = sample.restaurants[2];

    // Star upgrade on first
    first.stars = first.stars === 3 ? 2 : first.stars + 1;
    // Website change on second
    second.website = "https://example-changed.example/";
    // Drop third (removed_from_current_import)
    sample.restaurants = sample.restaurants.filter((r) => r.slug !== removed.slug);
    // Add a brand-new restaurant
    sample.restaurants.push({
      slug: "phase7-test-bistro-austin-tx",
      name: "Phase7 Test Bistro",
      stars: 1,
      cuisine: "Contemporary",
      cuisineSlug: "contemporary",
      price: "$$$",
      city: "Austin",
      citySlug: "austin",
      state: "Texas",
      stateCode: "TX",
      stateSlug: "texas",
      address: "123 Test St, Austin, TX, 78701, USA",
      michelinGuideUrl: "https://guide.michelin.com/us/en/texas/austin/restaurant/phase7-test-bistro",
      website: "https://phase7-test.example/",
    });
    sample.totals.restaurants = sample.restaurants.length;

    const incomingPath = join(dir, "incoming.json");
    const outPath = join(dir, "diff.json");
    writeFileSync(incomingPath, JSON.stringify(sample, null, 2));

    const result = runPython("scripts/diff_restaurants.py", [
      "--file",
      incomingPath,
      "--out",
      outPath,
    ]);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(readFileSync(outPath, "utf8"));
    assert.equal(report.summary.new, 1);
    assert.equal(report.summary.removed_from_current_import, 1);
    assert.ok(report.summary.updated >= 2);
    const statuses = new Set(report.records.map((r) => r.status));
    assert.ok(statuses.has("new"));
    assert.ok(statuses.has("removed_from_current_import"));
    const starChange = report.records.some((r) =>
      (r.changes || []).some((c) =>
        c.type === "star_upgrade" || c.type === "star_downgrade",
      ),
    );
    assert.ok(starChange);
    const websiteChange = report.records.some((r) =>
      (r.changes || []).some((c) => c.type === "website_change"),
    );
    assert.ok(websiteChange);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("data:apply-update defaults to dry-run and requires reviewed diff", () => {
  const dir = mkdtempSync(join(tmpdir(), "mdp-apply-"));
  try {
    const canonicalPath = join(root, "data/restaurants.json");
    const checksum = sha256(canonicalPath);
    const diffPath = join(dir, "diff.json");
    writeFileSync(
      diffPath,
      JSON.stringify(
        {
          version: 1,
          sourceChecksum: checksum,
          reviewed: false,
          records: [],
          summary: {},
        },
        null,
        2,
      ),
    );
    const blocked = runPython("scripts/apply_restaurant_update.py", [
      "--file",
      canonicalPath,
      "--diff",
      diffPath,
    ]);
    assert.notEqual(blocked.status, 0);
    assert.match(blocked.stderr, /not marked reviewed/);

    writeFileSync(
      diffPath,
      JSON.stringify(
        {
          version: 1,
          sourceChecksum: checksum,
          reviewed: true,
          records: [],
          summary: {},
        },
        null,
        2,
      ),
    );
    const dry = runPython("scripts/apply_restaurant_update.py", [
      "--file",
      canonicalPath,
      "--diff",
      diffPath,
    ]);
    assert.equal(dry.status, 0, dry.stderr);
    assert.match(dry.stdout, /Dry run only/);

    const prod = runPython("scripts/apply_restaurant_update.py", [
      "--file",
      canonicalPath,
      "--diff",
      diffPath,
      "--confirm",
      "--production",
    ]);
    assert.notEqual(prod.status, 0);
    assert.match(prod.stderr, /production/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("identity matching prefers Michelin URL over name-only ambiguity", () => {
  const dir = mkdtempSync(join(tmpdir(), "mdp-identity-"));
  try {
    mkdirSync(join(dir, "lib"), { recursive: true });
    const script = `
from lib.identity import IdentityIndex
current = [
  {"slug":"alpha-city-ca","name":"Alpha","city":"City","state":"California","stateCode":"CA","address":"1 Main","michelinGuideUrl":"https://guide.michelin.com/a"},
  {"slug":"alpha-town-ca","name":"Alpha","city":"Town","state":"California","stateCode":"CA","address":"2 Main","michelinGuideUrl":"https://guide.michelin.com/b"},
]
incoming = {"slug":"alpha-elsewhere-ca","name":"Alpha","city":"Elsewhere","state":"California","stateCode":"CA","address":"9 Main","michelinGuideUrl":"https://guide.michelin.com/a"}
index = IdentityIndex(current, {})
print(index.match(incoming)["matchedSlug"])
print(index.match(incoming)["method"])
ambiguous = {"slug":"x","name":"Alpha","city":"Z","state":"California","stateCode":"CA","address":"z","michelinGuideUrl":""}
print(index.match(ambiguous)["matchedSlug"])
print(index.match(ambiguous)["method"])
`;
    writeFileSync(join(dir, "check.py"), script);
    const result = spawnSync("python3", [join(dir, "check.py")], {
      cwd: join(root, "scripts"),
      encoding: "utf8",
      env: { ...process.env, PYTHONPATH: join(root, "scripts") },
    });
    assert.equal(result.status, 0, result.stderr);
    const lines = result.stdout.trim().split("\n");
    assert.equal(lines[0], "alpha-city-ca");
    assert.equal(lines[1], "michelin_guide_url");
    assert.equal(lines[2], "None");
    assert.equal(lines[3], "unmatched");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
