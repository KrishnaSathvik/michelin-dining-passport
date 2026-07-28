import type { JourneySummaryMetric } from "./models";

type PassportJourneySummaryProps = {
  metrics: JourneySummaryMetric[];
};

export function PassportJourneySummary({
  metrics,
}: PassportJourneySummaryProps) {
  return (
    <section
      aria-label="Journey summary"
      className="mb-[var(--dp-section)] border-y border-dp-border py-7"
      data-passport-section="journey-summary"
    >
      <p className="dp-label-caps mb-6 text-dp-ink-muted">Journey at a glance</p>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-7 md:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.key} data-passport-metric={metric.key}>
            <dt className="font-sans text-sm text-dp-ink-muted">
              {metric.label}
            </dt>
            <dd className="mt-1 font-display text-3xl text-dp-primary-deep">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
