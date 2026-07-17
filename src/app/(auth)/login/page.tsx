import Link from "next/link";
import {
  magicLinkAction,
  signInAction,
  signInWithGoogleAction,
} from "@/app/auth/actions";
import { AuthForm, AuthLinks } from "@/components/auth/AuthForm";
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
    <div className="flex flex-col gap-8">
      {!configured ? (
        <p className="border border-border px-4 py-3 font-sans text-sm text-ink-muted">
          Supabase environment variables are missing. Browsing still works;
          account sign-in is unavailable until they are configured.
        </p>
      ) : null}

      {verify ? (
        <p className="border border-border px-4 py-3 font-sans text-sm text-forest">
          Check your email to confirm your account, then sign in.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="border border-border px-4 py-3 font-sans text-sm text-burgundy">
          {errorMessage}
        </p>
      ) : null}

      <AuthForm
        title="Sign in"
        description="Access your cloud Passport and sync device saves after you authenticate."
        action={signInAction}
        next={next}
        submitLabel="Sign in"
        fields={[
          {
            name: "email",
            label: "Email",
            type: "email",
            required: true,
            autoComplete: "email",
          },
          {
            name: "password",
            label: "Password",
            type: "password",
            required: true,
            autoComplete: "current-password",
          },
        ]}
        footer={<AuthLinks next={next} />}
      />

      <AuthForm
        title="Magic link"
        description="Passwordless sign-in via email."
        action={magicLinkAction}
        next={next}
        submitLabel="Email me a link"
        fields={[
          {
            name: "email",
            label: "Email",
            type: "email",
            required: true,
            autoComplete: "email",
          },
        ]}
      />

      {googleEnabled ? (
        <form action={signInWithGoogleAction} className="mx-auto w-full max-w-md">
          <input type="hidden" name="next" value={next} />
          <button
            type="submit"
            className="w-full border border-border px-4 py-2.5 font-sans text-sm text-ink"
          >
            Continue with Google
          </button>
        </form>
      ) : null}

      <p className="mx-auto max-w-md font-sans text-sm text-ink-muted">
        Prefer device-only saving?{" "}
        <Link href="/passport" className="text-forest underline-offset-4 hover:underline">
          Continue to Passport
        </Link>
      </p>
    </div>
  );
}
