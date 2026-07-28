/** Canonical primary navigation for the Stitch application shell (OD-approved IA). */
export const primaryNav = [
  { href: "/explore", label: "Explore" },
  { href: "/map", label: "Map" },
  { href: "/about-michelin-stars", label: "Michelin Stars" },
  { href: "/passport", label: "My Restaurants" },
] as const;

/**
 * Footer links. Deliberately disjoint from `primaryNav` — the footer explains
 * the product, it does not repeat the header.
 */
export const footerNav = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
  { href: "/sources", label: "Sources" },
] as const;

export const AUTH_PATH_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
] as const;

export function isAuthPath(pathname: string): boolean {
  return AUTH_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isMapPath(pathname: string): boolean {
  return pathname === "/map" || pathname.startsWith("/map/");
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
