#!/usr/bin/env node
/**
 * Local opt-in Place ID matching via Maps JS in a headed/headless browser.
 *
 * Use when GOOGLE_PLACES_MATCHING_API_KEY is IP-restricted and cannot call
 * Places API (New) from this machine. Still persists only Place IDs + our
 * match metadata — never provider payloads.
 *
 * Requires:
 *   NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY
 *   NEXT_PUBLIC_GOOGLE_PLACES_UI_KIT_ENABLED=true (or at least a browser key)
 *   Local app reachable (defaults to http://localhost:3010)
 *
 * Usage:
 *   node scripts/match_google_place_ids_browser.mjs --limit 10
 *   node scripts/match_google_place_ids_browser.mjs --all
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

function loadEnvLocal() {
  try {
    const text = readFileSync(".env.local", "utf8");
    for (const line of text.splitlines?.() ?? text.split("\n")) {
      if (!line || line.startsWith("#") || !line.includes("=")) continue;
      const i = line.indexOf("=");
      const k = line.slice(0, i).trim();
      const v = line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "");
      if (k && !(k in process.env)) process.env[k] = v;
    }
  } catch {
    // optional
  }
}

loadEnvLocal();

const args = process.argv.slice(2);
const all = args.includes("--all");
const limitIdx = args.indexOf("--limit");
const limit = limitIdx >= 0 ? Number(args[limitIdx + 1] || 10) : all ? 0 : 10;
const slugsIdx = args.indexOf("--slugs");
const slugFilter = slugsIdx >= 0
  ? new Set(String(args[slugsIdx + 1] || "").split(",").map((s) => s.trim()).filter(Boolean))
  : null;
const base = process.env.MDP_MATCH_BASE_URL || "http://localhost:3010";

const browserKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY?.trim();
if (!browserKey) {
  console.error("NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY is not configured");
  process.exit(1);
}
console.log("browser key: configured");
console.log("mode: browser-assisted matching (local only)");

const restaurants = JSON.parse(readFileSync("data/restaurants.json", "utf8")).restaurants;
const geocodes = JSON.parse(readFileSync("data/geocodes.json", "utf8")).records || {};
const matchesPath = "data/google-place-ids.json";
const existing = JSON.parse(readFileSync(matchesPath, "utf8"));
const bySlug = new Map(existing.matches.map((m) => [m.restaurantSlug, m]));

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function domain(url) {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return host || null;
  } catch {
    return null;
  }
}

function nameScore(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  // Containment handles "SingleThread" vs "SingleThread Farm - Restaurant - Inn"
  if (na.includes(nb) || nb.includes(na)) {
    const shorter = na.length <= nb.length ? na : nb;
    const longer = na.length <= nb.length ? nb : na;
    const bigrams = (s) => {
      const out = [];
      for (let i = 0; i < s.length - 1; i++) out.push(s.slice(i, i + 2));
      return out;
    };
    const A = bigrams(shorter);
    const B = bigrams(longer);
    let hits = 0;
    const pool = B.slice();
    for (const g of A) {
      const idx = pool.indexOf(g);
      if (idx >= 0) {
        hits += 1;
        pool.splice(idx, 1);
      }
    }
    const dice = A.length && B.length ? (2 * hits) / (A.length + B.length) : 0;
    return Math.max(0.92, dice);
  }
  const ta = new Set(na.split(" ").filter(Boolean));
  const tb = new Set(nb.split(" ").filter(Boolean));
  if (ta.size && tb.size) {
    let inter = 0;
    for (const t of ta) if (tb.has(t)) inter += 1;
    const union = ta.size + tb.size - inter;
    const jaccard = inter / union;
    if ([...ta].every((t) => tb.has(t)) || [...tb].every((t) => ta.has(t))) {
      return Math.max(0.9, jaccard);
    }
    if (jaccard >= 0.5) return Math.max(0.8, jaccard);
  }
  // fallback dice
  const bigrams = (s) => {
    const out = [];
    for (let i = 0; i < s.length - 1; i++) out.push(s.slice(i, i + 2));
    return out;
  };
  const A = bigrams(na);
  const B = bigrams(nb);
  if (!A.length || !B.length) return 0;
  let hits = 0;
  const pool = B.slice();
  for (const g of A) {
    const idx = pool.indexOf(g);
    if (idx >= 0) {
      hits += 1;
      pool.splice(idx, 1);
    }
  }
  return (2 * hits) / (A.length + B.length);
}

function haversineM(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toR = (d) => (d * Math.PI) / 180;
  const dLat = toR(lat2 - lat1);
  const dLon = toR(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function sharedGroups(list) {
  const map = new Map();
  for (const r of list) {
    const key = normalize(r.address);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(r.slug);
  }
  const out = new Map();
  for (const group of map.values()) {
    if (group.length > 1) for (const slug of group) out.set(slug, group);
  }
  return out;
}

const siblings = sharedGroups(restaurants);

function scoreCandidate(restaurant, geocode, candidate, siblingSlugs) {
  const display = candidate.displayName || "";
  const formatted = candidate.formattedAddress || "";
  const types = new Set(candidate.types || []);
  const status = candidate.businessStatus || "";
  const ns = nameScore(restaurant.name, display);
  const streetOurs = normalize(restaurant.address).replace(
    /\b(street|st|avenue|ave|boulevard|blvd|road|rd|drive|dr|lane|ln|way|court|ct)\b/g,
    "",
  ).replace(/\s+/g, " ").trim();
  const streetTheirs = normalize(formatted).replace(
    /\b(street|st|avenue|ave|boulevard|blvd|road|rd|drive|dr|lane|ln|way|court|ct)\b/g,
    "",
  ).replace(/\s+/g, " ").trim();
  const streetOk = Boolean(streetOurs) && (streetOurs.includes(streetTheirs.slice(0, 12)) || streetTheirs.includes(streetOurs.slice(0, 12)));
  const cityOk = normalize(restaurant.city) && normalize(formatted).includes(normalize(restaurant.city));
  const stateOk = normalize(formatted).includes(normalize(restaurant.stateCode || restaurant.state));
  let distanceM = null;
  if (
    geocode?.approved &&
    Number.isFinite(geocode.latitude) &&
    Number.isFinite(geocode.longitude) &&
    Number.isFinite(candidate.lat) &&
    Number.isFinite(candidate.lng)
  ) {
    distanceM = haversineM(geocode.latitude, geocode.longitude, candidate.lat, candidate.lng);
  }
  const ourDomain = domain(restaurant.website);
  const theirDomain = domain(candidate.websiteUri);
  const domainOk = Boolean(ourDomain && theirDomain && ourDomain === theirDomain);
  const typeOk = ["restaurant", "fine_dining_restaurant", "food", "sushi_restaurant"].some((t) => types.has(t)) || types.size === 0;
  const openOk = !status || status === "OPERATIONAL";
  const reasons = [];
  if (ns >= 0.92) reasons.push("strong_name");
  else if (ns >= 0.8) reasons.push("good_name");
  else reasons.push("weak_name");
  if (streetOk) reasons.push("street");
  if (cityOk && stateOk) reasons.push("city_state");
  if (distanceM != null) {
    if (distanceM <= 75) reasons.push("coords_close");
    else if (distanceM <= 250) reasons.push("coords_near");
    else reasons.push("coords_far");
  }
  if (domainOk) reasons.push("website_domain");
  if (typeOk) reasons.push("restaurant_type");
  if (!openOk) reasons.push("not_operational");
  if ((siblingSlugs || []).length > 1) reasons.push("shared_address_sibling");

  const strongLocation = streetOk && cityOk && stateOk;
  const strongCoords = distanceM != null && distanceM <= 75;
  let autoApprove = false;
  let confidence = "low";
  if (ns >= 0.9 && openOk && typeOk && (strongLocation || strongCoords || domainOk) && !reasons.includes("shared_address_sibling")) {
    if ((strongLocation && (strongCoords || domainOk)) || (strongCoords && domainOk)) {
      autoApprove = true;
      confidence = "high";
    } else confidence = "medium";
  } else if (ns >= 0.85 && (strongLocation || strongCoords)) {
    confidence = "medium";
  }
  if (reasons.includes("shared_address_sibling")) {
    autoApprove = false;
    if (confidence === "high") confidence = "medium";
  }
  if (ns < 0.75) {
    autoApprove = false;
    confidence = "low";
  }
  return {
    placeId: candidate.id,
    scoreName: Number(ns.toFixed(4)),
    distanceM: distanceM == null ? null : Number(distanceM.toFixed(1)),
    confidence,
    autoApprove,
    reasons,
  };
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${base}/dev/google-places-spike`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(1500);

// Ensure maps bootstrap + places library
const ready = await page.evaluate(async (key) => {
  if (!window.google?.maps?.importLibrary) {
    await new Promise((resolve, reject) => {
      const existing = document.getElementById("mdp-match-bootstrap");
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("bootstrap")), { once: true });
        return;
      }
      const s = document.createElement("script");
      s.id = "mdp-match-bootstrap";
      s.textContent = `(g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=\`https://maps.\${c}apis.com/maps/api/js?\`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({key:${JSON.stringify(key)},v:"weekly"});`;
      document.head.append(s);
      // bootstrap defines importLibrary sync
      if (window.google?.maps?.importLibrary) resolve();
      else reject(new Error("bootstrap-missing"));
    });
  }
  await google.maps.importLibrary("places");
  return Boolean(google.maps.importLibrary);
}, browserKey);

if (!ready) {
  console.error("Failed to load Places library in browser");
  await browser.close();
  process.exit(1);
}

let targets = restaurants;
if (slugFilter?.size) {
  targets = restaurants.filter((r) => slugFilter.has(r.slug));
} else if (!all) {
  targets = restaurants.slice(0, limit || 10);
}
let processed = 0;
const today = new Date().toISOString().slice(0, 10);

const FINAL = new Set(["matched", "manually_approved", "rejected", "no_match"]);

for (const restaurant of targets) {
  const current = bySlug.get(restaurant.slug);
  if (current && FINAL.has(current.status) && !args.includes("--force")) {
    console.log(`${restaurant.slug}: skip existing ${current.status}`);
    continue;
  }
  const geocode = geocodes[restaurant.slug] || {};
  const query = `${restaurant.name} ${restaurant.address} ${restaurant.city} ${restaurant.stateCode}`;
  const locationBias =
    geocode.approved && Number.isFinite(geocode.latitude) && Number.isFinite(geocode.longitude)
      ? { lat: geocode.latitude, lng: geocode.longitude }
      : null;

  const candidates = await page.evaluate(async ({ query, locationBias }) => {
    const { Place } = await google.maps.importLibrary("places");
    const request = {
      textQuery: query,
      fields: ["id", "displayName", "formattedAddress", "location", "types", "businessStatus", "websiteURI"],
      maxResultCount: 5,
    };
    if (locationBias) {
      request.locationBias = {
        center: locationBias,
        radius: 500,
      };
    }
    const { places } = await Place.searchByText(request);
    return (places || []).map((p) => ({
      id: p.id,
      displayName: p.displayName,
      formattedAddress: p.formattedAddress,
      lat: p.location?.lat?.() ?? p.location?.lat,
      lng: p.location?.lng?.() ?? p.location?.lng,
      types: p.types || [],
      businessStatus: p.businessStatus || "",
      websiteUri: p.websiteURI || "",
    }));
  }, { query, locationBias });

  const siblingSlugs = siblings.get(restaurant.slug) || [restaurant.slug];
  const scored = candidates
    .filter((c) => c.id)
    .map((c) => scoreCandidate(restaurant, geocode, c, siblingSlugs))
    .sort((a, b) => Number(b.autoApprove) - Number(a.autoApprove) || b.scoreName - a.scoreName);

  let row;
  if (!scored.length) {
    row = {
      restaurantSlug: restaurant.slug,
      placeId: null,
      status: "no_match",
      confidence: "low",
      method: "browser_search_empty",
      reviewedAt: today,
      notes: "No Places Text Search candidates (browser-assisted).",
    };
  } else {
    const best = scored[0];
    let ambiguous = false;
    if (scored.length > 1 && scored[1].scoreName >= 0.85 && best.scoreName - scored[1].scoreName < 0.08) {
      ambiguous = true;
    }
    if (siblingSlugs.length > 1) ambiguous = true;
    if (best.autoApprove && !ambiguous && best.placeId) {
      row = {
        restaurantSlug: restaurant.slug,
        placeId: best.placeId,
        status: "matched",
        confidence: "high",
        method: "browser_name_address_coordinates",
        reviewedAt: today,
        notes: best.reasons.join(","),
      };
    } else {
      row = {
        restaurantSlug: restaurant.slug,
        placeId: null,
        status: "needs_review",
        confidence: best.confidence,
        method: "browser_search_candidates",
        reviewedAt: today,
        notes: `Top suffix …${(best.placeId || "").slice(-8)} conf=${best.confidence} reasons=${best.reasons.join(",")}`,
      };
      // ephemeral tip for interactive review — gitignored
      mkdirSync("data/.google-places-tmp", { recursive: true });
      writeFileSync(
        `data/.google-places-tmp/${restaurant.slug}.txt`,
        [
          `Restaurant: ${restaurant.name}`,
          `Our address: ${restaurant.address}`,
          `Candidate placeId: ${best.placeId || ""}`,
          `Candidate name: ${candidates[0]?.displayName || ""}`,
          `Candidate address: ${candidates[0]?.formattedAddress || ""}`,
          `Confidence: ${best.confidence}`,
          `Reasons: ${best.reasons.join(", ")}`,
          "Do not commit this file.",
          "",
        ].join("\n"),
      );
    }
    console.log(
      `${restaurant.slug}: ${row.status} conf=${row.confidence} reasons=${best.reasons.join(",")} suffix=…${(best.placeId || "").slice(-6)}`,
    );
  }

  bySlug.set(restaurant.slug, row);
  processed += 1;
  if (!all && limit && processed >= limit) break;
  await page.waitForTimeout(250);
}

await browser.close();

// Ensure full roster still present
for (const r of restaurants) {
  if (!bySlug.has(r.slug)) {
    bySlug.set(r.slug, {
      restaurantSlug: r.slug,
      placeId: null,
      status: "needs_review",
      confidence: "low",
      method: "pending",
      reviewedAt: today,
      notes: "Awaiting matching.",
    });
  }
}

const payload = {
  version: 1,
  updatedAt: new Date().toISOString(),
  matches: [...bySlug.values()].sort((a, b) => a.restaurantSlug.localeCompare(b.restaurantSlug)),
};
writeFileSync(matchesPath, JSON.stringify(payload, null, 2) + "\n");
console.log(`Wrote ${payload.matches.length} matches → ${matchesPath}`);

const validate = spawnSync("python3", ["scripts/validate_google_place_ids.py"], { encoding: "utf8" });
process.stdout.write(validate.stdout || "");
process.stderr.write(validate.stderr || "");
process.exit(validate.status ?? 1);
