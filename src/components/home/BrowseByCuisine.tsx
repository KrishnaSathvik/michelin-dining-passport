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
      eyebrow="By cooking style"
      title="Browse by cuisine"
      dek="Cuisine labels are preserved from the source roster. Counts reflect the current imported dataset."
    >
      <ul className="flex flex-wrap gap-x-5 gap-y-3">
        {visible.map((cuisine) => (
          <li key={cuisine.cuisineSlug}>
            <Link
              href={`/explore?q=${encodeURIComponent(cuisine.cuisine)}`}
              className="group inline-flex items-baseline gap-2 border-b border-transparent font-sans text-base text-ink transition-colors hover:border-forest hover:text-forest"
            >
              <span>{cuisine.cuisine}</span>
              <span className="text-sm tabular-nums text-ink-muted group-hover:text-forest">
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
            className="border border-border px-4 py-2 font-sans text-sm text-ink transition-colors hover:border-forest hover:text-forest"
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
