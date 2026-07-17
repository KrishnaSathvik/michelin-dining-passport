import Link from "next/link";
import {
  magicLinkAction,
  signInAction,
  signInWithGoogleAction,
} from "@/app/auth/actions";
import { LoginAuthPanel } from "@/components/auth/AuthForm";
import { safeInternalPath } from "@/lib/auth/redirect";
import { isGoogleAuthEnabled, isSupabaseConfigured } from "@/lib/supabase/env";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

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

  return (
    <div className="flex flex-col gap-6">
      {!configured ? (
        <p className="mx-auto w-full max-w-[28rem] rounded-[var(--radius-md)] border border-border px-4 py-3 font-sans text-sm text-ink-muted">
          Supabase environment variables are missing. Browsing still works;
          account sign-in is unavailable until they are configured.
        </p>
      ) : null}

      {verify ? (
        <p className="mx-auto w-full max-w-[28rem] rounded-[var(--radius-md)] border border-border px-4 py-3 font-sans text-sm text-forest">
          Check your email to confirm your account, then sign in.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mx-auto w-full max-w-[28rem] rounded-[var(--radius-md)] border border-border px-4 py-3 font-sans text-sm text-burgundy">
          {errorMessage}
        </p>
      ) : null}

      <LoginAuthPanel
        next={next}
        passwordAction={signInAction}
        magicAction={magicLinkAction}
        googleAction={googleEnabled ? signInWithGoogleAction : null}
        googleEnabled={googleEnabled}
      />

      <p className="mx-auto max-w-[28rem] text-center font-sans text-sm text-ink-muted">
        New here?{" "}
        <Link
          href={`/signup?next=${encodeURIComponent(next)}`}
          className="text-forest underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
