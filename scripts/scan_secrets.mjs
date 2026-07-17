#!/usr/bin/env node
/**
 * Lightweight secret scan for Google Places + common credential patterns.
 * Fails if GOOGLE_PLACES_MATCHING_API_KEY appears in client-bound sources.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const failures = [];

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "test-results",
  "playwright-report",
  "coverage",
  "data/.google-places-tmp",
]);

const INTERESTING =
  /\.(ts|tsx|js|jsx|mjs|cjs|md|json|css|html|env\.example)$/i;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (INTERESTING.test(name) || name === ".env.example") out.push(full);
  }
  return out;
}

const files = walk(root);
for (const file of files) {
  const rel = relative(root, file);
  if (rel.includes(`${join("data", ".google-places-tmp")}`)) continue;
  if (rel.endsWith(".env.local") || rel.endsWith(".env")) continue;
  const text = readFileSync(file, "utf8");

  if (
    /GOOGLE_PLACES_MATCHING_API_KEY\s*[:=]\s*['"`]?AIza/.test(text) ||
    /NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY\s*[:=]\s*['"`]?AIza[0-9A-Za-z_-]{20,}/.test(
      text,
    )
  ) {
    failures.push(`${rel}: looks like a real Google API key value`);
  }

  if (
    rel.startsWith(`src${join("/", "")}`) &&
    /process\.env\.GOOGLE_PLACES_MATCHING_API_KEY/.test(text)
  ) {
    failures.push(`${rel}: matching key referenced from src/`);
  }

  if (
    (rel.startsWith("src/components") || rel.startsWith("src/app")) &&
    /GOOGLE_PLACES_MATCHING_API_KEY/.test(text) &&
    !rel.includes("google-cloud-setup")
  ) {
    failures.push(`${rel}: matching key string in client surface`);
  }
}

// Bundle check when present
try {
  const bundleDir = join(root, ".next", "static", "chunks");
  const chunks = walk(bundleDir);
  for (const file of chunks) {
    const text = readFileSync(file, "utf8");
    if (text.includes("GOOGLE_PLACES_MATCHING_API_KEY")) {
      failures.push(
        `${relative(root, file)}: matching key name found in client bundle`,
      );
    }
  }
} catch {
  // build output optional
}

if (failures.length) {
  console.error("FAIL secrets scan");
  for (const row of failures) console.error(` - ${row}`);
  process.exit(1);
}

console.log(`PASS secrets scan (${files.length} files)`);
