import type { ReactNode } from "react";
import { AuthShell } from "@/components/stitch/auth/AuthShell";

/**
 * Auth route group uses Stitch AuthShell.
 * Global AppChrome suppresses AppHeader/SiteFooter on these paths.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
