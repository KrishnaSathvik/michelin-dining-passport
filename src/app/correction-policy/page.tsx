import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Correction Policy",
  description: `How to request corrections on ${siteConfig.productName}.`,
  path: "/correction-policy",
});

export default function CorrectionPolicyPage() {
  return (
    <LegalDocument title="Correction Policy" path="/correction-policy">
      <section>
        <h2 className="font-display text-2xl text-ink">What you can report</h2>
        <p className="mt-3">
          Incorrect addresses, star counts, closed or renamed restaurants,
          broken websites, incorrect reservation links, and coordinate errors.
        </p>
      </section>
      <section>
        <h2 className="font-display text-2xl text-ink">How review works</h2>
        <p className="mt-3">
          Submissions are stored for developer review. There is no public
          admin dashboard in the launch scope. High-confidence corrections are
          applied through the versioned data-update workflow.
        </p>
      </section>
      <section>
        <h2 className="font-display text-2xl text-ink">Submit a correction</h2>
        <p className="mt-3">
          Use the{" "}
          <Link
            href="/corrections"
            className="text-forest underline underline-offset-4"
          >
            public correction form
          </Link>
          .
        </p>
      </section>
    </LegalDocument>
  );
}
