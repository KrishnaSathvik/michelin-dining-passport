import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { CollectionsManager } from "@/components/passport/CollectionsManager";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Collections",
  description: "Private local collections of Michelin-starred restaurants.",
  path: "/collections",
});

export default function CollectionsPage() {
  return (
    <div className="border-b border-border">
      <Container className="py-10 sm:py-14">
        <p className="font-sans text-xs uppercase tracking-[0.18em] text-burgundy">
          Personal
        </p>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
          Collections
        </h1>
        <p className="mt-4 max-w-2xl font-sans text-base text-ink-muted">
          Organize restaurants into private lists saved on this device. Public
          sharing waits for account sync.
        </p>
        <div className="mt-8">
          <CollectionsManager />
        </div>
      </Container>
    </div>
  );
}
