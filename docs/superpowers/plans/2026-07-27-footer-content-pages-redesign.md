# Footer Content Pages Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh `/about`, `/privacy`, `/terms`, `/contact`, and `/sources` into calm Stitch reading pages with tighter product copy, one shared shell, and light per-page accents — without inventing a Contact inbox.

**Architecture:** Keep static App Router page composers. Evolve the shared `ContentPage` shell (brand rule, rhythm) and add two small primitives (`ContentCallout`, `ContentRelatedLinks`). Update `siteConfig.dataUpdatedLabel` to product language. Extend Playwright coverage; capture visual baselines.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind / Dining Passport design tokens (`dp-*`), Playwright.

**Spec:** `docs/superpowers/specs/2026-07-27-footer-content-pages-design.md`

## Global Constraints

- Calm reading column only (`max-w-[68ch]`); no heroes, card grids, or auth split panels
- Do not redesign `SiteFooter` chrome or primary nav
- No `mailto:`, contact form, or invented support address on `/contact`
- No user-facing words: dataset, roster, import, ingest
- Footer keeps the single short independence disclaimer; About/Sources carry fuller context without stacking disclaimer walls
- `dataUpdatedLabel` must become product language (e.g. `Information current through July 2026`)
- Pages remain server components; no new backend, env vars, or analytics
- Prefer TDD: extend e2e assertions before or with each content change; keep commits small

## File map

| File | Responsibility |
| --- | --- |
| `src/components/stitch/content/ContentPage.tsx` | Shared shell: title, brand rule, intro, optional purpose + meta, section rhythm |
| `src/components/stitch/content/ContentCallout.tsx` | Quiet bordered accent panel |
| `src/components/stitch/content/ContentRelatedLinks.tsx` | End-of-page “Also useful” links |
| `src/components/stitch/content/index.ts` | Barrel exports |
| `src/config/site.ts` | `dataUpdatedLabel` product-language rewrite |
| `src/app/about/page.tsx` | About copy + purpose + related links |
| `src/app/privacy/page.tsx` | Privacy copy + last-updated meta + related |
| `src/app/terms/page.tsx` | Terms copy + last-updated meta + related |
| `src/app/contact/page.tsx` | Contact routing map + no-inbox callout + related |
| `src/app/sources/page.tsx` | Sources copy + currency callout + related |
| `e2e/footer-content.spec.ts` | Regression coverage for redesign |
| `scripts/capture_content_pages_baselines.mjs` | Desktop + mobile screenshots |
| `docs/stitch-redesign/baselines/content-pages/` | Baseline PNG output |

---

### Task 1: Extend failing e2e coverage for the redesign

**Files:**
- Modify: `e2e/footer-content.spec.ts`
- Test: `e2e/footer-content.spec.ts`

**Interfaces:**
- Consumes: existing Playwright helpers; live routes `/about`…`/sources`
- Produces: assertions later tasks must satisfy (brand rule, purpose, callouts, jargon ban, no form)

- [ ] **Step 1: Replace the supporting-content describe block with redesign assertions**

Keep the existing `site footer` describe block. Replace `test.describe("supporting content pages", …)` with:

```ts
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
```

- [ ] **Step 2: Run the new tests and confirm failures**

Run: `npx playwright test e2e/footer-content.spec.ts --reporter=line`

Expected: FAIL on brand rule, purpose strip, related nav, last updated, contact callout copy, sources currency callout / jargon (existing chrome tests may still pass).

- [ ] **Step 3: Commit the failing tests**

```bash
git add e2e/footer-content.spec.ts
git commit -m "$(cat <<'EOF'
test: extend footer content page redesign coverage

Lock brand rule, accents, jargon ban, and Contact honesty before implementation.
EOF
)"
```

---

### Task 2: Shared content primitives + shell

**Files:**
- Modify: `src/components/stitch/content/ContentPage.tsx`
- Create: `src/components/stitch/content/ContentCallout.tsx`
- Create: `src/components/stitch/content/ContentRelatedLinks.tsx`
- Modify: `src/components/stitch/content/index.ts`
- Modify: `src/config/site.ts` (`dataUpdatedLabel` only)

**Interfaces:**
- Consumes: `PageContainer`, design tokens
- Produces:
  - `ContentPage({ title, intro?, meta?, purpose?, children })`
  - `ContentSection({ heading, children })`
  - `ContentCallout({ title?, children })` with `data-testid="content-callout"`
  - `ContentRelatedLinks({ links: { href, label }[] })` — `nav` aria-label `"Also useful"`
  - Brand rule element `data-testid="content-brand-rule"`
  - `siteConfig.dataUpdatedLabel === "Information current through July 2026"`

- [ ] **Step 1: Rewrite `ContentPage.tsx`**

```tsx
import type { ReactNode } from "react";
import { PageContainer } from "@/components/stitch/PageContainer";

type ContentPageProps = {
  title: string;
  intro?: string;
  /** Short qualifier under the intro, e.g. "Last updated 27 July 2026". */
  meta?: string;
  /** Optional one-line purpose strip under the intro (About). */
  purpose?: string;
  children: ReactNode;
};

/**
 * Shared reading layout for the supporting pages linked from the footer
 * (About, Privacy, Terms, Contact, Sources). Single measured column —
 * these pages are read, not scanned.
 */
export function ContentPage({
  title,
  intro,
  meta,
  purpose,
  children,
}: ContentPageProps) {
  return (
    <PageContainer className="py-14 md:py-20">
      <div className="mx-auto w-full max-w-[68ch]">
        <header className="mb-10 md:mb-12">
          <h1 className="dp-headline-md text-dp-ink md:text-[36px]">{title}</h1>
          <div
            data-testid="content-brand-rule"
            aria-hidden="true"
            className="mt-5 h-px w-12 bg-dp-primary"
          />
          {intro ? (
            <p className="dp-body-md mt-5 text-dp-ink-secondary">{intro}</p>
          ) : null}
          {purpose ? (
            <p className="dp-meta mt-4 font-medium text-dp-primary">{purpose}</p>
          ) : null}
          {meta ? <p className="dp-meta mt-4 text-dp-ink-muted">{meta}</p> : null}
        </header>
        <div className="flex flex-col gap-12 md:gap-14">{children}</div>
      </div>
    </PageContainer>
  );
}

type ContentSectionProps = {
  heading: string;
  children: ReactNode;
};

export function ContentSection({ heading, children }: ContentSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="dp-headline-sm text-dp-ink">{heading}</h2>
      <div className="dp-body-md flex flex-col gap-3 text-dp-ink-secondary [&_a]:text-dp-primary [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `ContentCallout.tsx`**

```tsx
import type { ReactNode } from "react";

type ContentCalloutProps = {
  title?: string;
  children: ReactNode;
};

export function ContentCallout({ title, children }: ContentCalloutProps) {
  return (
    <aside
      data-testid="content-callout"
      className="rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-soft px-5 py-5 md:px-6"
    >
      {title ? (
        <p className="font-display text-[18px] text-dp-primary">{title}</p>
      ) : null}
      <div
        className={`dp-body-md text-dp-ink-secondary [&_a]:text-dp-primary [&_a]:underline [&_a]:underline-offset-4 ${
          title ? "mt-2" : ""
        }`}
      >
        {children}
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Create `ContentRelatedLinks.tsx`**

```tsx
import Link from "next/link";

type RelatedLink = {
  href: string;
  label: string;
};

type ContentRelatedLinksProps = {
  links: RelatedLink[];
};

export function ContentRelatedLinks({ links }: ContentRelatedLinksProps) {
  return (
    <nav aria-label="Also useful" className="border-t border-dp-border pt-8">
      <p className="dp-meta font-medium text-dp-ink-muted">Also useful</p>
      <ul className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="dp-meta font-medium text-dp-primary underline underline-offset-4"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 4: Update barrel `index.ts`**

```ts
export { ContentPage, ContentSection } from "./ContentPage";
export { ContentCallout } from "./ContentCallout";
export { ContentRelatedLinks } from "./ContentRelatedLinks";
```

- [ ] **Step 5: Update `siteConfig.dataUpdatedLabel` in `src/config/site.ts`**

Change:

```ts
dataUpdatedLabel: "Dataset current through July 2026",
```

to:

```ts
dataUpdatedLabel: "Information current through July 2026",
```

- [ ] **Step 6: Smoke-check TypeScript on touched files**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | head -40`

Expected: no new errors in `src/components/stitch/content/` or `src/config/site.ts` (repo may have unrelated noise — ignore unrelated paths).

- [ ] **Step 7: Commit**

```bash
git add \
  src/components/stitch/content/ContentPage.tsx \
  src/components/stitch/content/ContentCallout.tsx \
  src/components/stitch/content/ContentRelatedLinks.tsx \
  src/components/stitch/content/index.ts \
  src/config/site.ts
git commit -m "$(cat <<'EOF'
feat(ui): upgrade shared footer content reading shell

Add brand rule, callout, and related-links primitives; use product-language currency label.
EOF
)"
```

---

### Task 3: About page

**Files:**
- Modify: `src/app/about/page.tsx`
- Test: `e2e/footer-content.spec.ts` (about cases)

**Interfaces:**
- Consumes: `ContentPage`, `ContentSection`, `ContentRelatedLinks`, `siteConfig`
- Produces: purpose strip + four sections + related Links Sources/Privacy/Contact

- [ ] **Step 1: Replace `src/app/about/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import {
  ContentPage,
  ContentRelatedLinks,
  ContentSection,
} from "@/components/stitch/content";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "About",
  description:
    "What Dining Passport is, what it is not, and how it relates to the Michelin Guide.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <ContentPage
      title="About Dining Passport"
      intro={siteConfig.footerDescription}
      purpose="Browse. Plan. Remember — independently."
    >
      <ContentSection heading="What this is">
        <p>
          Dining Passport is an independent way to browse Michelin-starred
          restaurants in the United States, plan the meals you want, and keep a
          private record of the ones you have already had.
        </p>
        <p>
          Browsing never requires an account. You can keep a Passport on the
          device you are using, and create an account later if you want the same
          Passport on more than one device.
        </p>
      </ContentSection>

      <ContentSection heading="What this is not">
        <p>
          {siteConfig.footerDisclaimer} We do not award, review, or influence
          Michelin distinctions, and we are not a reservation service — booking
          links point to whatever service the restaurant itself uses.
        </p>
        <p>
          Michelin does not currently inspect every U.S. state. A region missing
          from this atlas has not necessarily been reviewed and found without
          stars.
        </p>
      </ContentSection>

      <ContentSection heading="Where the information comes from">
        <p>
          Restaurant listings, star levels, and location details are compiled
          from publicly available Michelin Guide listings. Some pages also show
          current place information from Google. The{" "}
          <Link href="/sources">Sources</Link> page explains each of these in
          more detail.
        </p>
        <p>
          If something here looks wrong or out of date,{" "}
          <Link href="/contact">Contact</Link> explains where that kind of
          question belongs.
        </p>
      </ContentSection>

      <ContentSection heading="Your Passport is private">
        <p>
          Saves, plans, visits, ratings, and notes are yours. They are never
          shown publicly and are not part of any ranking.{" "}
          <Link href="/privacy">Privacy</Link> describes what is stored and
          where.
        </p>
      </ContentSection>

      <ContentRelatedLinks
        links={[
          { href: "/sources", label: "Sources" },
          { href: "/privacy", label: "Privacy" },
          { href: "/contact", label: "Contact" },
        ]}
      />
    </ContentPage>
  );
}
```

- [ ] **Step 2: Run about-focused e2e**

Run: `npx playwright test e2e/footer-content.spec.ts -g "about|brand rule" --reporter=line`

Expected: PASS for brand rule, purpose strip, related links, about jargon.

- [ ] **Step 3: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "$(cat <<'EOF'
feat(ui): refresh About page for calm reading redesign

Tighten copy, add purpose strip, and end with related links.
EOF
)"
```

---

### Task 4: Privacy + Terms pages

**Files:**
- Modify: `src/app/privacy/page.tsx`
- Modify: `src/app/terms/page.tsx`
- Test: `e2e/footer-content.spec.ts` (`privacy and terms show last updated`)

**Interfaces:**
- Consumes: `ContentPage`, `ContentSection`, `ContentRelatedLinks`, `siteConfig`
- Produces: `meta="Last updated 27 July 2026"` on both; related links per spec

- [ ] **Step 1: Replace `src/app/privacy/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import {
  ContentPage,
  ContentRelatedLinks,
  ContentSection,
} from "@/components/stitch/content";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy",
  description:
    "What Dining Passport stores, where it is stored, and how to remove it.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy"
      intro="A plain description of what this product stores and where. It is not a legal agreement, and it does not promise more than the product actually does."
      meta="Last updated 27 July 2026"
    >
      <ContentSection heading="Browsing without an account">
        <p>
          You can browse the whole atlas without signing in. If you use a
          device-only Passport, your saves, plans, visits, ratings, and notes
          stay in your browser on that device and are not sent to us. Clearing
          site data erases them, and we cannot recover them for you.
        </p>
      </ContentSection>

      <ContentSection heading="If you create an account">
        <p>
          An account is handled by Supabase, which stores your email address, a
          hashed password, and the display name you choose. Signing in lets your
          Passport sync across devices, which means these are stored against
          your account:
        </p>
        <ul>
          <li>Which restaurants you saved, want to visit, planned, or visited</li>
          <li>Planned and visited dates, and any reservation note you add</li>
          <li>Your personal rating, private notes, and favourite dishes</li>
          <li>Collections you create and what you put in them</li>
        </ul>
        <p>
          None of this is public, and none of it affects what anyone else sees.
        </p>
      </ContentSection>

      <ContentSection heading="Google place information">
        <p>
          Some pages show photos and current place information — such as rating,
          hours, and phone number — supplied by Google through Google&rsquo;s
          Places UI Kit. When one of those surfaces loads, your browser contacts
          Google directly and Google&rsquo;s own terms and privacy policy apply
          to that request. That content remains Google&rsquo;s; we do not verify
          Google ratings and they are kept separate from Michelin distinctions
          and from your Passport.
        </p>
      </ContentSection>

      <ContentSection heading="Getting your data out, or deleting it">
        <p>
          From your <Link href="/account">Account</Link> page you can export the
          data stored against your account and request deletion of your account
          and its Passport data.
        </p>
        <p>
          A device-only Passport is removed by clearing site data in your
          browser.
        </p>
      </ContentSection>

      <ContentSection heading="Changes">
        <p>
          This page describes the product as it currently behaves. If what the
          product stores changes, this page changes with it.
        </p>
      </ContentSection>

      <ContentRelatedLinks
        links={[
          { href: "/account", label: "Account" },
          { href: "/terms", label: "Terms" },
        ]}
      />
    </ContentPage>
  );
}
```

- [ ] **Step 2: Replace `src/app/terms/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import {
  ContentPage,
  ContentRelatedLinks,
  ContentSection,
} from "@/components/stitch/content";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms",
  description: "The terms that apply to using Dining Passport.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <ContentPage
      title="Terms"
      intro="Short, plain terms for using this site. They describe how the product is offered — they do not create guarantees about restaurants, availability, or accuracy."
      meta="Last updated 27 July 2026"
    >
      <ContentSection heading="Using the site">
        <p>
          You may browse the atlas and keep a Passport for your own personal,
          non-commercial use. Please do not scrape the site in bulk, attempt to
          disrupt it, or use it to misrepresent the Michelin Guide.
        </p>
      </ContentSection>

      <ContentSection heading="Accuracy">
        <p>
          Restaurant details change constantly. Star levels, addresses, cuisines,
          opening hours, and booking links may be out of date or wrong. Confirm
          anything that matters — especially reservations and travel plans —
          directly with the restaurant before you rely on it.
        </p>
        <p>
          The site is provided as-is. We do not warrant that it will be
          available, complete, or error-free.
        </p>
      </ContentSection>

      <ContentSection heading="Your account and your content">
        <p>
          You are responsible for keeping your sign-in details secure and for
          what you store in your Passport. You keep ownership of your notes,
          ratings, and collections; we store them so we can show them back to
          you, as described in <Link href="/privacy">Privacy</Link>.
        </p>
        <p>
          We may suspend an account that is being used to attack or abuse the
          service.
        </p>
      </ContentSection>

      <ContentSection heading="Third-party content and trademarks">
        <p>
          {siteConfig.footerDisclaimer} Michelin, the Michelin Guide, and related
          marks belong to their owners, and are referred to here only to describe
          which restaurants hold which distinctions. Place information supplied
          by Google remains subject to Google&rsquo;s terms. See{" "}
          <Link href="/sources">Sources</Link>.
        </p>
      </ContentSection>

      <ContentSection heading="Changes">
        <p>
          These terms may change as the product changes. Continuing to use the
          site after a change means the updated terms apply.
        </p>
      </ContentSection>

      <ContentRelatedLinks
        links={[
          { href: "/privacy", label: "Privacy" },
          { href: "/sources", label: "Sources" },
        ]}
      />
    </ContentPage>
  );
}
```

- [ ] **Step 3: Run privacy/terms e2e**

Run: `npx playwright test e2e/footer-content.spec.ts -g "privacy|terms|Last updated" --reporter=line`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/privacy/page.tsx src/app/terms/page.tsx
git commit -m "$(cat <<'EOF'
feat(ui): refresh Privacy and Terms reading pages

Add last-updated meta, tighten copy, and related links.
EOF
)"
```

---

### Task 5: Contact page

**Files:**
- Modify: `src/app/contact/page.tsx`
- Test: `e2e/footer-content.spec.ts` (contact case)

**Interfaces:**
- Consumes: `ContentPage`, `ContentSection`, `ContentCallout`, `ContentRelatedLinks`
- Produces: no-inbox callout; four routing sections; related Sources + Privacy

- [ ] **Step 1: Replace `src/app/contact/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import {
  ContentCallout,
  ContentPage,
  ContentRelatedLinks,
  ContentSection,
} from "@/components/stitch/content";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact",
  description:
    "How corrections, data questions, and official Michelin Guide matters are handled.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <ContentPage
      title="Contact"
      intro="Dining Passport is an independent project. Use this page to see where different kinds of questions belong."
    >
      <ContentCallout title="No public inbox yet">
        <p>
          There is no public contact address yet. A channel will appear on this
          page when one exists — we will not invent an email or form in the
          meantime.
        </p>
      </ContentCallout>

      <ContentSection heading="Corrections to a listing">
        <p>
          If a restaurant&rsquo;s star level, address, cuisine, or closure status
          looks wrong here, the Michelin Guide listing is the authority. Every
          restaurant page links to its Michelin Guide entry; if the two disagree,
          trust the Guide.
        </p>
        <p>
          There is no in-app correction channel yet. When one exists, it will be
          published here.
        </p>
      </ContentSection>

      <ContentSection heading="Official Michelin Guide matters">
        <p>
          We cannot help with anything official: award decisions, inspections,
          appeals, press, or listing requests. Dining Passport is not affiliated
          with the Michelin Guide and has no influence over any of it. Contact
          the Michelin Guide directly.
        </p>
      </ContentSection>

      <ContentSection heading="Reservations">
        <p>
          We do not take, hold, or modify bookings. Booking links point to
          whichever service the restaurant uses, and any reservation you make
          lives with that service and the restaurant — not with us.
        </p>
      </ContentSection>

      <ContentSection heading="Your account and your data">
        <p>
          Exporting or deleting the data stored against your account does not
          need us: both are available from your{" "}
          <Link href="/account">Account</Link> page.{" "}
          <Link href="/privacy">Privacy</Link> describes what is stored.
        </p>
      </ContentSection>

      <ContentRelatedLinks
        links={[
          { href: "/sources", label: "Sources" },
          { href: "/privacy", label: "Privacy" },
        ]}
      />
    </ContentPage>
  );
}
```

- [ ] **Step 2: Run contact e2e**

Run: `npx playwright test e2e/footer-content.spec.ts -g "contact" --reporter=line`

Expected: PASS (no mailto, no form, callout visible).

- [ ] **Step 3: Commit**

```bash
git add src/app/contact/page.tsx
git commit -m "$(cat <<'EOF'
feat(ui): refresh Contact as an honest routing map

Add no-inbox callout and clear destinations without inventing an address.
EOF
)"
```

---

### Task 6: Sources page

**Files:**
- Modify: `src/app/sources/page.tsx`
- Test: `e2e/footer-content.spec.ts` (sources currency)

**Interfaces:**
- Consumes: `ContentPage`, `ContentSection`, `ContentCallout`, `ContentRelatedLinks`, `siteConfig`
- Produces: currency callout with `dataUpdatedLabel` + `coverageNote`; related About + Contact

- [ ] **Step 1: Replace `src/app/sources/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import {
  ContentCallout,
  ContentPage,
  ContentRelatedLinks,
  ContentSection,
} from "@/components/stitch/content";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Sources",
  description:
    "Where the restaurant information on Dining Passport comes from, and how current it is.",
  path: "/sources",
});

export default function SourcesPage() {
  return (
    <ContentPage
      title="Sources"
      intro="Where the information on this site comes from, and how far you should trust each part of it."
    >
      <ContentCallout title="How current this is">
        <p>{siteConfig.dataUpdatedLabel}.</p>
        <p className="mt-2">{siteConfig.coverageNote}</p>
      </ContentCallout>

      <ContentSection heading="Restaurant listings and star levels">
        <p>
          Which restaurants appear here, and how many stars each holds, is
          compiled from publicly available Michelin Guide listings for the United
          States. Every restaurant page links back to its Michelin Guide entry,
          which is the authority if the two ever disagree.
        </p>
      </ContentSection>

      <ContentSection heading="Cities, states, and map locations">
        <p>
          Addresses come from the same listings. Map coordinates are derived from
          those addresses, so a pin can sit slightly off the true entrance —
          particularly for restaurants inside hotels, malls, or multi-tenant
          buildings. Use the address, not the pin, to find the door.
        </p>
      </ContentSection>

      <ContentSection heading="Booking links">
        <p>
          Where a restaurant publishes a reservation page, we link to it
          directly. We are not a reservation service and do not see, hold, or
          confirm any booking. Availability shown by those services is theirs,
          not ours.
        </p>
      </ContentSection>

      <ContentSection heading="Google place information">
        <p>{siteConfig.googlePlacesDisclaimer}</p>
        <p>
          Google ratings are kept visually and conceptually separate from
          Michelin distinctions, and from anything in your private Passport.
        </p>
      </ContentSection>

      <ContentSection heading="Keeping information current">
        <p>
          Listings are refreshed periodically rather than continuously, so
          recently awarded, relocated, or closed restaurants can lag. Confirm
          anything time-sensitive with the restaurant.{" "}
          <Link href="/contact">Contact</Link> explains how corrections are
          handled.
        </p>
      </ContentSection>

      <ContentSection heading="Independence">
        <p>{siteConfig.independenceDisclaimer}</p>
      </ContentSection>

      <ContentRelatedLinks
        links={[
          { href: "/about", label: "About" },
          { href: "/contact", label: "Contact" },
        ]}
      />
    </ContentPage>
  );
}
```

- [ ] **Step 2: Run full footer-content suite**

Run: `npx playwright test e2e/footer-content.spec.ts --reporter=line`

Expected: all PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/sources/page.tsx
git commit -m "$(cat <<'EOF'
feat(ui): refresh Sources with product-language currency callout

Clarify provenance and keep Google and Michelin boundaries explicit.
EOF
)"
```

---

### Task 7: Visual baselines

**Files:**
- Create: `scripts/capture_content_pages_baselines.mjs`
- Create: `docs/stitch-redesign/baselines/content-pages/*.png` (generated)

**Interfaces:**
- Consumes: running app at `BASE_URL` (default `http://127.0.0.1:3112`)
- Produces: desktop 1440 + mobile 390 full-page shots for each of the five routes

- [ ] **Step 1: Create capture script**

```js
/**
 * Footer content pages visual baselines (calm reading redesign).
 * Owns a dedicated port via BASE_URL (default http://127.0.0.1:3112).
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "docs/stitch-redesign/baselines/content-pages");
mkdirSync(outDir, { recursive: true });

const base = process.env.BASE_URL ?? "http://127.0.0.1:3112";
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };
const ROUTES = ["about", "privacy", "terms", "contact", "sources"];

async function assertApp(page) {
  const title = await page.title();
  if (!/Dining Passport/i.test(title)) {
    throw new Error(`Wrong app title at ${page.url()}: ${title}`);
  }
}

const browser = await chromium.launch();
try {
  for (const viewport of [
    { name: "desktop", size: DESKTOP },
    { name: "mobile-390", size: MOBILE },
  ]) {
    const page = await browser.newPage({ viewport: viewport.size });
    for (const route of ROUTES) {
      await page.goto(`${base}/${route}`, { waitUntil: "networkidle" });
      await assertApp(page);
      const file = `content-${route}-${viewport.name}.png`;
      await page.screenshot({ path: join(outDir, file), fullPage: true });
      console.log("wrote", file);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
```

- [ ] **Step 2: Ensure the app is running on the capture port**

If nothing is listening on 3112, start the app in another terminal (or reuse the project’s usual capture port pattern):

Run: `npx next start -p 3112` (or `npm run dev -- -p 3112` if that is the local convention)

Then: `BASE_URL=http://127.0.0.1:3112 node scripts/capture_content_pages_baselines.mjs`

Expected: ten PNG files under `docs/stitch-redesign/baselines/content-pages/`.

- [ ] **Step 3: Spot-check screenshots**

Open `content-about-desktop.png`, `content-contact-desktop.png`, and `content-sources-mobile-390.png`. Confirm brand rule, one accent each, related links, no form on Contact.

- [ ] **Step 4: Commit baselines + script**

```bash
git add scripts/capture_content_pages_baselines.mjs docs/stitch-redesign/baselines/content-pages
git commit -m "$(cat <<'EOF'
docs(ui): capture footer content page redesign baselines

Record desktop and mobile reading-page screenshots for visual QA.
EOF
)"
```

---

## Spec coverage checklist

| Spec requirement | Task |
| --- | --- |
| Shared calm reading shell + brand rule | Task 2 |
| `ContentCallout` / `ContentRelatedLinks` | Task 2 |
| `dataUpdatedLabel` product language | Task 2 |
| About purpose + related | Task 3 |
| Privacy/Terms last updated + related | Task 4 |
| Contact honest placeholder / no form | Task 5 |
| Sources currency callout | Task 6 |
| E2E: chrome, jargon, contact, sources | Task 1 + verified in 3–6 |
| Visual baselines desktop + mobile | Task 7 |
| SiteFooter chrome out of scope | No task (intentional) |

## Self-review notes

- No TBD/placeholder steps remain; Contact “channel later” is explicit product copy
- Interfaces for `purpose`, `ContentCallout`, and `ContentRelatedLinks` are consistent across tasks
- Jargon ban covered by per-route e2e after `dataUpdatedLabel` rewrite
- Double period risk: Sources callout uses `{siteConfig.dataUpdatedLabel}.` — label string must **not** already end with a period (planned value has none)
