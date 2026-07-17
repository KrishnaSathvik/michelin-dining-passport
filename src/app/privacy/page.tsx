import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: `Launch-draft privacy policy for ${siteConfig.productName}.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalDocument title="Privacy Policy" path="/privacy">
      <section>
        <h2 className="font-display text-2xl text-ink">What we collect</h2>
        <p className="mt-3">
          Account email and optional display name when you sign up. Passport
          data you choose to save (saved/visited restaurants, collections, and
          private notes). Technical logs needed to operate the service (such as
          request timestamps and coarse error diagnostics).
        </p>
      </section>
      <section>
        <h2 className="font-display text-2xl text-ink">What we do not sell</h2>
        <p className="mt-3">
          We do not sell personal information. Private notes, favorite dishes,
          and reservation confirmation notes are treated as sensitive personal
          content and are excluded from analytics event payloads.
        </p>
      </section>
      <section>
        <h2 className="font-display text-2xl text-ink">Retention and export</h2>
        <p className="mt-3">
          You may export your account data from Account settings. Deletion
          requests are accepted through the same surface and processed according
          to the operational deletion workflow.
        </p>
      </section>
      <section>
        <h2 className="font-display text-2xl text-ink">Contact</h2>
        <p className="mt-3">
          For privacy questions, use the{" "}
          <a className="text-forest underline underline-offset-4" href="/corrections">
            correction / contact form
          </a>{" "}
          and mark the request as privacy-related.
        </p>
      </section>
    </LegalDocument>
  );
}
