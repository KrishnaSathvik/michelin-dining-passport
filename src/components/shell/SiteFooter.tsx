import Link from "next/link";
import { PageContainer } from "@/components/stitch/PageContainer";
import { footerNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";

/**
 * Stitch SiteFooter — product identity, supporting links, one disclaimer.
 *
 * Deliberately does NOT repeat primary navigation, dataset/roster counts,
 * ingestion terminology, or a second copy of the independence disclaimer.
 * Those belong to the header, and to /about and /sources respectively.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-dp-border bg-dp-soft">
      <PageContainer className="py-12 md:py-16">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-10">
          <div className="max-w-md">
            <p className="font-display text-2xl tracking-[0.08em] text-dp-primary uppercase">
              {siteConfig.wordmark}
            </p>
            <p className="dp-meta mt-3 text-dp-ink-secondary">
              {siteConfig.footerDescription}
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-6 gap-y-1 md:justify-end"
          >
            {footerNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="dp-meta inline-flex min-h-11 items-center font-medium text-dp-ink-secondary no-underline hover:text-dp-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="dp-meta mt-10 border-t border-dp-border pt-6 text-dp-ink-muted">
          {siteConfig.footerDisclaimer}
        </p>
      </PageContainer>
    </footer>
  );
}
