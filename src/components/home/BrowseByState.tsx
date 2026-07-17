import Link from "next/link";
import { Section } from "@/components/layout/Section";
import type { StateAggregate } from "@/lib/data/types";

type BrowseByStateProps = {
  states: StateAggregate[];
};

function starBreakdown(state: StateAggregate): string {
  const parts: string[] = [];
  if (state.threeStar) parts.push(`${state.threeStar}×3★`);
  if (state.twoStar) parts.push(`${state.twoStar}×2★`);
  if (state.oneStar) parts.push(`${state.oneStar}×1★`);
  return parts.join(" · ");
}

export function BrowseByState({ states }: BrowseByStateProps) {
  return (
    <Section
      id="browse-states"
      eyebrow="By territory"
      title="Browse by state"
      dek="Restaurant counts from the current roster. Michelin does not currently inspect every U.S. state — absence here is not a claim that a region was reviewed."
      className="border-t border-border bg-bg-elevated/35"
    >
      <ol className="columns-1 gap-x-12 sm:columns-2 lg:columns-3">
        {states.map((state, index) => (
          <li
            key={state.stateSlug}
            className="mb-4 break-inside-avoid border-b border-border/80 pb-3"
          >
            <Link
              href={`/explore?state=${encodeURIComponent(state.stateSlug)}`}
              className="group flex items-baseline justify-between gap-4"
            >
              <span className="font-display text-xl text-ink group-hover:text-forest">
                <span className="mr-2 font-sans text-xs text-ink-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {state.state}
              </span>
              <span className="font-sans text-sm tabular-nums text-ink-muted">
                {state.count}
              </span>
            </Link>
            <p className="mt-1 pl-8 font-sans text-xs text-ink-muted">
              <span className="sr-only">Star breakdown: </span>
              {starBreakdown(state)}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
