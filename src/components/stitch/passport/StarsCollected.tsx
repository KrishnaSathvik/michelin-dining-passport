import type { StarsCollectedModel } from "./models";

type StarsCollectedProps = {
  model: StarsCollectedModel;
};

function ProgressBar({
  value,
  max,
  tone,
  label,
}: {
  value: number;
  max: number;
  tone: "burgundy" | "secondary";
  label: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-[var(--dp-radius-xl)] bg-dp-surface-highest"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
    >
      <div
        className={`h-2 rounded-[var(--dp-radius-xl)] ${
          tone === "burgundy" ? "bg-dp-burgundy" : "bg-dp-secondary"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function StarsCollected({ model }: StarsCollectedProps) {
  return (
    <section
      className="rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface p-6"
      data-passport-section="stars-collected"
      aria-labelledby="stars-collected-heading"
    >
      <h2
        id="stars-collected-heading"
        className="dp-headline-sm mb-2 text-dp-primary-deep"
      >
        Stars Collected
      </h2>
      <p className="mb-6 font-sans text-sm text-dp-ink-muted">
        {model.totalStars} Michelin{" "}
        {model.totalStars === 1 ? "star" : "stars"} from visited restaurants
      </p>
      <ul className="space-y-5">
        {model.rows.map((row) => (
          <li key={row.stars}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="dp-body-md text-dp-ink">{row.label}</span>
              <span className="dp-body-md text-dp-ink-muted">
                {row.visited}/{row.total}
              </span>
            </div>
            <ProgressBar
              value={row.visited}
              max={row.total}
              tone="burgundy"
              label={`${row.label}: ${row.visited} of ${row.total} visited`}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
