"use client";

import Link from "next/link";
import { useState } from "react";
import { Section } from "@/components/layout/Section";
import { homepageConfig } from "@/config/homepage";
import type { CuisineAggregate } from "@/lib/data/types";

type BrowseByCuisineProps = {
  cuisines: CuisineAggregate[];
};

export function BrowseByCuisine({ cuisines }: BrowseByCuisineProps) {
  const [showAll, setShowAll] = useState(false);
  const limit = homepageConfig.cuisinePreviewLimit;
  const visible = showAll ? cuisines : cuisines.slice(0, limit);
  const hiddenCount = Math.max(cuisines.length - limit, 0);

  return (
    <Section
      id="browse-cuisines"
      eyebrow="Cuisines"
      title="Browse by cuisine"
      dek="Cuisine labels from the source roster. Counts reflect the current imported dataset."
      className="bg-surface-soft"
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((cuisine) => (
          <li key={cuisine.cuisineSlug}>
            <Link
              href={`/cuisines/${encodeURIComponent(cuisine.cuisineSlug)}`}
              className="flex min-h-[4.5rem] items-center justify-between gap-3 rounded-[var(--radius-md)] border border-border bg-bg px-4 py-3 no-underline transition-colors hover:border-forest"
            >
              <span className="font-display text-xl text-ink">
                {cuisine.cuisine}
              </span>
              <span className="font-sans text-sm tabular-nums text-ink-muted">
                {cuisine.count}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {hiddenCount > 0 ? (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className="min-h-11 rounded-[var(--radius-md)] border border-border bg-bg px-5 font-sans text-[15px] text-ink transition-colors hover:border-forest"
            aria-expanded={showAll}
          >
            {showAll
              ? "Show fewer cuisines"
              : `View all cuisines (${cuisines.length})`}
          </button>
        </div>
      ) : null}
    </Section>
  );
}
