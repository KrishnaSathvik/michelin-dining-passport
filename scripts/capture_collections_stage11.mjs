import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const origin = process.env.COLLECTIONS_ORIGIN ?? "http://127.0.0.1:3112";
const output = "output/playwright/stage11-collections";
const widths = [1440, 1280, 1024, 768, 430, 390, 375];

const STAMP = "2026-06-01T12:00:00.000Z";
const SAVED = [
  "benu-san-francisco-ca",
  "addison-san-diego-ca",
  "per-se-new-york-ny",
  "atomix-new-york-ny",
  "alinea-chicago-il",
];

function baseStore(collections, slugs = SAVED) {
  return {
    version: 3,
    bookmarks: Object.fromEntries(
      slugs.map((slug) => [
        slug,
        { restaurantSlug: slug, createdAt: STAMP, updatedAt: STAMP },
      ]),
    ),
    plans: {
      "plan:benu": {
        id: "plan:benu",
        restaurantSlug: "benu-san-francisco-ca",
        plannedDate: "2027-03-14",
        plannedTime: "19:00",
        reservationProvider: "Tock",
        confirmationReference: "PRIVATE-REFERENCE",
        privateNotes: "Private planning note.",
        createdAt: STAMP,
        updatedAt: STAMP,
      },
    },
    visits: {
      "visit:per-se": {
        id: "visit:per-se",
        restaurantSlug: "per-se-new-york-ny",
        visitDate: "2026-02-20",
        datePrecision: "day",
        favoriteDishes: "Oysters and pearls",
        privateNotes: "Private visit note.",
        wouldReturn: true,
        personalFavorite: true,
        createdAt: STAMP,
        updatedAt: STAMP,
      },
    },
    userRestaurants: {},
    collections,
  };
}

function collection(id, slug, name, restaurantSlugs, extra = {}) {
  return {
    id,
    slug,
    name,
    description: "",
    private: true,
    coverRestaurantSlug: restaurantSlugs[0] ?? null,
    restaurantSlugs,
    createdAt: STAMP,
    updatedAt: STAMP,
    ...extra,
  };
}

const MULTI = baseStore({
  "col-ny": collection(
    "col-ny",
    "new-york-weekend",
    "New York weekend",
    ["per-se-new-york-ny", "atomix-new-york-ny"],
    { description: "Two nights, two tasting menus." },
  ),
  "col-anniversary": collection(
    "col-anniversary",
    "anniversary-restaurants",
    "Anniversary restaurants",
    ["benu-san-francisco-ca"],
    { updatedAt: "2026-05-01T12:00:00.000Z" },
  ),
  "col-empty": collection(
    "col-empty",
    "tasting-menus-to-try",
    "Tasting menus to try",
    [],
    {
      description: "Somewhere to put the long shots.",
      updatedAt: "2026-04-01T12:00:00.000Z",
    },
  ),
});

const SEVERAL = baseStore({
  "col-ca": collection(
    "col-ca",
    "california-three-star-trip",
    "California three-star trip",
    SAVED,
    { description: "The full coastal run." },
  ),
});

const EMPTY = baseStore({}, []);

async function shot(page, name) {
  await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
  process.stdout.write(`  ${name}.png\n`);
}

async function seeded(browser, store, viewport = { width: 1440, height: 960 }) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript((data) => {
    window.localStorage.setItem("mdp-passport", JSON.stringify(data));
  }, store);
  return context;
}

async function main() {
  await mkdir(output, { recursive: true });
  const browser = await chromium.launch();

  // --- Desktop states -----------------------------------------------------
  let context = await seeded(browser, EMPTY);
  let page = await context.newPage();
  await page.goto(`${origin}/collections`);
  await page.waitForLoadState("networkidle");
  await shot(page, "01-index-empty");

  await page.getByRole("button", { name: "Create collection" }).first().click();
  await page.getByLabel("Collection name").fill("California three-star trip");
  await page
    .getByLabel(/Description/i)
    .fill("The full coastal run.");
  await shot(page, "02-create-dialog");
  await context.close();

  context = await seeded(browser, MULTI);
  page = await context.newPage();
  await page.goto(`${origin}/collections`);
  await page.waitForLoadState("networkidle");
  await shot(page, "03-index-multiple");

  // Duplicate-name validation
  await page.getByRole("button", { name: "Create collection" }).first().click();
  await page.getByLabel("Collection name").fill("new york WEEKEND");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Create collection" })
    .click();
  await shot(page, "04-create-duplicate-name");
  await page.getByRole("dialog").getByRole("button", { name: "Cancel" }).click();

  // Rename / delete menu on a card
  await page.getByRole("button", { name: "Actions for New York weekend" }).click();
  await shot(page, "05-index-card-menu");
  await page.keyboard.press("Escape");

  await page.goto(`${origin}/collections/anniversary-restaurants`);
  await page.waitForLoadState("networkidle");
  await shot(page, "06-detail-one-restaurant");

  await page.goto(`${origin}/collections/tasting-menus-to-try`);
  await page.waitForLoadState("networkidle");
  await shot(page, "07-detail-empty");

  await page.goto(`${origin}/collections/new-york-weekend`);
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Edit collection" }).click();
  await shot(page, "08-edit-dialog");
  await page.getByRole("dialog").getByRole("button", { name: "Cancel" }).click();

  await page.getByRole("button", { name: "Add restaurants" }).click();
  await shot(page, "09-add-restaurants");
  await page
    .getByRole("dialog")
    .getByPlaceholder("Name, city, state, or cuisine")
    .fill("Chicago");
  await shot(page, "10-add-restaurants-search");
  await page.getByRole("dialog").getByRole("button", { name: "Done" }).click();

  await page.getByRole("button", { name: "More collection actions" }).click();
  await page.getByRole("menuitem", { name: "Delete collection" }).click();
  await shot(page, "11-delete-confirmation");
  await page.getByRole("dialog").getByRole("button", { name: "Cancel" }).click();
  await context.close();

  context = await seeded(browser, SEVERAL);
  page = await context.newPage();
  await page.goto(`${origin}/collections/california-three-star-trip`);
  await page.waitForLoadState("networkidle");
  await shot(page, "12-detail-several-restaurants");
  await context.close();

  // --- Device and sync states --------------------------------------------
  context = await seeded(browser, MULTI);
  page = await context.newPage();
  for (const [name, proof] of [
    ["13-device-only", "device-only"],
    ["14-sync-pending", "sync-pending"],
    ["15-sync-failed", "sync-failed"],
    ["16-loading", "loading"],
  ]) {
    await page.goto(`${origin}/collections?proof=${proof}`);
    await page.waitForLoadState("networkidle");
    await shot(page, name);
  }
  await page.goto(`${origin}/collections/not-a-real-collection`);
  await page.waitForLoadState("networkidle");
  await shot(page, "17-collection-not-found");
  await context.close();

  // --- Responsive sweep ---------------------------------------------------
  for (const width of widths) {
    context = await seeded(browser, SEVERAL, { width, height: 900 });
    page = await context.newPage();

    await page.goto(`${origin}/collections`);
    await page.waitForLoadState("networkidle");
    await shot(page, `w${width}-index`);

    await page.goto(`${origin}/collections/california-three-star-trip`);
    await page.waitForLoadState("networkidle");
    await shot(page, `w${width}-detail`);

    if (width <= 430) {
      await page.getByRole("button", { name: "Add restaurants" }).click();
      await shot(page, `w${width}-add-restaurants-dialog`);
      await page.getByRole("dialog").getByRole("button", { name: "Done" }).click();
    }

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
    );
    if (overflow) {
      throw new Error(`Horizontal overflow at ${width}px`);
    }
    await context.close();
  }

  await browser.close();
  process.stdout.write(`\nScreenshots written to ${output}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
