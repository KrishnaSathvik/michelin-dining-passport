import { siteConfig } from "@/config/site";

type AuthBrandPanelProps = {
  headline?: string;
  body?: string;
};

/**
 * Left atmospheric panel for desktop AuthShell.
 * Uses approved local photography + tonal overlay — not remote Stitch CDN assets.
 */
export function AuthBrandPanel({
  headline = "Keep your dining journey with you",
  body = "Sign in to sync Passport saves and visits across devices. Or continue with a device-only Passport — discovery never requires an account.",
}: AuthBrandPanelProps) {
  return (
    <aside
      className="relative hidden min-h-[100dvh] overflow-hidden bg-dp-primary-deep lg:block lg:w-[55%] xl:w-[58%]"
      aria-hidden="true"
    >
      {/* Decorative only — hidden from AT via aria-hidden on aside */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/homepage-hero.jpg')" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--dp-primary) 88%, transparent) 0%, color-mix(in srgb, var(--dp-primary-deep) 72%, transparent) 45%, color-mix(in srgb, var(--dp-primary-deep) 92%, transparent) 100%)",
        }}
      />
      <div className="relative flex h-full min-h-[100dvh] flex-col justify-end px-12 py-16 text-white xl:px-16">
        <p className="font-display text-4xl leading-tight tracking-tight xl:text-5xl">
          {siteConfig.productName}
        </p>
        <p className="mt-6 max-w-md font-display text-[28px] leading-snug text-[color-mix(in_srgb,var(--dp-star-gold)_90%,white)] xl:text-[32px]">
          {headline}
        </p>
        <p className="dp-body-md mt-4 max-w-md text-white/75">{body}</p>
      </div>
    </aside>
  );
}
