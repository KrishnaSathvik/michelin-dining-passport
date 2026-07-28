import type { ReactNode } from "react";

/**
 * Account stays inside the signed-in AppChrome (header + footer).
 * Page composition owns PageContainer margins.
 */
export default function AccountLayout({ children }: { children: ReactNode }) {
  return <div className="dp-canvas border-b border-dp-border">{children}</div>;
}
