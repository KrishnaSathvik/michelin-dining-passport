import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Independent platform disclaimer",
  description: siteConfig.independenceDisclaimer,
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <LegalDocument
      title="Independent platform disclaimer"
      path="/disclaimer"
      eyebrow="Affiliation"
    >
      <section>
        <h2 className="font-display text-2xl text-ink">Not affiliated with Michelin</h2>
        <p className="mt-3">{siteConfig.independenceDisclaimer}</p>
        <p className="mt-3">
          Star designations originate from the Michelin Guide. Editorial
          explanations on this site are original wording for traveler clarity
          and are not official Michelin publications.
        </p>
      </section>
      <section>
        <h2 className="font-display text-2xl text-ink">Coverage limits</h2>
        <p className="mt-3">{siteConfig.coverageNote}</p>
      </section>
    </LegalDocument>
  );
}
