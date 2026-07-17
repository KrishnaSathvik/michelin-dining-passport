/** Canonical primary navigation for the Stitch application shell (OD-approved IA). */
export const primaryNav = [
  { href: "/explore", label: "Explore" },
  { href: "/map", label: "Map" },
  { href: "/about-michelin-stars", label: "Michelin Stars" },
  { href: "/passport", label: "Passport" },
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
