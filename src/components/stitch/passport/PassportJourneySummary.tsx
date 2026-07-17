import { PassportSummaryMetric } from "./PassportSummaryMetric";
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
      className="mb-[var(--dp-section)]"
      data-passport-section="journey-summary"
    >
      <div className="grid grid-cols-1 gap-[var(--dp-gutter)] md:grid-cols-3">
        {metrics.map((metric) => (
          <PassportSummaryMetric key={metric.key} metric={metric} />
        ))}
      </div>
    </section>
  );
}
