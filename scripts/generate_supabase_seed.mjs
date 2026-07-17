#!/usr/bin/env node
/**
 * Generate deterministic supabase/seed.sql from committed restaurant data.
 * Usage:
 *   node scripts/generate_supabase_seed.mjs
 *   node scripts/generate_supabase_seed.mjs --validate-only
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const validateOnly = process.argv.includes("--validate-only");

/** Project namespace for deterministic restaurant UUIDs (UUID v5). */
const NAMESPACE = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(root, relativePath), "utf8"));
}

function uuidToBytes(uuid) {
  const hex = uuid.replace(/-/g, "");
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToUuid(bytes) {
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

/** RFC 4122 UUID v5 */
function uuidV5(name, namespace = NAMESPACE) {
  const nsBytes = uuidToBytes(namespace);
  const nameBytes = Buffer.from(name, "utf8");
  const hash = createHash("sha1")
    .update(Buffer.concat([Buffer.from(nsBytes), nameBytes]))
    .digest();
  const bytes = Uint8Array.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return bytesToUuid(bytes);
}

function restaurantId(slug) {
  return uuidV5(`mdp:restaurant:${slug}`);
}

function sqlLiteral(value) {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "null";
    return String(value);
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

function loadApprovedCoordinates(restaurants, geocodes, overrides) {
  const overrideBySlug = new Map(
    (overrides.overrides ?? []).map((item) => [item.restaurantSlug, item]),
  );
  const coords = new Map();
  for (const restaurant of restaurants) {
    const override = overrideBySlug.get(restaurant.slug);
    if (override) {
      coords.set(restaurant.slug, {
        latitude: override.latitude,
        longitude: override.longitude,
      });
      continue;
    }
    const record = geocodes.records?.[restaurant.slug];
    if (
      record &&
      record.approved &&
      typeof record.latitude === "number" &&
      typeof record.longitude === "number"
    ) {
      coords.set(restaurant.slug, {
        latitude: record.latitude,
        longitude: record.longitude,
      });
    }
  }
  return coords;
}

function mergeReservationRecords(base, overrideFile) {
  const records = { ...(base.records ?? {}) };
  const overrides = overrideFile?.overrides ?? {};
  for (const [slug, patch] of Object.entries(overrides)) {
    records[slug] = { ...(records[slug] ?? {}), ...patch, restaurantSlug: slug };
  }
  return records;
}

function buildReport({ restaurants, coords, reservations }) {
  const starTotals = { 1: 0, 2: 0, 3: 0 };
  for (const restaurant of restaurants) {
    starTotals[restaurant.stars] += 1;
  }
  const statusCounts = {};
  for (const record of Object.values(reservations)) {
    const status = record.status ?? "unknown";
    statusCounts[status] = (statusCounts[status] ?? 0) + 1;
  }
  return {
    restaurants: restaurants.length,
    starTotals,
    withCoordinates: coords.size,
    coordinateCoveragePct: Number(
      ((coords.size / restaurants.length) * 100).toFixed(1),
    ),
    reservationRecords: Object.keys(reservations).length,
    reservationStatusCounts: statusCounts,
    generatedAt: new Date().toISOString(),
  };
}

function main() {
  const restaurantData = readJson("data/restaurants.json");
  const geocodes = readJson("data/geocodes.json");
  const overrides = existsSync(join(root, "data/geocode-overrides.json"))
    ? readJson("data/geocode-overrides.json")
    : { overrides: [] };
  const reservationData = readJson("data/reservations.json");
  const reservationOverrides = existsSync(
    join(root, "data/reservation-overrides.json"),
  )
    ? readJson("data/reservation-overrides.json")
    : { overrides: {} };

  const restaurants = restaurantData.restaurants;
  const coords = loadApprovedCoordinates(restaurants, geocodes, overrides);
  const reservations = mergeReservationRecords(
    reservationData,
    reservationOverrides,
  );
  const restaurantSlugSetForReport = new Set(
    restaurants.map((item) => item.slug),
  );
  const reservationsForSeed = Object.fromEntries(
    Object.entries(reservations).filter(([slug]) =>
      restaurantSlugSetForReport.has(slug),
    ),
  );
  const report = buildReport({
    restaurants,
    coords,
    reservations: reservationsForSeed,
  });
  report.skippedReservationSlugs =
    Object.keys(reservations).length - Object.keys(reservationsForSeed).length;

  if (restaurants.length !== 271) {
    console.error(`Expected 271 restaurants, got ${restaurants.length}`);
    process.exit(1);
  }
  if (
    report.starTotals[1] !== 216 ||
    report.starTotals[2] !== 39 ||
    report.starTotals[3] !== 16
  ) {
    console.error("Star totals do not match audit expectations", report.starTotals);
    process.exit(1);
  }

  const reportMd = `# Seed reconciliation report

Generated: ${report.generatedAt}

| Metric | Value |
| --- | --- |
| Restaurants | ${report.restaurants} |
| 1★ | ${report.starTotals[1]} |
| 2★ | ${report.starTotals[2]} |
| 3★ | ${report.starTotals[3]} |
| With coordinates | ${report.withCoordinates} (${report.coordinateCoveragePct}%) |
| Reservation records | ${report.reservationRecords} |

## Reservation status counts

| Status | Count |
| --- | --- |
${Object.entries(report.reservationStatusCounts)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([status, count]) => `| ${status} | ${count} |`)
  .join("\n")}

## Notes

- Restaurant IDs are deterministic UUID v5 values from slug.
- Seed upserts restaurants and reservations only; user personal data is never deleted.
- Runtime reservation rows come from \`data/reservations.json\` (+ overrides), not candidate files.
`;

  writeFileSync(join(root, "docs/seed-reconciliation-report.md"), reportMd);

  console.log(JSON.stringify(report, null, 2));

  if (validateOnly) {
    console.log("Validation OK");
    return;
  }

  const lines = [];
  lines.push("-- Generated by scripts/generate_supabase_seed.mjs");
  lines.push(`-- ${report.generatedAt}`);
  lines.push("-- Do not edit by hand; regenerate from local JSON datasets.");
  lines.push("begin;");
  lines.push("");
  lines.push("-- Upsert canonical restaurants (preserve stable IDs).");

  for (const restaurant of restaurants) {
    const id = restaurantId(restaurant.slug);
    const point = coords.get(restaurant.slug);
    lines.push(
      [
        "insert into public.restaurants (",
        "id, slug, name, stars, cuisine, price, city, state, state_code, address,",
        "michelin_guide_url, website_url, latitude, longitude, is_published, source_updated_at",
        ") values (",
        [
          sqlLiteral(id),
          sqlLiteral(restaurant.slug),
          sqlLiteral(restaurant.name),
          restaurant.stars,
          sqlLiteral(restaurant.cuisine),
          sqlLiteral(restaurant.price || null),
          sqlLiteral(restaurant.city),
          sqlLiteral(restaurant.state),
          sqlLiteral(restaurant.stateCode),
          sqlLiteral(restaurant.address || null),
          sqlLiteral(restaurant.michelinGuideUrl || null),
          sqlLiteral(restaurant.website || null),
          point ? point.latitude : "null",
          point ? point.longitude : "null",
          "true",
          sqlLiteral(restaurantData.source?.importedAt ?? null),
        ].join(", "),
        ")",
        "on conflict (id) do update set",
        "  slug = excluded.slug,",
        "  name = excluded.name,",
        "  stars = excluded.stars,",
        "  cuisine = excluded.cuisine,",
        "  price = excluded.price,",
        "  city = excluded.city,",
        "  state = excluded.state,",
        "  state_code = excluded.state_code,",
        "  address = excluded.address,",
        "  michelin_guide_url = excluded.michelin_guide_url,",
        "  website_url = excluded.website_url,",
        "  latitude = excluded.latitude,",
        "  longitude = excluded.longitude,",
        "  is_published = excluded.is_published,",
        "  source_updated_at = excluded.source_updated_at,",
        "  updated_at = timezone('utc', now());",
      ].join("\n"),
    );
  }

  lines.push("");
  lines.push(
    "-- Replace reservation enrichment for seeded restaurants (never touches user tables).",
  );
  lines.push(
    "delete from public.restaurant_reservations where restaurant_id in (select id from public.restaurants);",
  );

  for (const [slug, record] of Object.entries(reservationsForSeed)) {
    const id = restaurantId(slug);
    lines.push(
      [
        "insert into public.restaurant_reservations (",
        "restaurant_id, reservation_url, provider, status, source_type, confidence, verified_at, notes",
        ") values (",
        [
          sqlLiteral(id),
          sqlLiteral(record.reservationUrl ?? null),
          sqlLiteral(record.provider ?? null),
          sqlLiteral(record.status ?? "unknown"),
          sqlLiteral(record.sourceType ?? null),
          sqlLiteral(record.confidence ?? null),
          sqlLiteral(record.verifiedAt ?? null),
          sqlLiteral(record.notes ?? null),
        ].join(", "),
        ")",
        "on conflict (restaurant_id) do update set",
        "  reservation_url = excluded.reservation_url,",
        "  provider = excluded.provider,",
        "  status = excluded.status,",
        "  source_type = excluded.source_type,",
        "  confidence = excluded.confidence,",
        "  verified_at = excluded.verified_at,",
        "  notes = excluded.notes,",
        "  updated_at = timezone('utc', now());",
      ].join("\n"),
    );
  }

  lines.push("");
  lines.push("-- Seed integrity checks");
  lines.push("do $$");
  lines.push("declare");
  lines.push("  restaurant_count integer;");
  lines.push("  one_star integer;");
  lines.push("  two_star integer;");
  lines.push("  three_star integer;");
  lines.push("begin");
  lines.push("  select count(*) into restaurant_count from public.restaurants;");
  lines.push(
    "  select count(*) into one_star from public.restaurants where stars = 1;",
  );
  lines.push(
    "  select count(*) into two_star from public.restaurants where stars = 2;",
  );
  lines.push(
    "  select count(*) into three_star from public.restaurants where stars = 3;",
  );
  lines.push("  if restaurant_count <> 271 then");
  lines.push(
    "    raise exception 'Seed expected 271 restaurants, found %', restaurant_count;",
  );
  lines.push("  end if;");
  lines.push(
    "  if one_star <> 216 or two_star <> 39 or three_star <> 16 then",
  );
  lines.push(
    "    raise exception 'Seed star totals mismatch: % / % / %', one_star, two_star, three_star;",
  );
  lines.push("  end if;");
  lines.push("end $$;");
  lines.push("");
  lines.push("commit;");
  const sql = `${lines.join("\n")}\n`;
  writeFileSync(join(root, "supabase/seed.sql"), sql);
  console.log(`Wrote supabase/seed.sql (${sql.length} bytes)`);
}

main();
