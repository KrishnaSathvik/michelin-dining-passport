type CityDistinctionBentoProps = {
  oneStar: number;
  twoStar: number;
  threeStar: number;
  total: number;
};

export function CityDistinctionBento({
  oneStar,
  twoStar,
  threeStar,
  total,
}: CityDistinctionBentoProps) {
  const items = [
    {
      label: "Three Michelin stars",
      value: threeStar,
      gold: true,
    },
    {
      label: "Two Michelin stars",
      value: twoStar,
      gold: false,
    },
    {
      label: "One Michelin star",
      value: oneStar,
      gold: false,
    },
  ];

  return (
    <section
      className="rounded-[var(--dp-radius-xl)] border border-dp-border bg-dp-soft p-6 md:min-h-[300px] md:p-8"
      aria-labelledby="city-distinction-heading"
      data-taxonomy-section="distinction-bento"
    >
      <h2
        id="city-distinction-heading"
        className="font-display text-[24px] text-dp-primary md:text-[28px]"
      >
        Culinary Distinction
      </h2>
      <p className="mt-2 font-sans text-sm text-dp-ink-muted">
        {total} Michelin-starred{" "}
        {total === 1 ? "restaurant" : "restaurants"} in the current roster
      </p>
      <ul className="mt-8 grid gap-6 sm:grid-cols-3">
        {items.map((item) => (
          <li key={item.label}>
            <p
              className={`font-display text-[40px] leading-none tracking-tight md:text-[48px] ${
                item.gold ? "text-[var(--dp-star-gold)]" : "text-dp-primary"
              }`}
              aria-label={`${item.value} ${item.label}`}
            >
              {item.value}
            </p>
            <p className="mt-2 font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-dp-ink-muted">
              {item.label}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
