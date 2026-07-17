import Link from "next/link";
import { Section } from "@/components/layout/Section";

export function PassportPreview() {
  return (
    <Section
      id="passport"
      eyebrow="Your journey"
      title="Your Michelin journey starts with one restaurant"
      dek="Save places to try, mark visits, and build a personal dining passport. Sync across devices when you sign in."
      className="bg-surface-soft"
    >
      <div className="grid gap-8 rounded-[var(--radius-lg)] border border-border bg-bg p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <ol className="space-y-4 font-sans text-base text-ink-secondary">
            <li className="flex gap-3">
              <span className="font-display text-xl text-forest">1</span>
              <span>Search for a restaurant worth remembering</span>
            </li>
            <li className="flex gap-3">
              <span className="font-display text-xl text-forest">2</span>
              <span>Save it to your Passport shortlist</span>
            </li>
            <li className="flex gap-3">
              <span className="font-display text-xl text-forest">3</span>
              <span>Mark your first visit when you go</span>
            </li>
          </ol>
          <Link
            href="/passport"
            className="mt-8 inline-flex min-h-12 items-center rounded-[var(--radius-md)] bg-forest px-6 font-sans text-[15px] font-medium text-white no-underline transition-colors hover:bg-forest-deep"
          >
            Open Passport
          </Link>
        </div>
        <div
          className="min-h-[12rem] rounded-[var(--radius-lg)] p-6 text-white"
          style={{
            background:
              "linear-gradient(160deg, #123b2f 0%, #0a2b21 55%, #1a1a1a 100%)",
          }}
        >
          <p className="font-display text-3xl">Dining Passport</p>
          <p className="mt-3 font-sans text-sm text-white/75">
            Progress, saved lists, and visits — personal and motivating, not a
            wall of empty analytics boxes.
          </p>
        </div>
      </div>
    </Section>
  );
}
