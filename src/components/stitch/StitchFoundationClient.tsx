"use client";

import { useState } from "react";
import {
  ActiveFilterChip,
  Button,
  Dialog,
  Drawer,
  EmptyState,
  FilterChip,
  IconButton,
  Input,
  MichelinDistinction,
  PageContainer,
  RestaurantFallback,
  RestaurantMedia,
  SearchInput,
  SectionHeader,
  Select,
  SkeletonGrid,
} from "@/components/stitch";
import { AppHeaderClient } from "@/components/shell/AppHeaderClient";

const SWATCHES: { token: string; value: string; varName: string }[] = [
  { token: "bg", value: "#fcf9f8", varName: "--dp-bg" },
  { token: "surface", value: "#ffffff", varName: "--dp-surface" },
  { token: "soft", value: "#f5f6f4", varName: "--dp-soft" },
  { token: "ink", value: "#1c1b1b", varName: "--dp-ink" },
  { token: "ink-secondary", value: "#414845", varName: "--dp-ink-secondary" },
  { token: "ink-muted", value: "#717975", varName: "--dp-ink-muted" },
  { token: "primary", value: "#123b2f", varName: "--dp-primary" },
  { token: "primary-deep", value: "#00251b", varName: "--dp-primary-deep" },
  { token: "star-gold", value: "#b88a2a", varName: "--dp-star-gold" },
  { token: "border", value: "#e5e7e4", varName: "--dp-border" },
  { token: "error", value: "#ba1a1a", varName: "--dp-error" },
];

export function StitchFoundationClient() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [chipOn, setChipOn] = useState(true);

  return (
    <div className="dp-canvas pb-24">
      <PageContainer className="py-16">
        <p className="dp-label-caps text-dp-ink-muted">Development reference</p>
        <h1 className="dp-display-lg mt-4 text-dp-primary max-md:dp-display-lg-mobile">
          Dining Passport Component Library
        </h1>
        <p className="dp-body-lg mt-4 max-w-2xl text-dp-ink-secondary">
          Phase 1–2 Stitch primitives and application shell. Live AppHeader and
          SiteFooter wrap this route via the root layout. Matches{" "}
          <code className="break-all text-dp-ink">
            docs/designs/dining_passport_component_library
          </code>
          . Not linked from production navigation.
        </p>

        <section className="mt-20" data-shell-demo="signed-in">
          <SectionHeader
            title="Shell — signed-in preview"
            description="Isolated header demo for visual QA (preview user only)"
          />
          <div className="overflow-hidden rounded-[var(--dp-radius-lg)] border border-dp-border">
            <AppHeaderClient user={null} forceSignedInPreview />
          </div>
        </section>

        <section className="mt-20">
          <SectionHeader title="Colors" description="Approved --dp-* core palette" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {SWATCHES.map((swatch) => (
              <div
                key={swatch.token}
                className="overflow-hidden rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface"
              >
                <div
                  className="h-20 border-b border-dp-border"
                  style={{ background: swatch.value }}
                />
                <div className="p-3">
                  <p className="dp-meta font-medium text-dp-ink">{swatch.token}</p>
                  <p className="dp-meta text-dp-ink-muted">{swatch.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <SectionHeader title="Typography" />
          <div className="space-y-6 rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface p-8">
            <p className="dp-display-lg text-dp-ink">Display Large — Literata 48</p>
            <p className="dp-headline-md text-dp-ink">Headline Medium — Literata 32</p>
            <p className="dp-headline-sm text-dp-ink">Headline Small — Literata 24</p>
            <p className="dp-body-lg text-dp-ink-secondary">
              Body Large — Inter 18. Editorial body for supporting copy.
            </p>
            <p className="dp-body-md text-dp-ink-secondary">
              Body Medium — Inter 16. Functional UI and forms.
            </p>
            <p className="dp-meta text-dp-ink-muted">Meta — Inter 14</p>
            <p className="dp-label-caps text-dp-ink-muted">Label Caps — Inter 12</p>
          </div>
        </section>

        <section className="mt-20">
          <SectionHeader title="Spacing & layout" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Header", "72px"],
              ["Content max", "1280px"],
              ["Desktop margin", "64px"],
              ["Mobile margin", "20px"],
              ["Section rhythm", "80px"],
              ["Control height", "48px"],
              ["Card media", "4:3"],
              ["Radius", "4–8px"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface p-4"
              >
                <p className="dp-label-caps text-dp-ink-muted">{label}</p>
                <p className="dp-headline-sm mt-2 text-dp-ink">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <SectionHeader title="Buttons & icon controls" />
          <div className="flex flex-wrap items-center gap-4">
            <Button>Primary action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <IconButton label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M20 20l-3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </IconButton>
          </div>
        </section>

        <section className="mt-20">
          <SectionHeader title="Form controls" />
          <div className="grid max-w-xl gap-6">
            <Input label="Email" placeholder="you@example.com" />
            <SearchInput placeholder="Search restaurants or locations..." />
            <Select label="Sort">
              <option>Relevance</option>
              <option>Name</option>
              <option>Stars</option>
            </Select>
          </div>
        </section>

        <section className="mt-20">
          <SectionHeader title="Chips" />
          <div className="flex flex-wrap gap-3">
            <FilterChip selected={chipOn} onClick={() => setChipOn((v) => !v)}>
              Three Stars
            </FilterChip>
            <FilterChip>California</FilterChip>
            <ActiveFilterChip>Cuisine: Japanese</ActiveFilterChip>
          </div>
        </section>

        <section className="mt-20">
          <SectionHeader
            title="Michelin distinctions"
            description="Star gold only — never Google ratings"
          />
          <div className="flex flex-wrap items-center gap-6">
            <MichelinDistinction stars={1} />
            <MichelinDistinction stars={2} />
            <MichelinDistinction stars={3} />
            <MichelinDistinction stars={3} variant="detail" showLabel />
          </div>
        </section>

        <section className="mt-20">
          <SectionHeader
            title="Media & fallback"
            description="4:3 named-restaurant treatment"
            actionHref="/explore"
            actionLabel="View explore"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <RestaurantFallback name="Le Bernardin" city="New York, NY" stars={3} />
            <RestaurantFallback name="Benu" city="San Francisco, CA" stars={3} />
            <RestaurantMedia
              name="Demo with missing image"
              city="Chicago, IL"
              stars={3}
              imageUrl={null}
            />
          </div>
        </section>

        <section className="mt-20">
          <SectionHeader title="Overlays" />
          <div className="flex flex-wrap gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDrawerOpen(true)}
            >
              Open drawer
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDialogOpen(true)}
            >
              Open dialog
            </Button>
          </div>
        </section>

        <section className="mt-20">
          <SectionHeader title="Empty state" />
          <div className="rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface">
            <EmptyState
              title="No restaurants match"
              description="Try clearing filters or broadening your search across the United States atlas."
              actionLabel="Clear filters"
              onAction={() => undefined}
            />
          </div>
        </section>

        <section className="mt-20">
          <SectionHeader title="Loading skeletons" />
          <SkeletonGrid count={4} />
        </section>
      </PageContainer>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="All filters"
        footer={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setDrawerOpen(false)}
            >
              Clear
            </Button>
            <Button fullWidth onClick={() => setDrawerOpen(false)}>
              Apply
            </Button>
          </div>
        }
      >
        <p className="dp-body-md text-dp-ink-secondary">
          Base drawer primitive for Explore filters and mobile map panels.
        </p>
      </Drawer>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Plan your visit"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setDialogOpen(false)}>Save plan</Button>
          </div>
        }
      >
        <p className="dp-body-md text-dp-ink-secondary">
          Base dialog primitive for planning and visit details.
        </p>
      </Dialog>
    </div>
  );
}
