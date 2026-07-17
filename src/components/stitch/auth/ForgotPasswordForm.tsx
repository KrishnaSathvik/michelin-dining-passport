"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import type { AuthActionState } from "@/app/auth/actions";
import { Button } from "@/components/stitch/Button";
import { AuthErrorState } from "./AuthErrorState";
import { AuthSuccessState } from "./AuthSuccessState";
import { AuthTextField } from "./AuthTextField";

const initialState: AuthActionState = { ok: false, message: "" };

type ForgotPasswordFormProps = {
  next: string;
  action: (
    prev: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  /** Dev visual-preview only — never set from production routes. */
  forceSuccess?: boolean;
};

export function ForgotPasswordForm({
  next,
  action,
  forceSuccess = false,
}: ForgotPasswordFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    forceSuccess
      ? {
          ok: true,
          message:
            "If that email can receive mail, password reset instructions are on the way.",
        }
      : initialState,
  );
  const headingRef = useRef<HTMLHeadingElement>(null);
  const q = `?next=${encodeURIComponent(next)}`;

  useEffect(() => {
    if (state.ok) headingRef.current?.focus();
  }, [state.ok]);

  if (state.ok) {
    return (
      <AuthSuccessState
        title="Check your email"
        description="If that email can receive mail, password reset instructions are on the way. The link expires after a short time."
        icon="mail"
      >
        <h2 ref={headingRef} tabIndex={-1} className="sr-only">
          Reset email sent
        </h2>
        <Link
          href={`/login${q}`}
          className="inline-flex h-[var(--dp-control-height)] w-full items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface px-5 font-sans text-[14px] font-semibold text-dp-primary no-underline hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        >
          Back to Sign in
        </Link>
      </AuthSuccessState>
    );
  }

  return (
    <div className="flex flex-col gap-8" data-auth-form="forgot-password">
      <header className="space-y-2">
        <h1 className="dp-headline-md text-dp-ink">Forgot Password</h1>
        <p className="font-sans text-[16px] leading-relaxed text-dp-ink-muted">
          Enter the email for your account. We will send reset instructions when
          the address can receive mail.
        </p>
      </header>

      <form action={formAction} className="flex flex-col gap-6">
        <input type="hidden" name="next" value={next} />
        <AuthTextField
          name="email"
          label="Email address"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
        />

        {state.message && !state.ok ? (
          <AuthErrorState message={state.message} />
        ) : null}

        <Button type="submit" variant="primary" fullWidth disabled={pending}>
          {pending ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="text-center">
        <Link
          href={`/login${q}`}
          className="inline-flex min-h-11 items-center font-sans text-[14px] text-dp-ink-secondary underline-offset-4 hover:underline"
        >
          ← Return to sign in
        </Link>
      </p>
    </div>
  );
}
