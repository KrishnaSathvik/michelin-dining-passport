import Link from "next/link";
import { PageContainer } from "@/components/stitch/PageContainer";
import type { RelatedCuisineLink } from "./aggregations";

type RelatedCuisinesProps = {
  cuisines: RelatedCuisineLink[];
};

export function RelatedCuisines({ cuisines }: RelatedCuisinesProps) {
  if (cuisines.length === 0) return null;

  return (
    <section
      className="border-t border-dp-border py-[var(--dp-section)]"
      aria-labelledby="related-cuisines-heading"
      data-taxonomy-section="related-cuisines"
    >
      <PageContainer>
        <h2
          id="related-cuisines-heading"
          className="font-display text-[24px] text-dp-primary"
        >
          Related Cuisines
        </h2>
        <ul className="mt-6 flex flex-wrap gap-3">
          {cuisines.map((item) => (
            <li key={item.cuisineSlug}>
              <Link
                href={`/cuisines/${item.cuisineSlug}`}
                className="inline-flex min-h-11 items-center rounded-[var(--dp-radius-md)] border border-dp-border bg-dp-surface px-4 font-sans text-sm text-dp-ink no-underline hover:border-dp-primary hover:text-dp-primary"
              >
                {item.cuisine}
              </Link>
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
