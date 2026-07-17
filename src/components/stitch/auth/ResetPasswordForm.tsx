"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import type { AuthActionState } from "@/app/auth/actions";
import { Button } from "@/components/stitch/Button";
import { AuthErrorState } from "./AuthErrorState";
import { AuthSuccessState } from "./AuthSuccessState";
import { PasswordField } from "./PasswordField";

const initialState: AuthActionState = { ok: false, message: "" };

type ResetPasswordFormProps = {
  action: (
    prev: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  /** When false, recovery session is missing — show invalid-link state. */
  hasRecoverySession: boolean;
  /** Dev visual-preview only — never set from production routes. */
  forceSuccess?: boolean;
};

export function ResetPasswordForm({
  action,
  hasRecoverySession,
  forceSuccess = false,
}: ResetPasswordFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    forceSuccess
      ? {
          ok: true,
          message: "Your password has been successfully updated.",
        }
      : initialState,
  );
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state.ok) headingRef.current?.focus();
  }, [state.ok]);

  if (!hasRecoverySession) {
    return (
      <div className="flex flex-col gap-8" data-auth-form="reset-invalid">
        <AuthSuccessState
          title="Reset link unavailable"
          description="This password reset link is missing, invalid, or expired. Request a new link to continue."
          icon="mail"
        >
          <div className="flex w-full flex-col gap-3">
            <Link
              href="/forgot-password"
              className="inline-flex h-[var(--dp-control-height)] w-full items-center justify-center rounded-[var(--dp-radius-lg)] bg-dp-primary px-5 font-sans text-[14px] font-semibold text-dp-on-primary no-underline hover:bg-dp-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
            >
              Request a new link
            </Link>
            <Link
              href="/login?next=/reset-password"
              className="inline-flex h-[var(--dp-control-height)] w-full items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface px-5 font-sans text-[14px] font-semibold text-dp-primary no-underline hover:bg-dp-soft"
            >
              Back to Sign in
            </Link>
          </div>
        </AuthSuccessState>
      </div>
    );
  }

  if (state.ok) {
    return (
      <AuthSuccessState
        title="Password updated"
        description="Your password has been successfully updated."
        icon="check"
      >
        <h2 ref={headingRef} tabIndex={-1} className="sr-only">
          Password updated
        </h2>
        <Link
          href="/account"
          className="inline-flex h-[var(--dp-control-height)] w-full items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface px-5 font-sans text-[14px] font-semibold text-dp-primary no-underline hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        >
          Continue to Account
        </Link>
      </AuthSuccessState>
    );
  }

  return (
    <div className="flex flex-col gap-8" data-auth-form="reset-password">
      <header className="space-y-2">
        <h1 className="dp-headline-md text-dp-ink">Reset Password</h1>
        <p className="font-sans text-[16px] leading-relaxed text-dp-ink-muted">
          Choose a new password for your Dining Passport account.
        </p>
      </header>

      <form action={formAction} className="flex flex-col gap-6">
        <input type="hidden" name="next" value="/account" />
        <PasswordField
          name="password"
          label="New password"
          required
          autoComplete="new-password"
          minLength={8}
          hint="At least 8 characters."
        />

        {state.message ? <AuthErrorState message={state.message} /> : null}

        <Button type="submit" variant="primary" fullWidth disabled={pending}>
          {pending ? "Updating…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
