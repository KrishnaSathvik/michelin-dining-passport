import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PassportHome } from "@/components/passport/PassportHome";
import { getRestaurants } from "@/lib/data/restaurants";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Passport",
  description:
    "Track Michelin-starred restaurants you have saved and visited. Data stays on this device until accounts arrive.",
  path: "/passport",
});

export default function PassportPage() {
  const restaurants = getRestaurants();
  return (
    <div className="border-b border-border">
      <Container className="py-10 sm:py-14">
        <p className="font-sans text-xs uppercase tracking-[0.18em] text-burgundy">
          Personal
        </p>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
          Your dining passport
        </h1>
        <p className="mt-4 max-w-2xl font-sans text-base text-ink-muted">
          Track saves, visits, and collections locally. Cloud sync arrives with
          accounts later.
        </p>
        <div className="mt-8">
          <PassportHome restaurants={restaurants} />
        </div>
      </Container>
    </div>
  );
}
