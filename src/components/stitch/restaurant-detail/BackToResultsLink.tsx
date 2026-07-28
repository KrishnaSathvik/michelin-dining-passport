"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

/**
 * Only same-origin Explore/Map paths are accepted, so a crafted `returnTo`
 * cannot turn this into an open redirect.
 */
export function safeReturnTo(value: string | null): string | null {
  if (!value?.startsWith("/") || value.startsWith("//")) return null;
  try {
    const parsed = new URL(value, "https://dining-passport.local");
    if (
      parsed.origin !== "https://dining-passport.local" ||
      (parsed.pathname !== "/explore" && parsed.pathname !== "/map")
    ) {
      return null;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

/**
 * Read on the client so the restaurant route stays statically generated —
 * that is what makes an unknown slug return a real 404 (see page.tsx).
 */
export function BackToResultsLink() {
  const href = safeReturnTo(useSearchParams().get("returnTo"));
  if (!href) return null;

  return (
    <Link
      href={href}
      className="mt-5 inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-primary no-underline hover:underline"
    >
      ← Back to results
    </Link>
  );
}
