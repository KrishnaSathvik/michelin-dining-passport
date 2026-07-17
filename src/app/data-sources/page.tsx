import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Data Sources",
  description: `How ${siteConfig.productName} sources restaurant roster data.`,
  path: "/data-sources",
});

export default function DataSourcesPage() {
  return (
    <LegalDocument title="Data Sources" path="/data-sources" eyebrow="Transparency">
      <section>
        <h2 className="font-display text-2xl text-ink">Primary roster</h2>
        <p className="mt-3">
          Restaurant names, star counts, cuisine labels, addresses, and Michelin
          Guide URLs are imported from a curated workbook snapshot of U.S.
          Michelin-starred restaurants. Bib Gourmand and Selected restaurants
          are excluded from the current atlas.
        </p>
      </section>
      <section>
        <h2 className="font-display text-2xl text-ink">Enrichment</h2>
        <p className="mt-3">
          Coordinates are batch-geocoded offline and manually reviewed when
          needed. Reservation links are discovered and verified offline; only
          reviewed links are shown as direct booking actions.
        </p>
      </section>
      <section>
        <h2 className="font-display text-2xl text-ink">Updates</h2>
        <p className="mt-3">
          Roster changes are applied through developer-run diff and apply
          scripts. Absent restaurants are labeled for review and are not
          automatically marked permanently closed.
        </p>
      </section>
    </LegalDocument>
  );
}
