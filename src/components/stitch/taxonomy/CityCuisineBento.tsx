import type { CityCuisineShare } from "./aggregations";

type CityCuisineBentoProps = {
  cuisines: CityCuisineShare[];
};

export function CityCuisineBento({ cuisines }: CityCuisineBentoProps) {
  if (cuisines.length === 0) return null;

  return (
    <section
      className="rounded-[var(--dp-radius-xl)] border border-dp-border bg-dp-surface p-6 md:min-h-[300px] md:p-8"
      aria-labelledby="city-cuisine-heading"
      data-taxonomy-section="cuisine-bento"
    >
      <h2
        id="city-cuisine-heading"
        className="font-display text-[24px] text-dp-primary md:text-[28px]"
      >
        Dominant Cuisines
      </h2>
      <p className="mt-2 font-sans text-sm text-dp-ink-muted">
        Share of this city’s starred roster by cuisine label
      </p>
      <ul className="mt-8 space-y-5">
        {cuisines.map((item) => (
          <li key={item.cuisineSlug}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-sans text-sm font-medium text-dp-ink">
                {item.cuisine}
              </span>
              <span
                className="font-sans text-sm text-dp-ink-muted"
                aria-label={`${item.count} restaurants, ${item.percent} percent`}
              >
                {item.count} · {item.percent}%
              </span>
            </div>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-dp-soft"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-dp-primary"
                style={{ width: `${Math.min(100, item.percent)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
