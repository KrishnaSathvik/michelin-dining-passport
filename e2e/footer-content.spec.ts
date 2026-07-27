import { expect, test } from "@playwright/test";

const FOOTER_LINKS = [
  { label: "About", href: "/about" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
  { label: "Sources", href: "/sources" },
];

test.describe("site footer", () => {
  test("renders product identity, supporting links, and one disclaimer", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");

    await expect(
      footer.getByText(
        "Discover Michelin-starred restaurants, plan future visits, and remember the meals you loved.",
      ),
    ).toBeVisible();

    for (const link of FOOTER_LINKS) {
      await expect(
        footer.getByRole("link", { name: link.label, exact: true }),
      ).toHaveAttribute("href", link.href);
    }

    await expect(
      footer.getByText(
        "Dining Passport is an independent discovery platform and is not affiliated with the Michelin Guide.",
      ),
    ).toHaveCount(1);
  });

  test("drops dataset, roster, and ingestion terminology", async ({ page }) => {
    await page.goto("/");
    const footer = await page.getByRole("contentinfo").innerText();
    expect(footer).not.toMatch(/dataset|roster|import|ingest/i);
  });

  test("does not repeat primary navigation", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    for (const label of ["Explore", "Map", "Michelin Stars", "Passport"]) {
      await expect(
        footer.getByRole("link", { name: label, exact: true }),
      ).toHaveCount(0);
    }
  });

  test("carries only one independence disclaimer per page", async ({ page }) => {
    await page.goto("/explore");
    await expect(
      page.getByText(
        "Dining Passport is an independent discovery platform and is not affiliated with the Michelin Guide.",
      ),
    ).toHaveCount(1);
  });

  test("wraps cleanly on narrow mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
    );
    expect(overflow).toBeFalsy();
  });
});

test.describe("supporting content pages", () => {
  for (const link of FOOTER_LINKS) {
    test(`${link.href} renders with shared chrome`, async ({ page }) => {
      const response = await page.goto(link.href);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("banner")).toBeVisible();
      await expect(page.getByRole("contentinfo")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });

    test(`${link.href} drops dataset/roster jargon`, async ({ page }) => {
      await page.goto(link.href);
      const main = page.locator("main");
      const text = await main.innerText();
      expect(text).not.toMatch(/dataset|roster|import|ingest/i);
    });
  }

  test("content pages expose a brand rule under the title", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByTestId("content-brand-rule")).toBeVisible();
  });

  test("about shows purpose strip and related links", async ({ page }) => {
    await page.goto("/about");
    await expect(
      page.getByText("Browse. Plan. Remember — independently."),
    ).toBeVisible();
    const related = page.getByRole("navigation", { name: "Also useful" });
    await expect(related.getByRole("link", { name: "Sources" })).toHaveAttribute(
      "href",
      "/sources",
    );
    await expect(related.getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "href",
      "/privacy",
    );
    await expect(related.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  test("privacy and terms show last updated meta", async ({ page }) => {
    for (const path of ["/privacy", "/terms"]) {
      await page.goto(path);
      await expect(page.getByText(/Last updated/i)).toBeVisible();
    }
  });

  test("contact page publishes no invented address or form", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
    await expect(page.locator("form")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { level: 1, name: "Contact" }),
    ).toBeVisible();
    await expect(
      page.getByText(/no public contact address yet/i),
    ).toBeVisible();
  });

  test("sources shows currency callout in product language", async ({ page }) => {
    await page.goto("/sources");
    const callout = page.getByTestId("content-callout");
    await expect(callout).toBeVisible();
    await expect(callout).toContainText(/Information current through July 2026/i);
    await expect(callout).not.toContainText(/dataset/i);
  });

  test("about and sources link to each other", async ({ page }) => {
    await page.goto("/about");
    await page
      .getByRole("navigation", { name: "Also useful" })
      .getByRole("link", { name: "Sources" })
      .click();
    await expect(page).toHaveURL(/\/sources/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Sources" }),
    ).toBeVisible();
  });
});
