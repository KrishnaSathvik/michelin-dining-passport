import { Container } from "@/components/layout/Container";
import { siteConfig } from "@/config/site";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border bg-bg">
      <Container className="py-10 sm:py-16">
        <div className="grid items-stretch gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-14">
          <aside className="hidden flex-col justify-center rounded-[var(--radius-lg)] bg-forest px-8 py-12 text-white lg:flex">
            <p className="font-sans text-xs uppercase tracking-[0.18em] text-white/60">
              {siteConfig.productName}
            </p>
            <p className="mt-4 font-display text-4xl leading-tight">
              Keep your Michelin journey synced across devices
            </p>
            <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-white/75">
              Sign in to sync Passport saves and visits. Or continue with a
              device-only Passport — discovery never requires an account.
            </p>
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </Container>
    </div>
  );
}
