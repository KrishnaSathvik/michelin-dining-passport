import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Container } from "./Container";

export function SiteHeader() {
  return (
    <header className="border-b border-border/80 bg-bg/80 backdrop-blur-[2px]">
      <Container className="flex items-center justify-between gap-4 py-4 sm:py-5">
        <Link
          href="/"
          className="font-display text-xl tracking-tight text-ink sm:text-2xl"
        >
          {siteConfig.productName}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-sans text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/explore"
            className="font-sans text-sm text-forest underline decoration-border underline-offset-4 hover:decoration-forest"
          >
            Search
          </Link>
        </nav>

        <details className="relative lg:hidden">
          <summary className="cursor-pointer list-none border border-border px-3 py-2 font-sans text-sm text-ink [&::-webkit-details-marker]:hidden">
            Menu
          </summary>
          <nav
            aria-label="Mobile primary"
            className="absolute right-0 z-20 mt-2 min-w-[14rem] border border-border bg-bg-elevated p-3 shadow-sm"
          >
            <ul className="flex flex-col gap-2">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-2 py-2 font-sans text-sm text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/explore"
                  className="block px-2 py-2 font-sans text-sm text-forest"
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
