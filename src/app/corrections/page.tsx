import type { Metadata } from "next";
import { CorrectionForm } from "@/components/legal/CorrectionForm";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Submit a correction",
  description: `Request a restaurant data correction on ${siteConfig.productName}.`,
  path: "/corrections",
});

export default function CorrectionsPage() {
  return (
    <LegalDocument title="Submit a correction" path="/corrections" eyebrow="Feedback">
      <section>
        <p>
          Tell us about an incorrect restaurant detail. Submissions are stored
          for developer review. There is no public admin queue in the launch
          release.
        </p>
      </section>
      <CorrectionForm />
    </LegalDocument>
  );
}
