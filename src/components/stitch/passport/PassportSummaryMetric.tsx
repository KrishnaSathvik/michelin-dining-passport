import Link from "next/link";
import type { JourneySummaryMetric } from "./models";

type PassportSummaryMetricProps = {
  metric: JourneySummaryMetric;
};

export function PassportSummaryMetric({ metric }: PassportSummaryMetricProps) {
  const content = (
    <>
      <p className="dp-label-caps mb-2 text-dp-ink-muted">{metric.label}</p>
      <p
        className="font-display text-[32px] font-bold leading-[1.2] text-dp-primary-deep"
        aria-label={`${metric.value} ${metric.label.toLowerCase()}`}
      >
        {metric.value}
      </p>
      <p className="mt-2 font-sans text-[13px] leading-snug text-dp-ink-muted">
        {metric.description}
      </p>
    </>
  );

  const className =
    "block rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface-low p-6 transition-shadow motion-safe:hover:shadow-[var(--dp-shadow-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus";

  if (metric.href) {
    return (
      <Link
        href={metric.href}
        className={`${className} no-underline`}
        data-passport-metric={metric.key}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={className} data-passport-metric={metric.key}>
      {content}
    </div>
  );
}
