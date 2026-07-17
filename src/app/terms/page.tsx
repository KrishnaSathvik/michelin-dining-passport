import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Use",
  description: `Launch-draft terms of use for ${siteConfig.productName}.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalDocument title="Terms of Use" path="/terms">
      <section>
        <h2 className="font-display text-2xl text-ink">Service description</h2>
        <p className="mt-3">
          {siteConfig.productName} provides an independent atlas of
          Michelin-starred restaurants in the United States and optional
          personal passport tracking. It is offered as-is for informational and
          personal use.
        </p>
      </section>
      <section>
        <h2 className="font-display text-2xl text-ink">Accounts</h2>
        <p className="mt-3">
          You are responsible for safeguarding your credentials and for content
          you store in private notes. Do not upload unlawful or abusive content.
        </p>
      </section>
      <section>
        <h2 className="font-display text-2xl text-ink">No booking agency</h2>
        <p className="mt-3">
          Reservation links open third-party providers. We do not process
          bookings, payments, or table confirmations inside this application.
        </p>
      </section>
      <section>
        <h2 className="font-display text-2xl text-ink">Availability</h2>
        <p className="mt-3">
          Public discovery is designed to keep working from the committed local
          dataset even when cloud services are unavailable. Personal cloud sync
          may be interrupted during outages.
        </p>
      </section>
    </LegalDocument>
  );
}
