"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { signOutAction } from "@/app/auth/actions";
import { PageContainer } from "@/components/stitch/PageContainer";
import { Drawer } from "@/components/stitch/Drawer";
import { siteConfig } from "@/config/site";
import {
  isNavItemActive,
  primaryNav,
} from "@/config/navigation";
import type { VerifiedUser } from "@/lib/auth/session";

type AppHeaderClientProps = {
  user: VerifiedUser | null;
  /** Optional override for visual QA / foundation demos */
  forceSignedInPreview?: boolean;
};

function initialsFromEmail(email: string | null | undefined): string {
  if (!email) return "A";
  const local = email.split("@")[0] || "A";
  return local.slice(0, 2).toUpperCase();
}

export function AppHeaderClient({
  user,
  forceSignedInPreview = false,
}: AppHeaderClientProps) {
  const pathname = usePathname();
  return (
    <AppHeaderInner
      key={pathname}
      pathname={pathname}
      user={user}
      forceSignedInPreview={forceSignedInPreview}
    />
  );
}

function AppHeaderInner({
  pathname,
  user,
  forceSignedInPreview = false,
}: AppHeaderClientProps & { pathname: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const accountTriggerRef = useRef<HTMLButtonElement>(null);
  const accountMenuId = useId();

  const signedIn = Boolean(user) || forceSignedInPreview;
  const displayUser =
    user ??
    (forceSignedInPreview
      ? {
          id: "preview",
          email: "guest@example.com",
          createdAt: null,
          providers: [],
        }
      : null);
  useEffect(() => {
    if (!accountOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
        accountTriggerRef.current?.focus();
      }
    };
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        accountTriggerRef.current?.contains(target) ||
        document.getElementById(accountMenuId)?.contains(target)
      ) {
        return;
      }
      setAccountOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [accountOpen, accountMenuId]);

  return (
    <>
      <header className="sticky top-0 z-[var(--z-header)] h-[var(--dp-header-height)] border-b border-dp-border bg-dp-surface">
        <PageContainer className="flex h-full items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-8">
            <Link
              href="/"
              className="shrink-0 font-display text-[1.35rem] leading-none tracking-tight text-dp-primary no-underline md:text-[1.5rem]"
            >
              {siteConfig.productName}
            </Link>

            <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
              {primaryNav.map((item) => {
                const active = isNavItemActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center border-b-2 px-1 font-sans text-[14px] no-underline transition-colors ${
                      active
                        ? "border-dp-primary font-semibold text-dp-primary"
                        : "border-transparent font-medium text-dp-ink-secondary hover:text-dp-primary"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/explore"
              aria-label="Search restaurants"
              className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--dp-radius-md)] text-dp-ink-secondary transition-colors hover:bg-dp-soft hover:text-dp-primary"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M20 20l-3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </Link>

            {signedIn ? (
              <div className="relative hidden sm:block">
                <button
                  ref={accountTriggerRef}
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  aria-controls={accountMenuId}
                  onClick={() => setAccountOpen((open) => !open)}
                  className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-[var(--dp-radius-md)] px-2 text-dp-ink-secondary transition-colors hover:bg-dp-soft hover:text-dp-primary"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-dp-soft font-sans text-xs font-semibold text-dp-primary"
                    aria-hidden="true"
                  >
                    {initialsFromEmail(displayUser?.email)}
                  </span>
                  <span className="sr-only">Account menu</span>
                </button>
                {accountOpen ? (
                  <div
                    id={accountMenuId}
                    role="menu"
                    className="absolute right-0 z-[var(--z-header)] mt-2 min-w-[12rem] rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface py-2 shadow-[var(--dp-shadow-drawer)]"
                  >
                    <Link
                      role="menuitem"
                      href="/account"
                      className="block px-4 py-2.5 font-sans text-sm text-dp-ink no-underline hover:bg-dp-soft"
                      onClick={() => setAccountOpen(false)}
                    >
                      Account
                    </Link>
                    <Link
                      role="menuitem"
                      href="/passport"
                      className="block px-4 py-2.5 font-sans text-sm text-dp-ink no-underline hover:bg-dp-soft"
                      onClick={() => setAccountOpen(false)}
                    >
                      Passport
                    </Link>
                    {!forceSignedInPreview ? (
                      <form action={signOutAction}>
                        <button
                          role="menuitem"
                          type="submit"
                          className="block w-full px-4 py-2.5 text-left font-sans text-sm text-dp-ink hover:bg-dp-soft"
                        >
                          Sign out
                        </button>
                      </form>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                href="/login?next=/account"
                className="hidden min-h-11 items-center rounded-[var(--dp-radius-md)] px-3 font-sans text-[14px] font-medium text-dp-primary no-underline hover:bg-dp-soft sm:inline-flex"
              >
                Sign in
              </Link>
            )}

            <button
              ref={menuTriggerRef}
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--dp-radius-md)] text-dp-ink-secondary transition-colors hover:bg-dp-soft hover:text-dp-primary lg:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </PageContainer>
      </header>

      <Drawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Menu"
        returnFocusRef={menuTriggerRef}
      >
        <nav id="mobile-navigation" aria-label="Mobile primary">
          <ul className="flex flex-col gap-1">
            {primaryNav.map((item) => {
              const active = isNavItemActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 items-center rounded-[var(--dp-radius-md)] px-3 font-sans text-base no-underline ${
                      active
                        ? "bg-dp-soft font-semibold text-dp-primary"
                        : "text-dp-ink hover:bg-dp-soft"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/explore"
                className="flex min-h-11 items-center rounded-[var(--dp-radius-md)] px-3 font-sans text-base text-dp-ink no-underline hover:bg-dp-soft"
                onClick={() => setMenuOpen(false)}
              >
                Search
              </Link>
            </li>
            <li>
              {signedIn ? (
                <Link
                  href="/account"
                  className="flex min-h-11 items-center rounded-[var(--dp-radius-md)] px-3 font-sans text-base text-dp-ink no-underline hover:bg-dp-soft"
                  onClick={() => setMenuOpen(false)}
                >
                  Account
                </Link>
              ) : (
                <Link
                  href="/login?next=/account"
                  className="flex min-h-11 items-center rounded-[var(--dp-radius-md)] px-3 font-sans text-base text-dp-ink no-underline hover:bg-dp-soft"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </Drawer>
    </>
  );
}
