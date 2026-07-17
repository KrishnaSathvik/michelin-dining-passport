#!/usr/bin/env node
/**
 * Lightweight secret scan for committed text files.
 * Uses `git ls-files` via spawn (no shell) to avoid scanning ignored artifacts.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const patterns = [
  { name: "OpenAI key", re: /sk-[A-Za-z0-9]{20,}/ },
  { name: "AWS access key", re: /AKIA[0-9A-Z]{16}/ },
  {
    name: "Generic private key block",
    re: /-----BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY-----/,
  },
  {
    name: "JWT-looking secret",
    re: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
  },
];

function listedFiles() {
  const result = spawnSync("git", ["ls-files"], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr || "git ls-files failed");
  }
  return result.stdout.split("\n").filter(Boolean);
}

function shouldSkip(file) {
  if (
    file.endsWith(".png") ||
    file.endsWith(".jpg") ||
    file.endsWith(".xlsx") ||
    file.endsWith(".lock")
  ) {
    return true;
  }
  if (file.startsWith("docs/")) return true;
  if (file === ".env.example") return true;
  if (file.includes("scripts/scan_secrets.mjs")) return true;
  if (file.includes("scripts/test_")) return true;
  return false;
}

let failures = 0;
for (const file of listedFiles()) {
  if (shouldSkip(file)) continue;
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  for (const pattern of patterns) {
    if (pattern.re.test(text)) {
      console.error(`Potential secret (${pattern.name}) in ${file}`);
      failures += 1;
    }
  }
}

if (failures > 0) {
  console.error(`Secret scan failed with ${failures} finding(s).`);
  process.exit(1);
}
console.log("Secret scan OK");
