import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";

type AuthShellProps = {
  children: ReactNode;
  /** Optional aside headline override */
  headline?: string;
  body?: string;
};

/**
 * Phase 2 auth-shell scaffold for Phase 10 form redesign.
 * Global AppChrome already suppresses header/footer on auth routes.
 */
export function AuthShell({
  children,
  headline = "Keep your dining journey with you",
  body = "Sign in to sync Passport saves and visits across devices. Or continue with a device-only Passport — discovery never requires an account.",
}: AuthShellProps) {
  return (
    <div className="dp-canvas min-h-[calc(100dvh-0px)]">
      <div className="mx-auto grid min-h-[100dvh] w-full max-w-[1440px] lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-dp-primary-deep lg:block">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 30% 20%, color-mix(in srgb, var(--dp-star-gold) 28%, transparent), transparent 55%), linear-gradient(160deg, var(--dp-primary) 0%, var(--dp-primary-deep) 100%)",
            }}
            aria-hidden="true"
          />
          <div className="relative flex h-full flex-col justify-end px-12 py-16 text-white">
            <p className="dp-label-caps text-white/60">{siteConfig.productName}</p>
            <p className="mt-4 font-display text-4xl leading-tight">{headline}</p>
            <p className="dp-body-md mt-4 max-w-md text-white/75">{body}</p>
          </div>
        </aside>

        <div className="flex flex-col justify-center px-5 py-12 sm:px-10 lg:px-16">
          <p className="mb-8 font-display text-2xl text-dp-primary lg:hidden">
            {siteConfig.productName}
          </p>
          <div className="mx-auto w-full max-w-[28rem]">{children}</div>
        </div>
      </div>
    </div>
  );
}
