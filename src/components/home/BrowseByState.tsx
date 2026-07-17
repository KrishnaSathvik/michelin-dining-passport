import Link from "next/link";
import { Section } from "@/components/layout/Section";
import type { StateAggregate } from "@/lib/data/types";

type BrowseByStateProps = {
  states: StateAggregate[];
};

const FEATURED_SLUGS = [
  "california",
  "new-york",
  "illinois",
  "florida",
] as const;

const accentBySlug: Record<string, string> = {
  california: "linear-gradient(145deg, #123b2f, #2a5a4a)",
  "new-york": "linear-gradient(145deg, #1a1a1a, #3a3a3a)",
  illinois: "linear-gradient(145deg, #7a1f2b, #3a151a)",
  florida: "linear-gradient(145deg, #0a2b21, #1a4a3a)",
};

export function BrowseByState({ states }: BrowseByStateProps) {
  const featured = FEATURED_SLUGS.map((slug) =>
    states.find((state) => state.stateSlug === slug),
  ).filter(Boolean) as StateAggregate[];

  const remaining = states.filter(
    (state) =>
      !FEATURED_SLUGS.includes(
        state.stateSlug as (typeof FEATURED_SLUGS)[number],
      ),
  );

  return (
    <Section
      id="browse-states"
      eyebrow="Destinations"
      title="Browse by destination"
      dek="Visual entry points into key markets. Counts come from the live roster — Michelin does not inspect every U.S. state."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((state) => (
          <Link
            key={state.stateSlug}
            href={`/usa/${encodeURIComponent(state.stateSlug)}`}
            className="group relative min-h-[12rem] overflow-hidden rounded-[var(--radius-lg)] no-underline"
          >
            <div
              className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]"
              style={{
                background:
                  accentBySlug[state.stateSlug] ??
                  "linear-gradient(145deg, #123b2f, #0a2b21)",
              }}
            />
            <div className="relative flex h-full min-h-[12rem] flex-col justify-end p-5">
              <p className="font-display text-2xl text-white">{state.state}</p>
              <p className="mt-1 font-sans text-sm text-white/75">
                {state.count} restaurants
              </p>
            </div>
          </Link>
        ))}
      </div>

      {remaining.length > 0 ? (
        <ul className="mt-10 flex flex-wrap gap-x-5 gap-y-3">
          {remaining.map((state) => (
            <li key={state.stateSlug}>
              <Link
                href={`/usa/${encodeURIComponent(state.stateSlug)}`}
                className="font-sans text-base text-ink-secondary no-underline hover:text-forest"
              >
                {state.state}
                <span className="ml-2 tabular-nums text-ink-muted">
                  {state.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </Section>
  );
}
