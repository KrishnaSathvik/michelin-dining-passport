import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getVerifiedUser } from "@/lib/auth/session";
import { Container } from "./Container";

export async function SiteHeader() {
  const user = await getVerifiedUser().catch(() => null);
  const accountHref = user ? "/account" : "/login?next=/account";
  const accountLabel = user ? "Account" : "Sign in";

  const nav = siteConfig.nav.map((item) =>
    item.href === "/account"
      ? { ...item, href: accountHref, label: accountLabel }
      : item,
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg">
      <Container className="flex min-h-16 items-center justify-between gap-4 py-3 sm:min-h-[4.5rem] sm:py-4">
        <Link
          href="/"
          className="font-display text-[1.35rem] tracking-tight text-ink no-underline sm:text-2xl"
        >
          {siteConfig.productName}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {nav.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className="font-sans text-[15px] text-ink-secondary no-underline transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/explore"
            className="rounded-[var(--radius-md)] bg-forest px-4 py-2.5 font-sans text-[15px] font-medium text-white no-underline transition-colors hover:bg-forest-deep"
          >
            Search
          </Link>
        </nav>

        <details className="relative lg:hidden">
          <summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-[var(--radius-md)] border border-border px-3 font-sans text-[15px] text-ink [&::-webkit-details-marker]:hidden">
            Menu
          </summary>
          <nav
            aria-label="Mobile primary"
            className="absolute right-0 z-20 mt-2 min-w-[16rem] rounded-[var(--radius-md)] border border-border bg-bg p-3 shadow-[var(--shadow-float)]"
          >
            <ul className="flex flex-col gap-1">
              {nav.map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <Link
                    href={item.href}
                    className="block rounded-[var(--radius-sm)] px-3 py-3 font-sans text-base text-ink no-underline hover:bg-surface-soft"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/explore"
                  className="mt-1 block rounded-[var(--radius-md)] bg-forest px-3 py-3 text-center font-sans text-base font-medium text-white no-underline hover:bg-forest-deep"
                >
                  Search
                </Link>
              </li>
            </ul>
          </nav>
        </details>
      </Container>
    </header>
  );
}
