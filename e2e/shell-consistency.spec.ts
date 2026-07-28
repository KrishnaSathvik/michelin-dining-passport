import { expect, test } from "@playwright/test";

/** Standard routes that must all share the one canonical header. */
const STANDARD_ROUTES = [
  "/",
  "/explore",
  "/map",
  "/about-michelin-stars",
  "/passport",
  "/about",
  "/privacy",
  "/terms",
  "/contact",
  "/sources",
];

/** Auth routes are the documented exception — they use the auth shell. */
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

const MOBILE_WIDTHS = [430, 390, 375];

test.describe("shared header consistency", () => {
  test("every standard route renders one header of the same height", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const heights: Record<string, number> = {};

    for (const route of STANDARD_ROUTES) {
      await page.goto(route);
      const banner = page.getByRole("banner");
      await expect(banner).toHaveCount(1);
      const box = await banner.boundingBox();
      expect(box, `no header box on ${route}`).not.toBeNull();
      heights[route] = box!.height;
    }

    const unique = new Set(Object.values(heights));
    expect(
      unique.size,
      `header heights differ across routes: ${JSON.stringify(heights)}`,
    ).toBe(1);
  });

  test("logo and primary nav are identical across routes", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const route of STANDARD_ROUTES) {
      await page.goto(route);
      const banner = page.getByRole("banner");
      await expect(
        banner.getByRole("link", { name: "Orellin" }),
      ).toHaveAttribute("href", "/");
      const nav = banner.getByRole("navigation", { name: "Primary" });
      await expect(nav.getByRole("link")).toHaveCount(4);
      await expect(
        banner.getByRole("link", { name: "Search restaurants" }),
      ).toBeVisible();
    }
  });

  test("signed-out account control is consistent across routes", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const route of STANDARD_ROUTES) {
      await page.goto(route);
      await expect(
        page.getByRole("banner").getByRole("link", { name: "Sign in" }),
      ).toHaveAttribute("href", "/login?next=/account");
    }
  });

  test("active route state is set per route", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const cases = [
      { route: "/explore", label: "Explore" },
      { route: "/map", label: "Map" },
      { route: "/about-michelin-stars", label: "Michelin Stars" },
      { route: "/passport", label: "My Restaurants" },
    ];
    for (const { route, label } of cases) {
      await page.goto(route);
      await expect(
        page
          .getByRole("banner")
          .getByRole("navigation", { name: "Primary" })
          .getByRole("link", { name: label }),
      ).toHaveAttribute("aria-current", "page");
    }
  });

  test("auth routes use the auth shell instead of the global header", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const route of AUTH_ROUTES) {
      await page.goto(route);
      await expect(page.getByRole("banner")).toHaveCount(0);
      await expect(page.getByRole("contentinfo")).toHaveCount(0);
    }
  });

  test("map keeps the canonical header and omits the footer", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/map");
    const banner = page.getByRole("banner");
    await expect(banner).toBeVisible();
    await expect(
      banner.getByRole("link", { name: "Orellin" }),
    ).toHaveAttribute("href", "/");
    await expect(page.getByRole("contentinfo")).toHaveCount(0);
  });
});

test.describe("mobile shell", () => {
  test("locks viewport scale so mobile layout cannot pinch-zoom", async ({
    page,
  }) => {
    await page.goto("/");
    const content = await page
      .locator('meta[name="viewport"]')
      .getAttribute("content");
    expect(content ?? "").toMatch(/maximum-scale\s*=\s*1/i);
    expect(content ?? "").toMatch(/user-scalable\s*=\s*no/i);
  });

  for (const width of MOBILE_WIDTHS) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 780 });
      for (const route of [...STANDARD_ROUTES, ...AUTH_ROUTES]) {
        await page.goto(route);
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth + 1,
        );
        expect(overflow, `horizontal overflow on ${route}`).toBeFalsy();
      }
    });

    test(`mobile drawer fits the viewport at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 780 });
      await page.goto("/");
      await page.getByRole("button", { name: "Open menu" }).click();
      const drawer = page.getByRole("dialog", { name: "Menu" });
      await expect(drawer).toBeVisible();
      const box = await drawer.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeLessThanOrEqual(width);
      expect(box!.x).toBeGreaterThanOrEqual(0);
    });
  }

  test("auth forms appear before decorative media on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/login");
    // The decorative brand panel is desktop-only; the form leads on mobile.
    const heading = page.getByRole("heading", { name: "Welcome back" });
    await expect(heading).toBeVisible();
    const box = await heading.boundingBox();
    expect(box!.y).toBeLessThan(400);
  });

  test("primary controls meet the touch target floor", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    for (const name of ["Search restaurants"]) {
      const box = await page
        .getByRole("banner")
        .getByRole("link", { name })
        .boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
    }
    const menu = await page
      .getByRole("button", { name: "Open menu" })
      .boundingBox();
    expect(menu!.height).toBeGreaterThanOrEqual(44);
    expect(menu!.width).toBeGreaterThanOrEqual(44);
  });
});
