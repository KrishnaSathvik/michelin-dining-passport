import type { ReactNode } from "react";
import { AuthShell } from "@/components/shell/AuthShell";

/**
 * Auth route group uses AuthShell scaffold.
 * Global AppChrome suppresses AppHeader/SiteFooter on these paths.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
