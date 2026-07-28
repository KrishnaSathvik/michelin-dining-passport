import { PageContainer } from "@/components/stitch/PageContainer";
import type { EducationPageViewModel } from "./models";

type MichelinPrimerProps = {
  primer: EducationPageViewModel["primer"];
};

export function MichelinPrimer({ primer }: MichelinPrimerProps) {
  return (
    <section
      className="py-[var(--dp-section)]"
      aria-labelledby="primer-heading"
      data-education-section="primer"
    >
      <PageContainer>
        <div className="mx-auto max-w-3xl">
          <h2
            id="primer-heading"
            className="font-display text-[28px] text-dp-primary md:text-[34px]"
          >
            {primer.heading}
          </h2>
          <div className="mt-6 space-y-5">
            {primer.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className={`font-sans leading-relaxed text-dp-ink-secondary ${
                  index === 0
                    ? "text-lg text-dp-ink md:text-xl"
                    : "text-base md:text-[17px]"
                }`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
