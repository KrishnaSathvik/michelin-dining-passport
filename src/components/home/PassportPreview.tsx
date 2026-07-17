import Link from "next/link";
import { Section } from "@/components/layout/Section";

const sample = {
  visited: [
    { name: "Kasama", place: "Chicago", stars: 2 },
    { name: "Semma", place: "New York", stars: 1 },
    { name: "Frasca Food and Wine", place: "Boulder", stars: 1 },
  ],
  saved: [
    { name: "SingleThread", place: "Healdsburg" },
    { name: "minibar by José Andrés", place: "Washington" },
  ],
  stats: [
    { label: "Restaurants visited", value: "3" },
    { label: "Stars experienced", value: "4" },
    { label: "States explored", value: "3" },
    { label: "Saved destinations", value: "2" },
  ],
} as const;

export function PassportPreview() {
  return (
    <Section
      id="passport"
      eyebrow="On this device"
      title="Your dining passport"
      dek="Save restaurants, mark visits, and build collections locally. Data stays on this device until cloud accounts arrive."
      className="border-t border-border bg-bg-elevated/40"
    >
      <div className="border border-dashed border-burgundy/40 bg-bg-elevated p-5 sm:p-8">
        <p className="inline-block border border-burgundy/30 px-2.5 py-1 font-sans text-xs uppercase tracking-[0.16em] text-burgundy">
          Example preview
        </p>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <dl className="grid grid-cols-2 gap-px border border-border bg-border">
            {sample.stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-bg-elevated px-4 py-5 sm:px-5"
              >
                <dt className="font-sans text-xs uppercase tracking-[0.14em] text-ink-muted">
                  {stat.label}
                </dt>
                <dd className="mt-2 font-display text-3xl text-ink">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="font-sans text-xs uppercase tracking-[0.16em] text-ink-muted">
                Visited (sample)
              </h3>
              <ul className="mt-3 space-y-3">
                {sample.visited.map((item) => (
                  <li key={item.name} className="border-b border-border pb-3">
                    <p className="font-display text-lg text-ink">{item.name}</p>
                    <p className="mt-1 font-sans text-sm text-ink-muted">
                      {item.place}
                      <span className="mx-2 text-border" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-gold" aria-hidden="true">
                        {"★".repeat(item.stars)}
                      </span>
                      <span className="sr-only">
                        {item.stars === 1
                          ? "1 Michelin star"
                          : `${item.stars} Michelin stars`}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-sans text-xs uppercase tracking-[0.16em] text-ink-muted">
                Saved (sample)
              </h3>
              <ul className="mt-3 space-y-3">
                {sample.saved.map((item) => (
                  <li key={item.name} className="border-b border-border pb-3">
                    <p className="font-display text-lg text-ink">{item.name}</p>
                    <p className="mt-1 font-sans text-sm text-ink-muted">
                      {item.place}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-8 max-w-2xl font-sans text-sm leading-relaxed text-ink-muted">
          The sample numbers above are illustrative. Your real Passport data is
          saved on this device only — not synced to the cloud yet.
        </p>
        <Link
          href="/passport"
          className="mt-6 inline-flex min-h-11 items-center bg-forest px-5 font-sans text-sm font-medium text-bg-elevated"
        >
          Open Passport
        </Link>
      </div>
    </Section>
  );
}
