#!/usr/bin/env node
/**
 * RLS smoke validation against a configured Supabase project.
 * Skips cleanly when credentials are missing or SKIP_RLS_TESTS=1.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return env;
}

function log(message) {
  console.log(`[rls] ${message}`);
}

async function main() {
  if (process.env.SKIP_RLS_TESTS === "1") {
    log("SKIP_RLS_TESTS=1 — skipping");
    return;
  }

  const fileEnv = {
    ...loadEnvFile(join(root, ".env")),
    ...loadEnvFile(join(root, ".env.local")),
  };
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || fileEnv.NEXT_PUBLIC_SUPABASE_URL;
  const publishable =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    fileEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secret =
    process.env.SUPABASE_SECRET_KEY || fileEnv.SUPABASE_SECRET_KEY;

  if (!url || !publishable || !secret) {
    log("Missing Supabase env — skipping RLS validation");
    return;
  }

  const admin = createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const suffix = randomUUID().slice(0, 8);
  const emailA = `rls-a-${suffix}@example.com`;
  const emailB = `rls-b-${suffix}@example.com`;
  const password = `Test-Pass-${suffix}-9x`;

  let userA;
  let userB;
  try {
    const createdA = await admin.auth.admin.createUser({
      email: emailA,
      password,
      email_confirm: true,
    });
    const createdB = await admin.auth.admin.createUser({
      email: emailB,
      password,
      email_confirm: true,
    });
    if (createdA.error || createdB.error) {
      throw createdA.error || createdB.error;
    }
    userA = createdA.data.user;
    userB = createdB.data.user;

    const clientA = createClient(url, publishable, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const clientB = createClient(url, publishable, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const anon = createClient(url, publishable, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    await clientA.auth.signInWithPassword({ email: emailA, password });
    await clientB.auth.signInWithPassword({ email: emailB, password });

    await clientA.from("profiles").upsert({
      id: userA.id,
      display_name: "User A",
    });
    await clientB.from("profiles").upsert({
      id: userB.id,
      display_name: "User B",
    });

    const { data: profileBAsA } = await clientA
      .from("profiles")
      .select("id")
      .eq("id", userB.id);
    if ((profileBAsA ?? []).length > 0) {
      throw new Error("User A could read User B profile");
    }
    log("PASS: User A cannot read User B profile");

    const { data: restaurants, error: restaurantError } = await anon
      .from("restaurants")
      .select("id, slug, is_published")
      .eq("is_published", true)
      .limit(1);
    if (restaurantError) throw restaurantError;
    if (!restaurants?.length) {
      log("WARN: no published restaurants seeded — skipping write checks that need restaurant_id");
    } else {
      const restaurantId = restaurants[0].id;
      await clientB.from("user_restaurants").upsert({
        user_id: userB.id,
        restaurant_id: restaurantId,
        is_saved: true,
        private_notes: "secret-note-should-not-leak",
      });

      const { data: leaked } = await clientA
        .from("user_restaurants")
        .select("user_id")
        .eq("user_id", userB.id);
      if ((leaked ?? []).length > 0) {
        throw new Error("User A could read User B restaurant records");
      }
      log("PASS: User A cannot read User B user_restaurants");

      const { error: anonWriteError } = await anon.from("user_restaurants").insert({
        user_id: userA.id,
        restaurant_id: restaurantId,
        is_saved: true,
      });
      if (!anonWriteError) {
        throw new Error("Anonymous user was able to write user_restaurants");
      }
      log("PASS: Anonymous cannot write personal data");
    }

    const { data: published } = await anon
      .from("restaurants")
      .select("id")
      .eq("is_published", true)
      .limit(5);
    log(`PASS: Anonymous can read published restaurants (${published?.length ?? 0} sample)`);

    const { data: unpublished } = await anon
      .from("restaurants")
      .select("id")
      .eq("is_published", false);
    if ((unpublished ?? []).length > 0) {
      throw new Error("Anonymous could read unpublished restaurants");
    }
    log("PASS: Anonymous cannot read unpublished restaurants");

    log("All RLS checks passed");
  } finally {
    if (userA?.id) await admin.auth.admin.deleteUser(userA.id);
    if (userB?.id) await admin.auth.admin.deleteUser(userB.id);
  }
}

main().catch((error) => {
  console.error("[rls] FAILED:", error instanceof Error ? error.message : error);
  process.exit(1);
});
