import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getSourceMeta, getTotals } from "@/lib/data/restaurants";
import { Container } from "./Container";

export function SiteFooter() {
  const totals = getTotals();
  const source = getSourceMeta();

  return (
    <footer className="border-t border-border bg-bg-deep">
      <Container className="section-space grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="font-display text-2xl text-ink">
            {siteConfig.productName}
          </p>
          <p className="mt-4 max-w-lg font-sans text-sm leading-relaxed text-ink-muted">
            {siteConfig.independenceDisclaimer}
          </p>
          <p className="mt-3 max-w-lg font-sans text-sm leading-relaxed text-ink-muted">
            {siteConfig.coverageNote}
          </p>
          <p className="mt-3 font-sans text-sm text-ink-muted">
            {siteConfig.dataUpdatedLabel}. Roster import dated {source.importedAt}.{" "}
            {totals.restaurants} starred restaurants currently listed.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 font-sans text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-burgundy">
              Browse
            </p>
            <ul className="mt-3 space-y-2 text-ink-muted">
              <li>
                <Link href="/explore" className="hover:text-ink">
                  Explore
                </Link>
              </li>
              <li>
                <Link href="/about-michelin-stars" className="hover:text-ink">
                  Michelin Stars Explained
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-ink">
                  Map
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-burgundy">
              Policies
            </p>
            <ul className="mt-3 space-y-2 text-ink-muted">
              <li>
                <span>Privacy (placeholder)</span>
              </li>
              <li>
                <span>Terms (placeholder)</span>
              </li>
              <li>
                <span>Correction policy (placeholder)</span>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}
