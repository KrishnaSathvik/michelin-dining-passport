import {
  magicLinkAction,
  signInAction,
  signInWithGoogleAction,
} from "@/app/auth/actions";
import { SignInForm } from "@/components/stitch/auth/SignInForm";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { safeInternalPath } from "@/lib/auth/redirect";
import { isGoogleAuthEnabled, isSupabaseConfigured } from "@/lib/supabase/env";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata = buildPageMetadata({
  title: "Sign in",
  description: "Welcome back to Dining Passport.",
  path: "/login",
  noIndex: true,
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const next = safeInternalPath(
    typeof params.next === "string" ? params.next : undefined,
  );
  const verify = params.verify === "1";
  const error = typeof params.error === "string" ? params.error : null;
  const configured = isSupabaseConfigured();
  const googleEnabled = isGoogleAuthEnabled();

  const errorMessage =
    error === "callback"
      ? "That sign-in link is invalid or expired."
      : error === "config"
        ? "Authentication is not configured on this environment."
        : error === "oauth"
          ? "Google sign-in could not start."
          : error === "google-disabled"
            ? "Google sign-in is disabled."
            : null;

  const banner = !configured
    ? {
        kind: "info" as const,
        message:
          "Supabase environment variables are missing. Browsing still works; account sign-in is unavailable until they are configured.",
      }
    : verify
      ? {
          kind: "success" as const,
          message: "Check your email to confirm your account, then sign in.",
        }
      : errorMessage
        ? { kind: "error" as const, message: errorMessage }
        : null;

  return (
    <SignInForm
      next={next}
      passwordAction={signInAction}
      magicAction={magicLinkAction}
      googleAction={googleEnabled ? signInWithGoogleAction : null}
      googleEnabled={googleEnabled}
      banner={banner}
    />
  );
}
