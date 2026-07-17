import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getSourceMeta, getTotals } from "@/lib/data/restaurants";
import { Container } from "./Container";

export function SiteFooter() {
  const totals = getTotals();
  const source = getSourceMeta();

  return (
    <footer className="border-t border-border bg-surface-soft">
      <Container className="section-space grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="font-display text-2xl text-ink sm:text-3xl">
            {siteConfig.productName}
          </p>
          <p className="mt-4 max-w-lg font-sans text-base leading-relaxed text-ink-secondary">
            {siteConfig.independenceDisclaimer}
          </p>
          <p className="mt-3 max-w-lg font-sans text-base leading-relaxed text-ink-muted">
            {siteConfig.coverageNote}
          </p>
          <p className="mt-3 max-w-lg font-sans text-sm leading-relaxed text-ink-muted">
            {siteConfig.googlePlacesDisclaimer}
          </p>
          <p className="mt-3 font-sans text-sm text-ink-muted">
            {siteConfig.dataUpdatedLabel}. Roster import dated {source.importedAt}.{" "}
            {totals.restaurants} starred restaurants currently listed.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 font-sans text-base">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">
              Browse
            </p>
            <ul className="mt-3 space-y-2.5 text-ink-secondary">
              <li>
                <Link href="/explore" className="no-underline hover:text-ink">
                  Explore
                </Link>
              </li>
              <li>
                <Link
                  href="/about-michelin-stars"
                  className="no-underline hover:text-ink"
                >
                  Michelin Stars Explained
                </Link>
              </li>
              <li>
                <Link href="/map" className="no-underline hover:text-ink">
                  Map
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">
              Account
            </p>
            <ul className="mt-3 space-y-2.5 text-ink-secondary">
              <li>
                <Link href="/passport" className="no-underline hover:text-ink">
                  Passport
                </Link>
              </li>
              <li>
                <Link href="/account" className="no-underline hover:text-ink">
                  Account
                </Link>
              </li>
              <li>
                <Link href="/login" className="no-underline hover:text-ink">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}
