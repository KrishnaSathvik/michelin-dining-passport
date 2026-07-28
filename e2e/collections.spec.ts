import { expect, test, type Page } from "@playwright/test";

const STAMP = "2026-06-01T12:00:00.000Z";

function bookmark(slug: string, createdAt = STAMP) {
  return { restaurantSlug: slug, createdAt, updatedAt: createdAt };
}

const SAVED_SLUGS = [
  "benu-san-francisco-ca",
  "addison-san-diego-ca",
  "per-se-new-york-ny",
  "atomix-new-york-ny",
  "alinea-chicago-il",
];

/** V3 store: bookmarks/plans/visits are the normalized records. */
function store(collections: Record<string, unknown>, slugs = SAVED_SLUGS) {
  return {
    version: 3,
    bookmarks: Object.fromEntries(slugs.map((slug) => [slug, bookmark(slug)])),
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

function collection(
  id: string,
  slug: string,
  name: string,
  restaurantSlugs: string[],
  extra: Record<string, unknown> = {},
) {
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

const MULTI = store({
  "col-ny": collection(
    "col-ny",
    "new-york-weekend",
    "New York weekend",
    ["per-se-new-york-ny", "atomix-new-york-ny"],
    { description: "Two nights, two tasting menus.", updatedAt: STAMP },
  ),
  "col-anniversary": collection(
    "col-anniversary",
    "anniversary-restaurants",
    "Anniversary restaurants",
    ["benu-san-francisco-ca"],
    { updatedAt: "2026-05-01T12:00:00.000Z" },
  ),
  "col-empty": collection("col-empty", "tasting-menus-to-try", "Tasting menus to try", [], {
    updatedAt: "2026-04-01T12:00:00.000Z",
  }),
});

const SEVERAL = store({
  "col-ca": collection(
    "col-ca",
    "california-three-star-trip",
    "California three-star trip",
    [
      "benu-san-francisco-ca",
      "addison-san-diego-ca",
      "per-se-new-york-ny",
      "atomix-new-york-ny",
      "alinea-chicago-il",
    ],
    { description: "The full coastal run." },
  ),
});

async function seed(page: Page, value: unknown) {
  await page.addInitScript((data) => {
    window.localStorage.setItem("mdp-passport", JSON.stringify(data));
  }, value);
}

async function readStore(page: Page) {
  return JSON.parse(
    (await page.evaluate(() => window.localStorage.getItem("mdp-passport"))) ??
      "{}",
  );
}

const WIDTHS = [1440, 1280, 1024, 768, 430, 390, 375];

test.describe("Collections", () => {
  test("empty state invites the first collection", async ({ page }) => {
    await page.goto("/collections");
    await expect(
      page.getByRole("heading", { level: 1, name: "Collections" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(
      page.getByRole("heading", { name: "Create your first collection" }),
    ).toBeVisible();
    await expect(
      page.getByText(/Collections organize the restaurants you have saved/i),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create collection" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Explore restaurants" }),
    ).toBeVisible();
    // Collections are private-only in V1.
    await expect(page.getByText(/public|share/i)).toHaveCount(0);
  });

  test("index lists collections with counts, thumbnails, and updated dates", async ({
    page,
  }) => {
    await seed(page, MULTI);
    await page.goto("/collections");

    const cards = page.locator("[data-collection-card='index']");
    await expect(cards).toHaveCount(3);

    const ny = cards.filter({ hasText: "New York weekend" });
    await expect(ny.getByText("2 restaurants")).toBeVisible();
    await expect(ny.getByText("Two nights, two tasting menus.")).toBeVisible();
    await expect(ny.locator("[data-collection-mosaic='2']")).toBeVisible();
    await expect(ny.getByRole("link", { name: "Open collection" })).toBeVisible();

    const anniversary = cards.filter({ hasText: "Anniversary restaurants" });
    await expect(anniversary.getByText("1 restaurant")).toBeVisible();

    // A collection with no members still shows a designed fallback, not a gap.
    const emptyCard = cards.filter({ hasText: "Tasting menus to try" });
    await expect(emptyCard.getByText("0 restaurants")).toBeVisible();
    await expect(emptyCard.locator("[data-collection-mosaic='0']")).toBeVisible();

    // Most recently updated first.
    await expect(cards.first()).toContainText("New York weekend");
  });

  test("shared footer renders on collections routes", async ({ page }) => {
    await seed(page, MULTI);
    await page.goto("/collections");
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await page.goto("/collections/new-york-weekend");
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("create dialog validates name, length, and duplicates", async ({
    page,
  }) => {
    await seed(page, MULTI);
    await page.goto("/collections");
    await page.getByRole("button", { name: "Create collection" }).first().click();

    const dialog = page.getByRole("dialog", { name: "Create collection" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("Collection name")).toBeFocused();

    // Required
    await dialog.getByRole("button", { name: "Create collection" }).click();
    await expect(
      dialog.getByText("Enter a name for this collection."),
    ).toBeVisible();

    // Duplicate, case-insensitive
    await dialog.getByLabel("Collection name").fill("new york WEEKEND");
    await dialog.getByRole("button", { name: "Create collection" }).click();
    await expect(
      dialog.getByText("You already have a collection with this name."),
    ).toBeVisible();

    // Over the 80-character limit
    await dialog.getByLabel("Collection name").fill("x".repeat(81));
    await expect(dialog.getByText("1 over the limit")).toBeVisible();
    await dialog.getByRole("button", { name: "Create collection" }).click();
    await expect(
      dialog.getByText("Collection names are limited to 80 characters."),
    ).toBeVisible();
  });

  test("creating a collection opens it and persists on device", async ({
    page,
  }) => {
    await seed(page, MULTI);
    await page.goto("/collections");
    await page.getByRole("button", { name: "Create collection" }).first().click();

    const dialog = page.getByRole("dialog", { name: "Create collection" });
    await dialog.getByLabel("Collection name").fill("Chicago birthday");
    await dialog
      .getByLabel(/Description/i)
      .fill("One night, one three-star table.");
    await dialog.getByRole("button", { name: "Create collection" }).click();

    await expect(page).toHaveURL(/\/collections\/chicago-birthday/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Chicago birthday" }),
    ).toBeVisible();
    await expect(
      page.getByText("One night, one three-star table."),
    ).toBeVisible();
    await expect(page.getByText("0 restaurants")).toBeVisible();

    const saved = await readStore(page);
    const created = Object.values<Record<string, unknown>>(
      saved.collections,
    ).find((item) => item.name === "Chicago birthday");
    expect(created).toBeTruthy();
    expect(created?.private).toBe(true);
  });

  test("edit dialog renames and updates the description", async ({ page }) => {
    await seed(page, MULTI);
    await page.goto("/collections/new-york-weekend");
    await page.getByRole("button", { name: "Edit collection" }).click();

    const dialog = page.getByRole("dialog", { name: "Edit collection" });
    await expect(dialog.getByLabel("Collection name")).toHaveValue(
      "New York weekend",
    );
    await dialog.getByLabel("Collection name").fill("NY long weekend");
    await dialog.getByLabel(/Description/i).fill("Now three nights.");
    await dialog.getByRole("button", { name: "Save changes" }).click();

    await expect(
      page.getByRole("heading", { level: 1, name: "NY long weekend" }),
    ).toBeVisible();
    await expect(page.getByText("Now three nights.")).toBeVisible();
  });

  test("adding a restaurant searches saved restaurants and ensures Saved", async ({
    page,
  }) => {
    // Alinea is saved but not yet in any collection.
    await seed(page, MULTI);
    await page.goto("/collections/new-york-weekend");
    await page.getByRole("button", { name: "Add restaurants" }).click();

    const dialog = page.getByRole("dialog", { name: "Add restaurants" });
    await expect(dialog).toBeVisible();

    // Members are shown, flagged rather than hidden.
    await expect(
      dialog.locator("[data-add-candidate='per-se-new-york-ny']"),
    ).toContainText("In this collection");

    // Search by city.
    await dialog.getByPlaceholder("Name, city, state, or cuisine").fill("Chicago");
    await expect(dialog.locator("[data-add-candidate]")).toHaveCount(1);
    await expect(
      dialog.locator("[data-add-candidate='alinea-chicago-il']"),
    ).toBeVisible();

    await dialog
      .locator("[data-add-candidate='alinea-chicago-il']")
      .getByRole("button", { name: "Add" })
      .click();
    await expect(
      dialog.locator("[data-add-candidate='alinea-chicago-il']"),
    ).toContainText("In this collection");
    await dialog.getByRole("button", { name: "Done" }).click();

    await expect(page.getByText("3 restaurants")).toBeVisible();
    await expect(
      page.locator("[data-collection-card='restaurant'][data-slug='alinea-chicago-il']"),
    ).toBeVisible();

    const saved = await readStore(page);
    expect(saved.bookmarks["alinea-chicago-il"]).toBeTruthy();
  });

  test("adding an unsaved restaurant to a collection saves it", async ({
    page,
  }) => {
    // Only Per Se is saved; the collection add must create the bookmark.
    await seed(
      page,
      store(
        {
          "col-ny": collection("col-ny", "new-york-weekend", "New York weekend", []),
        },
        ["per-se-new-york-ny"],
      ),
    );
    await page.goto("/collections/new-york-weekend");
    await page.getByRole("button", { name: "Add restaurants" }).click();

    const dialog = page.getByRole("dialog", { name: "Add restaurants" });
    await dialog
      .locator("[data-add-candidate='per-se-new-york-ny']")
      .getByRole("button", { name: "Add" })
      .click();
    await dialog.getByRole("button", { name: "Done" }).click();

    const saved = await readStore(page);
    expect(saved.collections["col-ny"].restaurantSlugs).toContain(
      "per-se-new-york-ny",
    );
    expect(saved.bookmarks["per-se-new-york-ny"]).toBeTruthy();

    await page.goto("/saved");
    await expect(
      page.getByRole("link", { name: "Per Se", exact: true }).first(),
    ).toBeVisible();
  });

  test("adding several restaurants in one session accumulates all of them", async ({
    page,
  }) => {
    await seed(page, MULTI);
    await page.goto("/collections/tasting-menus-to-try");
    await page.getByRole("button", { name: "Add restaurants" }).click();
    const dialog = page.getByRole("dialog", { name: "Add restaurants" });

    for (const slug of [
      "benu-san-francisco-ca",
      "addison-san-diego-ca",
      "alinea-chicago-il",
    ]) {
      await dialog
        .locator(`[data-add-candidate='${slug}']`)
        .getByRole("button", { name: "Add" })
        .click();
    }
    await dialog.getByRole("button", { name: "Done" }).click();

    await expect(page.getByText("3 restaurants")).toBeVisible();
    const saved = await readStore(page);
    expect(saved.collections["col-empty"].restaurantSlugs.sort()).toEqual([
      "addison-san-diego-ca",
      "alinea-chicago-il",
      "benu-san-francisco-ca",
    ]);
  });

  test("detail shows the shared editorial card without per-card Plan or Record Visit", async ({
    page,
  }) => {
    await seed(page, SEVERAL);
    await page.goto("/collections/california-three-star-trip");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "California three-star trip",
      }),
    ).toBeVisible();
    await expect(page.getByText("5 restaurants")).toBeVisible();

    const cards = page.locator("[data-collection-card='restaurant']");
    await expect(cards).toHaveCount(5);

    const benu = cards.filter({ hasText: "Benu" });
    await expect(benu.getByRole("link", { name: "Open details" })).toBeVisible();
    await expect(
      benu.getByRole("button", { name: /Remove Benu from this collection/i }),
    ).toBeVisible();
    // Plan/visit context appears as a summary only.
    await expect(benu.getByText(/Planned/)).toBeVisible();
    await expect(cards.filter({ hasText: "Per Se" }).getByText("Visited once")).toBeVisible();

    // No journey editing controls on the cards.
    await expect(
      page.getByRole("button", { name: "Plan a visit" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Record a visit" }),
    ).toHaveCount(0);
    // Private details never leak onto this surface.
    await expect(page.getByText("PRIVATE-REFERENCE")).toHaveCount(0);
    await expect(page.getByText("Private visit note.")).toHaveCount(0);
  });

  test("removing from a collection keeps the restaurant saved", async ({
    page,
  }) => {
    await seed(page, MULTI);
    await page.goto("/collections/new-york-weekend");
    await page
      .getByRole("button", { name: /Remove Per Se from this collection/i })
      .click();

    await expect(page.getByText("1 restaurant")).toBeVisible();
    const saved = await readStore(page);
    expect(saved.collections["col-ny"].restaurantSlugs).not.toContain(
      "per-se-new-york-ny",
    );
    expect(saved.bookmarks["per-se-new-york-ny"]).toBeTruthy();
    expect(saved.visits["visit:per-se"]).toBeTruthy();

    await page.goto("/saved");
    await expect(
      page.getByRole("link", { name: "Per Se", exact: true }).first(),
    ).toBeVisible();
  });

  test("a restaurant can belong to several collections", async ({ page }) => {
    await seed(page, MULTI);
    await page.goto("/collections/anniversary-restaurants");
    await page.getByRole("button", { name: "Add restaurants" }).click();
    const dialog = page.getByRole("dialog", { name: "Add restaurants" });
    await dialog
      .locator("[data-add-candidate='per-se-new-york-ny']")
      .getByRole("button", { name: "Add" })
      .click();
    await dialog.getByRole("button", { name: "Done" }).click();

    const saved = await readStore(page);
    expect(saved.collections["col-anniversary"].restaurantSlugs).toContain(
      "per-se-new-york-ny",
    );
    expect(saved.collections["col-ny"].restaurantSlugs).toContain(
      "per-se-new-york-ny",
    );
  });

  test("delete confirmation states restaurants stay saved", async ({ page }) => {
    await seed(page, MULTI);
    await page.goto("/collections/new-york-weekend");
    await page.getByRole("button", { name: "More collection actions" }).click();
    await page.getByRole("menuitem", { name: "Delete collection" }).click();

    const dialog = page.getByRole("dialog", { name: "Delete this collection?" });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByText(/The restaurants will remain saved in My Restaurants\./),
    ).toBeVisible();
    await dialog.getByRole("button", { name: "Delete collection" }).click();

    await expect(page).toHaveURL(/\/collections$/);
    const saved = await readStore(page);
    expect(saved.collections["col-ny"]).toBeUndefined();
    // Saved, plans, and visits survive.
    expect(saved.bookmarks["per-se-new-york-ny"]).toBeTruthy();
    expect(saved.visits["visit:per-se"]).toBeTruthy();
    expect(saved.plans["plan:benu"]).toBeTruthy();
  });

  test("renaming from the index card menu works", async ({ page }) => {
    await seed(page, MULTI);
    await page.goto("/collections");
    await page
      .getByRole("button", { name: "Actions for New York weekend" })
      .click();
    await page.getByRole("menuitem", { name: "Rename" }).click();

    const dialog = page.getByRole("dialog", { name: "Edit collection" });
    await dialog.getByLabel("Collection name").fill("NY weekend v2");
    await dialog.getByRole("button", { name: "Save changes" }).click();

    await expect(
      page.getByRole("heading", { name: "NY weekend v2" }),
    ).toBeVisible();
  });

  test("unknown collection slug fails safely", async ({ page }) => {
    await seed(page, MULTI);
    await page.goto("/collections/not-a-real-collection");
    await expect(
      page.getByRole("heading", { level: 1, name: "Collection not found" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Back to collections" }),
    ).toBeVisible();
  });

  test("device-only and sync-failure states are visible and retryable", async ({
    page,
  }) => {
    await seed(page, MULTI);
    await page.goto("/collections?proof=device-only");
    await expect(page.locator("[data-sync-mode='local']")).toBeVisible();
    await expect(page.getByText(/stored on this device/i)).toBeVisible();

    await page.goto("/collections?proof=sync-failed");
    const failure = page.locator("[data-sync-mode='failed']");
    await expect(failure).toBeVisible();
    await expect(failure.getByRole("button", { name: "Retry" })).toBeVisible();

    await page.goto("/collections?proof=sync-pending");
    await expect(page.locator("[data-sync-mode='pending']")).toBeVisible();
  });

  test("loading proof does not flash the empty state", async ({ page }) => {
    await page.goto("/collections?proof=loading");
    await expect(page.getByText("Loading collections…")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Create your first collection" }),
    ).toHaveCount(0);
  });

  test("no horizontal overflow at any required width", async ({ page }) => {
    await seed(page, SEVERAL);
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });

      for (const path of ["/collections", "/collections/california-three-star-trip"]) {
        await page.goto(path);
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth + 1,
        );
        expect(overflow, `${path} overflows at ${width}px`).toBe(false);
      }
    }
  });

  test("mobile dialogs use the available width and keep 44px targets", async ({
    page,
  }) => {
    await seed(page, MULTI);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/collections/new-york-weekend");

    await page.getByRole("button", { name: "Add restaurants" }).click();
    const dialog = page.getByRole("dialog", { name: "Add restaurants" });
    const width = await dialog.evaluate(
      (element) => element.getBoundingClientRect().width,
    );
    expect(width).toBeGreaterThan(340);
    expect(width).toBeLessThanOrEqual(390);

    // The search field is reachable and usable with the mobile keyboard.
    const search = dialog.getByPlaceholder("Name, city, state, or cuisine");
    await search.fill("atomix");
    await expect(dialog.locator("[data-add-candidate]")).toHaveCount(1);

    const searchBox = await search.boundingBox();
    expect(searchBox?.height ?? 0).toBeGreaterThanOrEqual(44);

    const addButton = dialog
      .locator("[data-add-candidate='atomix-new-york-ny']")
      .getByRole("button", { name: /Add|Remove/ })
      .first();
    const addBox = await addButton.boundingBox();
    expect(addBox?.height ?? 0).toBeGreaterThanOrEqual(44);
  });

  test("collections routes never load the Google UI kit", async ({ page }) => {
    await seed(page, MULTI);
    await page.goto("/collections");
    await expect(page.locator("gmpx-place-overview")).toHaveCount(0);
    await page.goto("/collections/new-york-weekend");
    await expect(page.locator("gmpx-place-overview")).toHaveCount(0);
  });
});
