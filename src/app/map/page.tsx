import Link from "next/link";
import { Container } from "@/components/layout/Container";

export const metadata = {
  title: "Map",
};

export default function MapPage() {
  return (
    <div className="border-b border-border">
      <Container className="py-14 sm:py-20">
        <p className="font-sans text-xs uppercase tracking-[0.18em] text-burgundy">
          Later phase
        </p>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
          Map experience
        </h1>
        <p className="mt-5 max-w-2xl font-sans text-base leading-relaxed text-ink-muted">
          An immersive dedicated map arrives after restaurant addresses are
          geocoded. No map provider is wired in Phase 1.
        </p>
        <p className="mt-8 font-sans text-sm">
          <Link href="/" className="text-forest underline underline-offset-4">
            Back to homepage
          </Link>
          <span className="mx-3 text-border" aria-hidden="true">
            ·
          </span>
          <Link
            href="/explore"
            className="text-forest underline underline-offset-4"
          >
            Explore restaurants
          </Link>
        </p>
      </Container>
    </div>
  );
}
