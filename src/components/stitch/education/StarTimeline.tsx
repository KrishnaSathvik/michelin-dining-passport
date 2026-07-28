import { PageContainer } from "@/components/stitch/PageContainer";
import type { EducationPageViewModel } from "./models";

type StarTimelineProps = {
  items: EducationPageViewModel["timeline"];
};

export function StarTimeline({ items }: StarTimelineProps) {
  return (
    <section
      className="py-[var(--dp-section)]"
      aria-labelledby="timeline-heading"
      data-education-section="timeline"
    >
      <PageContainer>
        <h2
          id="timeline-heading"
          className="text-center font-display text-[28px] text-dp-primary md:text-[34px]"
        >
          A short history
        </h2>
        <ol className="mx-auto mt-10 max-w-2xl">
          {items.map((item, index) => (
            <li key={item.year} className="flex gap-5">
              {/* Marker + connective line */}
              <div className="flex flex-col items-center">
                <span
                  className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[var(--dp-star-gold)] ring-4 ring-dp-soft"
                  aria-hidden="true"
                />
                {index < items.length - 1 ? (
                  <span
                    className="w-px flex-1 bg-dp-border"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
              <div className={index < items.length - 1 ? "pb-8" : ""}>
                <p className="font-display text-[22px] leading-none text-dp-primary">
                  {item.year}
                </p>
                <p className="mt-2 font-sans text-[15px] leading-relaxed text-dp-ink-secondary">
                  {item.label}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </PageContainer>
    </section>
  );
}
