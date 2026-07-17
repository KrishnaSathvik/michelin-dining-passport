import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Image and attribution policy",
  description: `Image and attribution policy for ${siteConfig.productName}.`,
  path: "/image-attribution",
});

export default function ImageAttributionPage() {
  return (
    <LegalDocument title="Image and attribution policy" path="/image-attribution">
      <section>
        <h2 className="font-display text-2xl text-ink">Current state</h2>
        <p className="mt-3">
          Launch surfaces use neutral placeholders rather than unverified
          restaurant photography. We do not scrape or republish Michelin Guide
          imagery.
        </p>
      </section>
      <section>
        <h2 className="font-display text-2xl text-ink">Future imagery</h2>
        <p className="mt-3">
          If original or licensed photography is added later, attribution and
          license terms will be recorded per asset. User-uploaded photos are out
          of scope for the initial launch.
        </p>
      </section>
    </LegalDocument>
  );
}
