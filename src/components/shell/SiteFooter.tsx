import Link from "next/link";
import { PageContainer } from "@/components/stitch/PageContainer";
import { primaryNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { getSourceMeta, getTotals } from "@/lib/data/restaurants";

/**
 * Stitch SiteFooter — restrained editorial footer.
 * Privacy/Terms pages are not yet product routes; legal copy lives in the disclaimer.
 */
export function SiteFooter() {
  const totals = getTotals();
  const source = getSourceMeta();

  return (
    <footer className="border-t border-dp-border bg-dp-soft">
      <PageContainer className="py-12 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <p className="font-display text-2xl text-dp-primary">
              {siteConfig.productName}
            </p>
            <p className="dp-meta mt-3 text-dp-ink-secondary">
              {siteConfig.tagline}
            </p>
            <p className="dp-meta mt-4 text-dp-ink-muted">
              Independent discovery platform. Not affiliated with the Michelin
              Guide.
            </p>
            <p className="dp-meta mt-2 text-dp-ink-muted">
              {siteConfig.dataUpdatedLabel}. {totals.restaurants} starred
              restaurants listed · roster {source.importedAt}.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="dp-meta min-h-11 inline-flex items-center font-medium text-dp-ink-secondary no-underline hover:text-dp-primary"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/account"
              className="dp-meta inline-flex min-h-11 items-center font-medium text-dp-ink-secondary no-underline hover:text-dp-primary"
            >
              Account
            </Link>
          </nav>
        </div>

        <p className="dp-meta mt-10 border-t border-dp-border pt-6 text-dp-ink-muted">
          {siteConfig.independenceDisclaimer} {siteConfig.coverageNote}
        </p>
      </PageContainer>
    </footer>
  );
}
