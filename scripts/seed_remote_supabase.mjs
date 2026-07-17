#!/usr/bin/env node
/**
 * Upsert restaurants + reservations to a hosted Supabase project via the secret key.
 * Never prints secret values.
 */
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const NAMESPACE = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

function loadEnv() {
  const env = {};
  for (const file of [".env", ".env.local"]) {
    const path = join(root, file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
    }
  }
  return env;
}

function restaurantId(slug) {
  const ns = Buffer.from(NAMESPACE.replace(/-/g, ""), "hex");
  const hash = createHash("sha1")
    .update(Buffer.concat([ns, Buffer.from(`mdp:restaurant:${slug}`, "utf8")]))
    .digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = hash.subarray(0, 16).toString("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

function readJson(rel) {
  return JSON.parse(readFileSync(join(root, rel), "utf8"));
}

async function main() {
  const env = loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY || env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
    process.exit(1);
  }

  const admin = createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const restaurants = readJson("data/restaurants.json").restaurants;
  const geocodes = readJson("data/geocodes.json");
  const overrides = existsSync(join(root, "data/geocode-overrides.json"))
    ? readJson("data/geocode-overrides.json")
    : { overrides: [] };
  const reservations = readJson("data/reservations.json").records;
  const reservationOverrides = existsSync(
    join(root, "data/reservation-overrides.json"),
  )
    ? readJson("data/reservation-overrides.json").overrides ?? {}
    : {};

  const overrideBySlug = new Map(
    (overrides.overrides ?? []).map((item) => [item.restaurantSlug, item]),
  );

  const rows = restaurants.map((restaurant) => {
    const override = overrideBySlug.get(restaurant.slug);
    const geo = geocodes.records?.[restaurant.slug];
    let latitude = null;
    let longitude = null;
    if (override) {
      latitude = override.latitude;
      longitude = override.longitude;
    } else if (
      geo?.approved &&
      typeof geo.latitude === "number" &&
      typeof geo.longitude === "number"
    ) {
      latitude = geo.latitude;
      longitude = geo.longitude;
    }
    return {
      id: restaurantId(restaurant.slug),
      slug: restaurant.slug,
      name: restaurant.name,
      stars: restaurant.stars,
      cuisine: restaurant.cuisine,
      price: restaurant.price || null,
      city: restaurant.city,
      state: restaurant.state,
      state_code: restaurant.stateCode,
      address: restaurant.address || null,
      michelin_guide_url: restaurant.michelinGuideUrl || null,
      website_url: restaurant.website || null,
      latitude,
      longitude,
      is_published: true,
    };
  });

  for (let i = 0; i < rows.length; i += 50) {
    const chunk = rows.slice(i, i + 50);
    const { error } = await admin.from("restaurants").upsert(chunk, {
      onConflict: "id",
    });
    if (error) throw error;
  }

  const slugSet = new Set(restaurants.map((item) => item.slug));
  const reservationRows = [];
  for (const [slug, base] of Object.entries(reservations)) {
    if (!slugSet.has(slug)) continue;
    const record = { ...base, ...(reservationOverrides[slug] ?? {}) };
    reservationRows.push({
      restaurant_id: restaurantId(slug),
      reservation_url: record.reservationUrl ?? null,
      provider: record.provider ?? null,
      status: record.status ?? "unknown",
      source_type: record.sourceType ?? null,
      confidence: record.confidence ?? null,
      verified_at: record.verifiedAt ?? null,
      notes: record.notes ?? null,
    });
  }

  for (let i = 0; i < reservationRows.length; i += 50) {
    const chunk = reservationRows.slice(i, i + 50);
    const { error } = await admin
      .from("restaurant_reservations")
      .upsert(chunk, { onConflict: "restaurant_id" });
    if (error) throw error;
  }

  const { count: restaurantCount, error: countError } = await admin
    .from("restaurants")
    .select("*", { count: "exact", head: true });
  if (countError) throw countError;

  console.log(
    JSON.stringify(
      {
        restaurantsUpserted: rows.length,
        reservationsUpserted: reservationRows.length,
        restaurantsInDb: restaurantCount,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
