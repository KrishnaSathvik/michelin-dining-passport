# Footer content pages redesign

**Date:** 2026-07-27  
**Status:** Approved for planning  
**Routes:** `/about`, `/privacy`, `/terms`, `/contact`, `/sources`

## Intent

Refresh the five supporting pages linked from `SiteFooter` so they feel like Dining Passport — calm reading documents with Stitch typography and spacing — while tightening copy. Keep honesty: Contact stays a routing map with no fake inbox.

## Decisions

| Decision | Choice |
| --- | --- |
| Scope | Visual + content refresh |
| Feel | Calm reading pages (focused column, light brand cue) |
| Approach | Shared shell + light page accents |
| Contact channel | Honest placeholder; no email or form in this work |
| SiteFooter chrome | Out of scope (links already correct) |

## Non-goals

- Redesigning `SiteFooter` layout or primary nav
- Contact form, mailto, or third-party support inbox
- Auth-style split brand panels
- Hero imagery, card grids, or Explore-like scanning UI
- New backend, env vars, or analytics events

## Shared reading system

All five routes continue to use one shell under `src/components/stitch/content/`.

### Layout

- Single measured column (`max-w-[68ch]`), shared header/footer chrome unchanged
- Page header: Literata title (`dp-headline-md`), short intro (`dp-body-md` secondary), optional meta line (`dp-meta` muted)
- Light brand cue under the title: a thin primary-green rule beneath the H1 — not a hero, not a card, not a wash band
- Sections: clearer vertical rhythm; H2s via `ContentSection`; body sans
- Inline links: primary color, underline, underline-offset (existing treatment)

### Components

| Component | Role |
| --- | --- |
| `ContentPage` | Page shell: container, header (title / intro / meta), brand cue, children slot |
| `ContentSection` | Headed prose block with shared list/link styles |
| `ContentCallout` | Optional bordered soft panel for one quiet accent |
| `ContentRelatedLinks` | End-of-page “Also useful” cross-links |

Route files stay thin composers. No new data adapters or view-model layer.

### Copy rules (global)

- Plain product language only
- Ban user-facing **dataset**, **roster**, and **ingest/import** wording on these pages
- Independence story: footer keeps the short disclaimer once; About and Sources carry fuller context — do not stack duplicate disclaimer walls
- Rewrite `siteConfig.dataUpdatedLabel` from `"Dataset current through July 2026"` to product language, e.g. `"Information current through July 2026"`
- Contact never invents an email address or form

## Page map

### About (`/about`)

**Job:** What Dining Passport is, what it is not, where info comes from, Passport privacy.

**Accent:** One-line purpose strip under the intro — text only, e.g. “Browse. Plan. Remember — independently.” No badge cluster.

**Related:** Sources, Privacy, Contact.

**Copy direction:** Keep four sections; tighten each to 1–2 short paragraphs. Preserve independence and non-affiliation. Link to Sources / Contact / Privacy rather than repeating their full text.

### Privacy (`/privacy`)

**Job:** What is stored where (device-only vs account), Google Places boundary, export/delete, that the page tracks product behavior.

**Accent:** Consistent `Last updated` meta on the page header.

**Related:** Account (`/account`), Terms.

**Copy direction:** Keep existing section structure; soften legal tone without inventing stronger guarantees than the product provides.

### Terms (`/terms`)

**Job:** Personal use, accuracy as-is, account/content responsibility, third-party marks and Google content, changes.

**Accent:** Same `Last updated` meta pattern as Privacy.

**Related:** Privacy, Sources.

**Copy direction:** Stay short and plain; keep Michelin trademark boundary and reservation non-service stance.

### Contact (`/contact`)

**Job:** Route each kind of question to the right place. No public inbox yet.

**Accent:** `ContentCallout` stating there is no public contact address yet; a channel will appear on this page when one exists.

**Structure (where this belongs):**

1. Listing corrections → Michelin Guide is authority; Guide link via restaurant pages; no in-app correction channel yet
2. Official Michelin matters → contact the Guide; we have no influence
3. Reservations → restaurant’s booking service, not us
4. Account and data → Account export/delete; Privacy for storage detail

**Related:** Sources, Privacy.

**Hard rule:** No `mailto:`, no form, no invented support address.

### Sources (`/sources`)

**Job:** Provenance and trust boundaries for listings, geo, booking links, Google place info, currency, independence.

**Accent:** `ContentCallout` with updated `dataUpdatedLabel` plus coverage note (product language, not dataset jargon).

**Related:** About, Contact.

**Copy direction:** Keep section coverage; ensure Michelin Guide remains the authority when listings disagree; keep Google visually/conceptually separate from stars and Passport.

## Architecture notes

```
SiteFooter → /about | /privacy | /terms | /contact | /sources
                 ↓
            ContentPage (shared shell)
                 ├── ContentCallout? (Contact, Sources)
                 ├── ContentSection… (page-specific)
                 └── ContentRelatedLinks
```

- `siteConfig` remains the source for product name, disclaimers, coverage note, Google disclaimer, and currency label
- Pages remain static React Server Components (no client interactivity required)
- Error handling: standard Next.js route errors only; no page-specific failure modes

## Verification

### E2E (`e2e/footer-content.spec.ts`)

Extend existing coverage:

- Shared chrome (header + footer) on each route
- Each page exposes its primary heading and intro
- Contact has no `mailto:` and no form controls
- Sources shows the currency callout / updated label
- User-facing copy on these pages does not match `/dataset|roster|ingest/i`

### Visual baselines

Capture desktop + mobile baselines for the five content pages (same spirit as `docs/stitch-redesign/baselines/shell-auth/content-*.png`).

### Manual checks

- Footer still links to all five destinations
- One independence disclaimer in the footer; fuller context only on About/Sources as designed
- Mobile: no horizontal overflow; related links wrap cleanly

## Success criteria

1. All five pages share one upgraded reading shell with a light brand cue
2. Each page has at most one quiet accent (purpose strip, last-updated meta, or callout)
3. Copy is tighter, product-voiced, and free of dataset/roster jargon
4. Contact remains an honest routing map with an explicit “no inbox yet” callout
5. Existing footer chrome and primary product flows are unchanged
