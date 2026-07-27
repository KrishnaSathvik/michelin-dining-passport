import type { Metadata } from "next";
import Link from "next/link";
import {
  ContentPage,
  ContentRelatedLinks,
  ContentSection,
} from "@/components/stitch/content";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "About",
  description:
    "What Dining Passport is, what it is not, and how it relates to the Michelin Guide.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <ContentPage
      title="About Dining Passport"
      intro={siteConfig.footerDescription}
      purpose="Browse. Plan. Remember — independently."
    >
      <ContentSection heading="What this is">
        <p>
          Dining Passport is an independent way to browse Michelin-starred
          restaurants in the United States, plan the meals you want, and keep a
          private record of the ones you have already had.
        </p>
        <p>
          Browsing never requires an account. You can keep a Passport on the
          device you are using, and create an account later if you want the same
          Passport on more than one device.
        </p>
      </ContentSection>

      <ContentSection heading="What this is not">
        <p>
          {siteConfig.independenceDisclaimer} We do not award, review, or
          influence Michelin distinctions, and we are not a reservation service
          — booking links point to whatever service the restaurant itself uses.
        </p>
        <p>
          Michelin does not currently inspect every U.S. state. A region missing
          from this atlas has not necessarily been reviewed and found without
          stars.
        </p>
      </ContentSection>

      <ContentSection heading="Where the information comes from">
        <p>
          Restaurant listings, star levels, and location details are compiled
          from publicly available Michelin Guide listings. Some pages also show
          current place information from Google. The{" "}
          <Link href="/sources">Sources</Link> page explains each of these in
          more detail.
        </p>
        <p>
          If something here looks wrong or out of date,{" "}
          <Link href="/contact">Contact</Link> explains where that kind of
          question belongs.
        </p>
      </ContentSection>

      <ContentSection heading="Your Passport is private">
        <p>
          Saves, plans, visits, ratings, and notes are yours. They are never
          shown publicly and are not part of any ranking.{" "}
          <Link href="/privacy">Privacy</Link> describes what is stored and
          where.
        </p>
      </ContentSection>

      <ContentRelatedLinks
        links={[
          { href: "/sources", label: "Sources" },
          { href: "/privacy", label: "Privacy" },
          { href: "/contact", label: "Contact" },
        ]}
      />
    </ContentPage>
  );
}
