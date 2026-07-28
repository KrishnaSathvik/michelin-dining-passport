"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { AuthActionState } from "@/app/auth/actions";
import { Button } from "@/components/stitch/Button";
import { AuthDivider } from "./AuthDivider";
import { AuthErrorState } from "./AuthErrorState";
import { DevicePassportNotice } from "./DevicePassportNotice";
import { MagicLinkForm } from "./MagicLinkForm";
import { PasswordField } from "./PasswordField";
import { AuthTextField } from "./AuthTextField";

const initialState: AuthActionState = { ok: false, message: "" };

type SignInFormProps = {
  next: string;
  passwordAction: (
    prev: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  magicAction: (
    prev: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  googleAction?: ((formData: FormData) => void | Promise<void>) | null;
  googleEnabled: boolean;
  banner?: { kind: "success" | "error" | "info"; message: string } | null;
};

export function SignInForm({
  next,
  passwordAction,
  magicAction,
  googleAction,
  googleEnabled,
  banner = null,
}: SignInFormProps) {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [state, formAction, pending] = useActionState(
    passwordAction,
    initialState,
  );
  const q = `?next=${encodeURIComponent(next)}`;
  const fieldErrors = state.fieldErrors ?? {};

  if (mode === "magic") {
    return (
      <div className="flex flex-col gap-8">
        <MagicLinkForm
          action={magicAction}
          next={next}
          onBack={() => setMode("password")}
        />
        <DevicePassportNotice />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8" data-auth-form="sign-in">
      <header className="space-y-3">
        <p className="dp-label-caps text-dp-ink-muted">Sign in</p>
        <h1 className="dp-headline-md text-dp-primary-deep">Welcome back</h1>
        <p className="font-sans text-[16px] leading-relaxed text-dp-ink-secondary">
          Sync your restaurants across devices — or keep browsing without an
          account.
        </p>
      </header>

      {banner ? (
        <p
          role="status"
          className={`rounded-[var(--dp-radius-md)] border px-4 py-3 font-sans text-[14px] ${
            banner.kind === "error"
              ? "border-dp-error/30 text-dp-error"
              : banner.kind === "success"
                ? "border-dp-primary/20 text-dp-primary"
                : "border-dp-border text-dp-ink-muted"
          }`}
        >
          {banner.message}
        </p>
      ) : null}

      {/* noValidate: action-supplied field errors replace browser bubbles. */}
      <form action={formAction} noValidate className="flex flex-col gap-5">
        <input type="hidden" name="next" value={next} />
        <AuthTextField
          name="email"
          label="Email address"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          error={fieldErrors.email}
        />
        <PasswordField
          name="password"
          label="Password"
          required
          autoComplete="current-password"
          error={fieldErrors.password}
          labelEnd={
            <Link
              href={`/forgot-password${q}`}
              className="font-sans text-[13px] normal-case tracking-normal text-dp-ink-secondary underline-offset-4 hover:text-dp-primary hover:underline"
            >
              Forgot password?
            </Link>
          }
        />

        {state.message ? <AuthErrorState message={state.message} /> : null}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={pending}
          data-auth-pending={pending ? "true" : "false"}
        >
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-center">
        <button
          type="button"
          onClick={() => setMode("magic")}
          className="inline-flex min-h-11 items-center font-sans text-[14px] text-dp-ink-secondary underline-offset-4 hover:text-dp-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        >
          Email me a magic link instead
        </button>
      </p>

      {googleEnabled && googleAction ? (
        <>
          <AuthDivider />
          <form action={googleAction}>
            <input type="hidden" name="next" value={next} />
            <Button type="submit" variant="secondary" fullWidth>
              Continue with Google
            </Button>
          </form>
        </>
      ) : null}

      <div className="space-y-3 border-t border-dp-border pt-6 text-center">
        <p className="font-sans text-[14px] text-dp-ink-muted">
          New to Orellin?{" "}
          <Link
            href={`/signup${q}`}
            className="font-semibold text-dp-primary underline-offset-4 hover:underline"
          >
            Create account
          </Link>
        </p>
        <DevicePassportNotice />
      </div>
    </div>
  );
}
