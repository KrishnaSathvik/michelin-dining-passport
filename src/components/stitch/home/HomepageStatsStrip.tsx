import type { HomepageTotals } from "./models";

type HomepageStatsStripProps = {
  totals: HomepageTotals;
};

type StatItem = {
  value: number;
  label: string;
  /** Accessible description including star count in text. */
  accessibleLabel: string;
  stars?: 1 | 2 | 3;
};

/**
 * Live dataset statistics strip — four equal editorial stats (explore_feed).
 */
export function HomepageStatsStrip({ totals }: HomepageStatsStripProps) {
  const items: StatItem[] = [
    {
      value: totals.restaurants,
      label: "Restaurants",
      accessibleLabel: `${totals.restaurants} restaurants`,
    },
    {
      value: totals.oneStar,
      label: "One Star",
      accessibleLabel: `${totals.oneStar} one Michelin star restaurants`,
      stars: 1,
    },
    {
      value: totals.twoStar,
      label: "Two Star",
      accessibleLabel: `${totals.twoStar} two Michelin star restaurants`,
      stars: 2,
    },
    {
      value: totals.threeStar,
      label: "Three Star",
      accessibleLabel: `${totals.threeStar} three Michelin star restaurants`,
      stars: 3,
    },
  ];

  return (
    <section
      className="border-b border-dp-outline-variant bg-dp-surface"
      data-homepage-section="stats"
      aria-label="Restaurant catalog statistics"
    >
      <div className="mx-auto max-w-[var(--dp-content-max)] px-[var(--dp-margin-mobile)] py-8 md:px-[var(--dp-margin-desktop)]">
        <ul className="grid grid-cols-2 text-center md:grid-cols-4 md:divide-x md:divide-dp-outline-variant/30">
          {items.map((item) => (
            <li
              key={item.label}
              className="flex flex-col items-center justify-center px-3 py-4 md:py-0"
            >
              <p
                className="font-display text-[32px] leading-[1.2] text-dp-primary"
                aria-hidden="true"
              >
                {item.value}
              </p>
              <div className="mt-1 flex items-center justify-center gap-1">
                {item.stars ? (
                  <span
                    className="inline-flex text-dp-star-gold"
                    aria-hidden="true"
                  >
                    {"★".repeat(item.stars)}
                  </span>
                ) : null}
                <span
                  className="font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-dp-ink-secondary"
                  aria-hidden="true"
                >
                  {item.label}
                </span>
              </div>
              <span className="sr-only">{item.accessibleLabel}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
