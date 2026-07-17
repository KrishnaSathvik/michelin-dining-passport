import type { ReactNode } from "react";

type MapWorkspaceShellProps = {
  children: ReactNode;
};

/**
 * Outer map workspace boundary for Phase 6.
 * Header is rendered by AppChrome; footer is suppressed on /map.
 * Height fills the viewport below the 72px Stitch header.
 */
export function MapWorkspaceShell({ children }: MapWorkspaceShellProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col h-[calc(100dvh-var(--dp-header-height))]">
      {children}
    </div>
  );
}
