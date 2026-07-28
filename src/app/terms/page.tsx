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
  title: "Terms",
  description: "The terms that apply to using Orellin.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <ContentPage
      title="Terms"
      intro="Short, plain terms for using this site. They describe how the product is offered — they do not create guarantees about restaurants, availability, or accuracy."
      meta="Last updated 27 July 2026"
    >
      <ContentSection heading="Using the site">
        <p>
          You may browse the atlas and keep My Restaurants for your own personal,
          non-commercial use. Please do not scrape the site in bulk, attempt to
          disrupt it, or use it to misrepresent the Michelin Guide.
        </p>
      </ContentSection>

      <ContentSection heading="Accuracy">
        <p>
          Restaurant details change constantly. Star levels, addresses, cuisines,
          opening hours, and booking links may be out of date or wrong. Confirm
          anything that matters — especially reservations and travel plans —
          directly with the restaurant before you rely on it.
        </p>
        <p>
          The site is provided as-is. We do not warrant that it will be
          available, complete, or error-free.
        </p>
      </ContentSection>

      <ContentSection heading="Your account and your content">
        <p>
          You are responsible for keeping your sign-in details secure and for
          what you store in My Restaurants. You keep ownership of your notes,
          ratings, and collections; we store them so we can show them back to
          you, as described in <Link href="/privacy">Privacy</Link>.
        </p>
        <p>
          We may suspend an account that is being used to attack or abuse the
          service.
        </p>
      </ContentSection>

      <ContentSection heading="Third-party content and trademarks">
        <p>
          {siteConfig.independenceDisclaimer} Michelin, the Michelin Guide, and
          related marks belong to their owners, and are referred to here only to
          describe which restaurants hold which distinctions. Place information
          supplied by Google remains subject to Google&rsquo;s terms. See{" "}
          <Link href="/sources">Sources</Link>.
        </p>
      </ContentSection>

      <ContentSection heading="Changes">
        <p>
          These terms may change as the product changes. Continuing to use the
          site after a change means the updated terms apply.
        </p>
      </ContentSection>

      <ContentRelatedLinks
        links={[
          { href: "/privacy", label: "Privacy" },
          { href: "/sources", label: "Sources" },
        ]}
      />
    </ContentPage>
  );
}
