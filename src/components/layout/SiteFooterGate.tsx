"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./SiteFooter";

/** Map is a full-viewport workspace — do not render the marketing footer. */
export function SiteFooterGate() {
  const pathname = usePathname();
  if (pathname === "/map" || pathname.startsWith("/map/")) {
    return null;
  }
  return <SiteFooter />;
}
