import type { Metadata } from "next";
import Link from "next/link";
import {
  ContentCallout,
  ContentPage,
  ContentRelatedLinks,
  ContentSection,
} from "@/components/stitch/content";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Sources",
  description:
    "Where the restaurant information on Dining Passport comes from, and how current it is.",
  path: "/sources",
});

export default function SourcesPage() {
  return (
    <ContentPage
      title="Sources"
      intro="Where the information on this site comes from, and how far you should trust each part of it."
    >
      <ContentCallout title="How current this is">
        <p>{siteConfig.dataUpdatedLabel}.</p>
        <p className="mt-2">{siteConfig.coverageNote}</p>
      </ContentCallout>

      <ContentSection heading="Restaurant listings and star levels">
        <p>
          Which restaurants appear here, and how many stars each holds, is
          compiled from publicly available Michelin Guide listings for the United
          States. Every restaurant page links back to its Michelin Guide entry,
          which is the authority if the two ever disagree.
        </p>
      </ContentSection>

      <ContentSection heading="Cities, states, and map locations">
        <p>
          Addresses come from the same listings. Map coordinates are derived from
          those addresses, so a pin can sit slightly off the true entrance —
          particularly for restaurants inside hotels, malls, or multi-tenant
          buildings. Use the address, not the pin, to find the door.
        </p>
      </ContentSection>

      <ContentSection heading="Booking links">
        <p>
          Where a restaurant publishes a reservation page, we link to it
          directly. We are not a reservation service and do not see, hold, or
          confirm any booking. Availability shown by those services is theirs,
          not ours.
        </p>
      </ContentSection>

      <ContentSection heading="Google place information">
        <p>{siteConfig.googlePlacesDisclaimer}</p>
        <p>
          Google ratings are kept visually and conceptually separate from
          Michelin distinctions, and from anything in your private Passport.
        </p>
      </ContentSection>

      <ContentSection heading="Keeping information current">
        <p>
          Listings are refreshed periodically rather than continuously, so
          recently awarded, relocated, or closed restaurants can lag. Confirm
          anything time-sensitive with the restaurant.{" "}
          <Link href="/contact">Contact</Link> explains how corrections are
          handled.
        </p>
      </ContentSection>

      <ContentSection heading="Independence">
        <p>{siteConfig.independenceDisclaimer}</p>
      </ContentSection>

      <ContentRelatedLinks
        links={[
          { href: "/about", label: "About" },
          { href: "/contact", label: "Contact" },
        ]}
      />
    </ContentPage>
  );
}
