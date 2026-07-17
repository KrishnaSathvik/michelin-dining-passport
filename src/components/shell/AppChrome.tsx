"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { isAuthPath, isMapPath } from "@/config/navigation";
import { AppHeaderClient } from "./AppHeaderClient";
import { SkipLink } from "./SkipLink";
import type { VerifiedUser } from "@/lib/auth/session";

type AppChromeProps = {
  user: VerifiedUser | null;
  footer: ReactNode;
  children: ReactNode;
};

/**
 * Route-aware Stitch chrome:
 * - Auth routes: no global header/footer (AuthShell owns identity)
 * - Map: header only (no footer, no reserved footer space)
 * - All other routes: header + footer
 */
export function AppChrome({ user, footer, children }: AppChromeProps) {
  const pathname = usePathname();
  const auth = isAuthPath(pathname);
  const map = isMapPath(pathname);

  return (
    <>
      <SkipLink />
      {!auth ? <AppHeaderClient user={user} /> : null}
      <main
        id="main-content"
        className={map ? "flex min-h-0 flex-1 flex-col" : "flex-1"}
        tabIndex={-1}
      >
        {children}
      </main>
      {!auth && !map ? footer : null}
    </>
  );
}
