import Link from "next/link";
import { Section } from "@/components/layout/Section";

export function MapTeaser() {
  return (
    <Section
      id="map-teaser"
      eyebrow="Map"
      title="Explore on the map"
      dek="See starred restaurants across the United States with synchronized list and markers."
    >
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
        <div
          className="relative flex min-h-[16rem] items-end p-6 sm:min-h-[22rem] sm:p-10"
          style={{
            background:
              "linear-gradient(180deg, #e8eee9 0%, #d5e0d8 40%, #b7c9bc 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, #123b2f 0 4px, transparent 5px), radial-gradient(circle at 55% 35%, #123b2f 0 5px, transparent 6px), radial-gradient(circle at 70% 55%, #123b2f 0 4px, transparent 5px), radial-gradient(circle at 42% 62%, #b88a2a 0 6px, transparent 7px)",
            }}
            aria-hidden="true"
          />
          <div className="relative max-w-md rounded-[var(--radius-md)] bg-bg/95 p-5 shadow-[var(--shadow-float)] backdrop-blur-sm">
            <p className="font-display text-2xl text-ink">Full-screen map workspace</p>
            <p className="mt-2 font-sans text-sm text-ink-secondary">
              Filter by stars, state, and cuisine. Open saved and visited layers
              from your Passport.
            </p>
            <Link
              href="/map"
              className="mt-4 inline-flex min-h-11 items-center rounded-[var(--radius-md)] bg-forest px-5 font-sans text-[15px] font-medium text-white no-underline hover:bg-forest-deep"
            >
              Open map
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
