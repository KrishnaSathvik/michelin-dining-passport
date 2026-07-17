import Link from "next/link";
import { PageContainer } from "@/components/stitch/PageContainer";
import type { StarPageViewModel } from "./models";

type OtherDistinctionsProps = {
  items: StarPageViewModel["otherDistinctions"];
};

export function OtherDistinctions({ items }: OtherDistinctionsProps) {
  return (
    <section
      className="border-t border-dp-border py-[var(--dp-section)]"
      aria-labelledby="other-distinctions-heading"
      data-taxonomy-section="other-distinctions"
    >
      <PageContainer>
        <h2
          id="other-distinctions-heading"
          className="font-display text-[24px] text-dp-primary"
        >
          Other distinctions
        </h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <li key={item.stars}>
              <Link
                href={item.href}
                aria-current={item.current ? "page" : undefined}
                className={`flex min-h-[8rem] flex-col justify-between rounded-[var(--dp-radius-xl)] border p-5 no-underline transition-colors ${
                  item.current
                    ? "border-[var(--dp-star-gold)] bg-[color-mix(in_srgb,var(--dp-star-gold)_10%,white)]"
                    : "border-dp-border bg-dp-surface hover:border-dp-primary"
                }`}
              >
                <p
                  className="font-display text-[22px] tracking-[0.12em] text-[var(--dp-star-gold)]"
                  aria-hidden="true"
                >
                  {"★".repeat(item.stars)}
                </p>
                <div>
                  <p className="font-sans text-base font-semibold text-dp-ink">
                    {item.label}
                    {item.current ? (
                      <span className="sr-only"> (current page)</span>
                    ) : null}
                  </p>
                  <p className="mt-1 font-sans text-sm text-dp-ink-muted">
                    {item.count} in roster · {item.meaning}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
