/**
 * Responsive overflow audit across major routes/viewports.
 * Usage: BASE_URL=http://127.0.0.1:3000 node scripts/audit_responsive.mjs
 */
import { chromium } from "@playwright/test";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const routes = [
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
  "/login",
  "/signup",
  "/account",
  "/saved",
  "/planned",
  "/visited",
  "/collections",
];

const viewports = [
  { name: "mobile-375", width: 375, height: 812 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

const browser = await chromium.launch();
const issues = [];

for (const vp of viewports) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
  });
  for (const route of routes) {
    try {
      const res = await page.goto(`${base}${route}`, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      });
      const status = res?.status() ?? 0;
      await page.waitForTimeout(500);
      const metrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        const overflowX =
          Math.max(doc.scrollWidth, body.scrollWidth) - doc.clientWidth;
        const vw = window.innerWidth;
        const offenders = [];
        for (const el of document.querySelectorAll("body *")) {
          if (!(el instanceof HTMLElement)) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 1 || r.height < 1) continue;
          if (r.right > vw + 1 || r.left < -1) {
            const style = getComputedStyle(el);
            if (style.position === "fixed" || style.position === "sticky") {
              continue;
            }
            const tag = el.tagName.toLowerCase();
            const cls =
              el.className && typeof el.className === "string"
                ? el.className.slice(0, 100)
                : "";
            offenders.push({
              tag,
              cls,
              left: Math.round(r.left),
              right: Math.round(r.right),
              w: Math.round(r.width),
            });
            if (offenders.length >= 8) break;
          }
        }
        const fonts = {
          display: getComputedStyle(document.documentElement)
            .getPropertyValue("--font-display")
            .trim()
            .slice(0, 80),
          sans: getComputedStyle(document.documentElement)
            .getPropertyValue("--font-sans")
            .trim()
            .slice(0, 80),
          bodyFamily: getComputedStyle(body).fontFamily.slice(0, 100),
        };
        const meta =
          document.querySelector('meta[name="viewport"]')?.getAttribute(
            "content",
          ) ?? null;
        return { overflowX, offenders, fonts, meta, title: document.title };
      });
      if (status >= 400) {
        issues.push({
          vp: vp.name,
          route,
          kind: "http",
          detail: `status ${status}`,
        });
      }
      if (metrics.overflowX > 1) {
        issues.push({
          vp: vp.name,
          route,
          kind: "overflow",
          detail: `overflowX=${metrics.overflowX}`,
          offenders: metrics.offenders,
        });
      }
      if (vp.name === "mobile-390" && route === "/") {
        console.log("viewport-meta:", metrics.meta);
        console.log("fonts:", JSON.stringify(metrics.fonts));
      }
    } catch (e) {
      issues.push({
        vp: vp.name,
        route,
        kind: "error",
        detail: String(e?.message || e),
      });
    }
  }
  await page.close();
}

await browser.close();
console.log(JSON.stringify({ issueCount: issues.length, issues }, null, 2));
