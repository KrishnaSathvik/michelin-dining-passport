import type { Metadata } from "next";
import Link from "next/link";
import {
  ContentPage,
  ContentRelatedLinks,
  ContentSection,
} from "@/components/stitch/content";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy",
  description:
    "What Dining Passport stores, where it is stored, and how to remove it.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy"
      intro="A plain description of what this product stores and where. It is not a legal agreement, and it does not promise more than the product actually does."
      meta="Last updated 27 July 2026"
    >
      <ContentSection heading="Browsing without an account">
        <p>
          You can browse the whole atlas without signing in. If you use a
          device-only Passport, your saves, plans, visits, ratings, and notes
          stay in your browser on that device and are not sent to us. Clearing
          site data erases them, and we cannot recover them for you.
        </p>
      </ContentSection>

      <ContentSection heading="If you create an account">
        <p>
          An account is handled by Supabase, which stores your email address, a
          hashed password, and the display name you choose. Signing in lets your
          Passport sync across devices, which means these are stored against
          your account:
        </p>
        <ul>
          <li>Which restaurants you saved, want to visit, planned, or visited</li>
          <li>Planned and visited dates, and any reservation note you add</li>
          <li>Your personal rating, private notes, and favourite dishes</li>
          <li>Collections you create and what you put in them</li>
        </ul>
        <p>
          None of this is public, and none of it affects what anyone else sees.
        </p>
      </ContentSection>

      <ContentSection heading="Google place information">
        <p>
          Some pages show photos and current place information — such as rating,
          hours, and phone number — supplied by Google through Google&rsquo;s
          Places UI Kit. When one of those surfaces loads, your browser contacts
          Google directly and Google&rsquo;s own terms and privacy policy apply
          to that request. That content remains Google&rsquo;s; we do not verify
          Google ratings and they are kept separate from Michelin distinctions
          and from your Passport.
        </p>
      </ContentSection>

      <ContentSection heading="Getting your data out, or deleting it">
        <p>
          From your <Link href="/account">Account</Link> page you can export the
          data stored against your account and request deletion of your account
          and its Passport data.
        </p>
        <p>
          A device-only Passport is removed by clearing site data in your
          browser.
        </p>
      </ContentSection>

      <ContentSection heading="Changes">
        <p>
          This page describes the product as it currently behaves. If what the
          product stores changes, this page changes with it.
        </p>
      </ContentSection>

      <ContentRelatedLinks
        links={[
          { href: "/account", label: "Account" },
          { href: "/terms", label: "Terms" },
        ]}
      />
    </ContentPage>
  );
}
