import { PageContainer } from "@/components/stitch/PageContainer";
import type { TaxonomyStatModel } from "./models";
import { TaxonomyStat } from "./TaxonomyStat";

type StateAtAGlanceProps = {
  glance: TaxonomyStatModel[];
  starBreakdown: TaxonomyStatModel[];
  stateName: string;
};

export function StateAtAGlance({
  glance,
  starBreakdown,
  stateName,
}: StateAtAGlanceProps) {
  return (
    <section
      className="py-[var(--dp-section)]"
      aria-labelledby="state-glance-heading"
      data-taxonomy-section="at-a-glance"
    >
      <PageContainer>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <h2
              id="state-glance-heading"
              className="font-display text-[28px] text-dp-primary md:text-[32px]"
            >
              {stateName} at a Glance
            </h2>
            <p className="mt-3 max-w-xl font-sans text-base leading-relaxed text-dp-ink-secondary">
              Live totals from the current United States Michelin-starred
              roster for this state or district. Bib Gourmand and Green Star
              distinctions are not tracked in this atlas.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {glance.map((stat) => (
                <li key={stat.id}>
                  <TaxonomyStat model={stat} />
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7" data-taxonomy-section="star-breakdown">
            <h3 className="font-display text-[24px] text-dp-primary">
              Star-level breakdown
            </h3>
            <ul className="mt-6 grid gap-4 sm:grid-cols-3">
              {starBreakdown.map((stat) => (
                <li key={stat.id}>
                  <TaxonomyStat
                    model={stat}
                    emphasize={stat.id === "three" && stat.value > 0}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
