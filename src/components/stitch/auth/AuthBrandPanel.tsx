import { siteConfig } from "@/config/site";

type AuthBrandPanelProps = {
  headline?: string;
  body?: string;
};

const heroImageStyle = {
  backgroundImage: "url('/images/homepage-hero.jpg')",
} as const;

const overlayStyle = {
  background:
    "linear-gradient(180deg, color-mix(in srgb, var(--dp-primary) 88%, transparent) 0%, color-mix(in srgb, var(--dp-primary-deep) 72%, transparent) 45%, color-mix(in srgb, var(--dp-primary-deep) 92%, transparent) 100%)",
} as const;

/**
 * Compact atmospheric strip for tablet/mobile auth — wordmark over dining photo.
 */
export function AuthMobileBrandStrip() {
  return (
    <div
      className="relative -mx-5 mb-8 overflow-hidden sm:-mx-10 lg:hidden"
      data-auth-mobile-brand
      aria-hidden="true"
    >
      <div className="relative h-36 sm:h-44">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={heroImageStyle}
        />
        <div className="absolute inset-0" style={overlayStyle} />
        <div className="relative flex h-full items-end px-5 pb-5 sm:px-10">
          <p className="font-display text-[1.75rem] leading-none tracking-[0.08em] text-white uppercase">
            {siteConfig.wordmark}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Left atmospheric panel for desktop AuthShell.
 * Uses approved local photography + tonal overlay — not remote Stitch CDN assets.
 */
export function AuthBrandPanel({
  headline = "Keep your dining journey with you",
  body = "Sign in to sync saves and visits across devices. Or continue with device-only saves — discovery never requires an account.",
}: AuthBrandPanelProps) {
  return (
    <aside
      className="relative hidden min-h-[100dvh] overflow-hidden bg-dp-primary-deep lg:block lg:w-[55%] xl:w-[58%]"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={heroImageStyle}
      />
      <div className="absolute inset-0" style={overlayStyle} />
      <div className="relative flex h-full min-h-[100dvh] flex-col justify-end px-12 py-16 text-white xl:px-16">
        <p className="font-display text-4xl leading-tight tracking-[0.08em] uppercase xl:text-5xl">
          {siteConfig.wordmark}
        </p>
        <p className="mt-6 max-w-md font-display text-[28px] leading-snug text-[color-mix(in_srgb,var(--dp-star-gold)_90%,white)] xl:text-[32px]">
          {headline}
        </p>
        <p className="dp-body-md mt-4 max-w-md text-white/75">{body}</p>
      </div>
    </aside>
  );
}
