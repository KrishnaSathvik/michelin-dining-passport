import type { ReactNode } from "react";
import { AuthBrandPanel } from "./AuthBrandPanel";
import { AuthFormPanel } from "./AuthFormPanel";

type AuthShellProps = {
  children: ReactNode;
  headline?: string;
  body?: string;
};

/**
 * Full-viewport auth composition: atmospheric panel + focused form column.
 * Global AppChrome suppresses AppHeader/SiteFooter on auth routes.
 */
export function AuthShell({ children, headline, body }: AuthShellProps) {
  return (
    <div className="dp-canvas min-h-[100dvh]" data-auth-shell="true">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1440px]">
        <AuthBrandPanel headline={headline} body={body} />
        <AuthFormPanel>{children}</AuthFormPanel>
      </div>
    </div>
  );
}
