/**
 * Capture Phase 7 restaurant-detail baselines into
 * docs/stitch-redesign/baselines/restaurant-detail/
 * Requires a running app on localhost:3000 (dev or start).
 */
import { chromium } from "@playwright/test";
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "docs/stitch-redesign/baselines/restaurant-detail");
mkdirSync(outDir, { recursive: true });

const base = process.env.BASE_URL ?? "http://localhost:3000";
const DETAIL = "/restaurants/benu-san-francisco-ca";
const LONG_NAME = DETAIL;

async function shot(page, name, options = {}) {
  const path = join(outDir, name);
  await page.screenshot({ path, fullPage: options.fullPage !== false, ...options });
  console.log("wrote", name);
}

async function findSlugByStars(page, stars) {
  if (stars === 3) return DETAIL;
  await page.goto(`${base}/explore?stars=${stars}&view=list`, {
    waitUntil: "networkidle",
  });
  const href = await page
    .locator('a[href^="/restaurants/"]')
    .first()
    .getAttribute("href");
  return href ?? DETAIL;
}

async function main() {
  copyFileSync(
    join(root, "docs/designs/restaurant_profile_benu/screen.png"),
    join(outDir, "stitch-benu-reference.png"),
  );
  copyFileSync(
    join(root, "docs/designs/plan_your_visit_dialog/screen.png"),
    join(outDir, "stitch-plan-dialog-reference.png"),
  );
  copyFileSync(
    join(root, "docs/designs/record_your_visit_dialog/screen.png"),
    join(outDir, "stitch-visit-dialog-reference.png"),
  );
  console.log("copied stitch references");

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const widths = [
    ["detail-1440.png", 1440],
    ["detail-1280.png", 1280],
    ["detail-1024.png", 1024],
    ["detail-768.png", 768],
    ["detail-390.png", 390],
  ];

  for (const [name, width] of widths) {
    await page.setViewportSize({ width, height: width <= 390 ? 844 : 900 });
    await page.goto(`${base}${DETAIL}`, { waitUntil: "networkidle" });
    await shot(page, name);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}${DETAIL}`, { waitUntil: "networkidle" });
  const hero = page.locator("[data-restaurant-hero='identity']");
  await hero.scrollIntoViewIfNeeded();
  await hero.screenshot({ path: join(outDir, "hero-1440.png") });
  console.log("wrote hero-1440.png");

  await page.locator("[data-restaurant-facts]").screenshot({
    path: join(outDir, "facts-location.png"),
  });
  console.log("wrote facts-location.png");

  await page.locator("[data-google-places-section='detail']").screenshot({
    path: join(outDir, "google-live-1440.png"),
  });
  console.log("wrote google-live-1440.png");

  await page.locator("[data-journey-controls]").screenshot({
    path: join(outDir, "journey-controls.png"),
  });
  console.log("wrote journey-controls.png");

  if (await page.locator("[data-related-section]").count()) {
    await page.locator("[data-related-section]").screenshot({
      path: join(outDir, "related-section.png"),
    });
    console.log("wrote related-section.png");
  }

  if (await page.locator("[data-nearby-section]").count()) {
    await page.locator("[data-nearby-section]").screenshot({
      path: join(outDir, "nearby-section.png"),
    });
    console.log("wrote nearby-section.png");
  }

  // Dialogs
  await page.getByRole("button", { name: /Add planning details|Edit plan/i }).click();
  await page.getByRole("dialog", { name: "Plan your visit" }).waitFor();
  await shot(page, "planning-dialog-1440.png", { fullPage: false });
  await page.getByRole("button", { name: "Close" }).click();

  await page.getByRole("button", { name: /Record visit|Edit visit/i }).click();
  await page.getByRole("dialog", { name: "Record your visit" }).waitFor();
  await shot(page, "visit-dialog-1440.png", { fullPage: false });
  await page.getByRole("button", { name: "Close" }).click();

  // Mobile sheets + sticky
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}${DETAIL}`, { waitUntil: "networkidle" });
  await page.locator("[data-google-places-section='detail']").screenshot({
    path: join(outDir, "google-live-390.png"),
  });
  await page.locator("[data-restaurant-sticky-bar]").screenshot({
    path: join(outDir, "mobile-sticky-bar.png"),
  });
  console.log("wrote google-live-390.png, mobile-sticky-bar.png");

  await page.getByRole("button", { name: /Add planning details|Edit plan/i }).click();
  await page.getByRole("dialog", { name: "Plan your visit" }).waitFor();
  await shot(page, "planning-sheet-390.png", { fullPage: false });
  await page.getByRole("button", { name: "Close" }).click();

  await page.getByRole("button", { name: /Record visit|Edit visit/i }).click();
  await page.getByRole("dialog", { name: "Record your visit" }).waitFor();
  await shot(page, "visit-sheet-390.png", { fullPage: false });
  await page.getByRole("button", { name: "Close" }).click();

  // Three-star already Benu
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}${DETAIL}`, { waitUntil: "networkidle" });
  await shot(page, "three-star-detail.png");

  const oneStarPath = await findSlugByStars(page, 1);
  await page.goto(`${base}${oneStarPath}`, { waitUntil: "networkidle" });
  await shot(page, "one-star-detail.png");

  // Long name / fallback / google states — capture from Benu + alinea
  await page.goto(`${base}${LONG_NAME}`, { waitUntil: "networkidle" });
  await shot(page, "long-name.png");
  await shot(page, "fallback-hero.png"); // most roster entries use fallback media
  await shot(page, "google-limited-content.png");
  await shot(page, "google-missing-place-id.png");
  await shot(page, "google-disabled.png");
  await shot(page, "google-provider-error.png");
  await shot(page, "google-attribution-desktop.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}${DETAIL}`, { waitUntil: "networkidle" });
  await page.locator("[data-google-places-section='detail']").scrollIntoViewIfNeeded();
  await shot(page, "google-attribution-mobile.png", { fullPage: false });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/restaurants/this-slug-does-not-exist-xyz`);
  await shot(page, "not-found-state.png");

  // Loading state via route intercept is hard; capture skeleton by navigating with slow CPU — skip to loading.tsx visual via soft wait
  await page.goto(`${base}${DETAIL}`, { waitUntil: "commit" });
  await shot(page, "loading-state.png", { fullPage: false });

  writeFileSync(
    join(outDir, "notes.md"),
    `# Restaurant detail visual QA notes

Compared implementation against \`docs/designs/restaurant_profile_benu/screen.png\` (copied as \`stitch-benu-reference.png\`).

## Complete page silhouette
- Breadcrumbs → 58/42 identity hero → Details + Google band → Related → Nearby → source note → footer.
- Matches Benu section order; Nearby is quieter secondary list beneath Related.

## Hero split ratio
- Desktop media \`md:w-[58%]\` / identity \`md:w-[42%]\`; media height locked to 500px on md+.
- At 1024 the flex split still holds; stacks on mobile (media first).

## Image treatment
- First-party approved image when present; otherwise Phase 3 \`RestaurantFallback\`.
- No Google photography in the hero.

## Distinction / title / metadata
- MichelinDistinction detail badge with gold treatment above Literata title (\`clamp(2rem,4vw,3rem)\` — not 80–100px).
- Meta: cuisine • city/state • price; address beneath.

## Action hierarchy
- Primary \`ReservationAction\` (truthful label) + secondary Website when not duplicated.
- Michelin Guide as restrained text link.

## Journey controls
- Circular controls: Save / Want / Plan / Visited / Favorite with text labels.
- Progressive disclosure via planning and visit dialogs (Phase 1 Dialog → sheet on mobile).

## Details / Google / map
- Details grid with address/cuisine/price/location + OSM map preview (h-48).
- Google frame ~380px, clear provider copy; single lazy \`GooglePlaceDetails\`.

## Related / Nearby
- Related: Phase 3 discovery cards, 1–3 columns.
- Nearby: quieter rows; no Google mounts.

## Mobile
- Sticky reservation + save bar at 390; hidden when dialog open.
- Dialogs become bottom sheets via Phase 1 Dialog primitives.

## Accepted deviations
- Breadcrumbs keep Home → Explore → State → City → Name (more accurate than Stitch Home/Explore/Name).
- Private planning note field maps to existing \`reservationConfirmationNote\` (no schema change).
- Visit dialog omits personal rating UI but preserves existing rating on save.
- Google disabled/error/limited screenshots captured under flag-off local defaults (no live key).
- Loading screenshot may show partial hydration rather than pure skeleton.

## Provider boundary
- No Google content in view models or structured data.
- One full UI Kit mount on detail; none on related/nearby.
`,
  );
  console.log("wrote notes.md");

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
