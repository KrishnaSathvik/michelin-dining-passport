import type { Metadata } from "next";
import Link from "next/link";
import {
  ContentCallout,
  ContentPage,
  ContentRelatedLinks,
  ContentSection,
} from "@/components/stitch/content";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact",
  description:
    "How corrections, data questions, and official Michelin Guide matters are handled.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <ContentPage
      title="Contact"
      intro="Dining Passport is an independent project. Use this page to see where different kinds of questions belong."
    >
      <ContentCallout title="No public inbox yet">
        <p>
          There is no public contact address yet. A channel will appear on this
          page when one exists — we will not invent an email or form in the
          meantime.
        </p>
      </ContentCallout>

      <ContentSection heading="Corrections to a listing">
        <p>
          If a restaurant&rsquo;s star level, address, cuisine, or closure status
          looks wrong here, the Michelin Guide listing is the authority. Every
          restaurant page links to its Michelin Guide entry; if the two disagree,
          trust the Guide.
        </p>
        <p>
          There is no in-app correction channel yet. When one exists, it will be
          published here.
        </p>
      </ContentSection>

      <ContentSection heading="Official Michelin Guide matters">
        <p>
          We cannot help with anything official: award decisions, inspections,
          appeals, press, or listing requests. Dining Passport is not affiliated
          with the Michelin Guide and has no influence over any of it. Contact
          the Michelin Guide directly.
        </p>
      </ContentSection>

      <ContentSection heading="Reservations">
        <p>
          We do not take, hold, or modify bookings. Booking links point to
          whichever service the restaurant uses, and any reservation you make
          lives with that service and the restaurant — not with us.
        </p>
      </ContentSection>

      <ContentSection heading="Your account and your data">
        <p>
          Exporting or deleting the data stored against your account does not
          need us: both are available from your{" "}
          <Link href="/account">Account</Link> page.{" "}
          <Link href="/privacy">Privacy</Link> describes what is stored.
        </p>
      </ContentSection>

      <ContentRelatedLinks
        links={[
          { href: "/sources", label: "Sources" },
          { href: "/privacy", label: "Privacy" },
        ]}
      />
    </ContentPage>
  );
}
