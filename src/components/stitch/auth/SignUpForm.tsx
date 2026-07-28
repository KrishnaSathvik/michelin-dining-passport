"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import type { AuthActionState } from "@/app/auth/actions";
import { Button } from "@/components/stitch/Button";
import { AuthErrorState } from "./AuthErrorState";
import { AuthSuccessState } from "./AuthSuccessState";
import { DevicePassportNotice } from "./DevicePassportNotice";
import { PasswordField } from "./PasswordField";
import { AuthTextField } from "./AuthTextField";

const initialState: AuthActionState = { ok: false, message: "" };

type SignUpFormProps = {
  next: string;
  action: (
    prev: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  configured?: boolean;
};

export function SignUpForm({
  next,
  action,
  configured = true,
}: SignUpFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const q = `?next=${encodeURIComponent(next)}`;
  const fieldErrors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.status === "check-email") headingRef.current?.focus();
  }, [state.status]);

  if (state.status === "check-email") {
    return (
      <AuthSuccessState
        title="Confirm your email"
        description={
          state.email
            ? `We sent a confirmation link to ${state.email}. Open it to finish creating your account — you are not signed in until you do.`
            : "We sent you a confirmation link. Open it to finish creating your account — you are not signed in until you do."
        }
        icon="mail"
      >
        <h2 ref={headingRef} tabIndex={-1} className="sr-only">
          Confirmation email sent
        </h2>
        <Link
          href={`/login${q}`}
          className="inline-flex h-[var(--dp-control-height)] w-full items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface px-5 font-sans text-[14px] font-semibold text-dp-primary no-underline hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        >
          Back to Sign in
        </Link>
        <DevicePassportNotice />
      </AuthSuccessState>
    );
  }

  return (
    <div className="flex flex-col gap-8" data-auth-form="sign-up">
      <header className="space-y-3">
        <p className="dp-label-caps text-dp-ink-muted">Join</p>
        <h1 className="dp-headline-md text-dp-primary-deep">Create account</h1>
        <p className="font-sans text-[16px] leading-relaxed text-dp-ink-secondary">
          Sync saves and visits across your devices.
        </p>
      </header>

      {!configured ? (
        <p
          role="status"
          className="rounded-[var(--dp-radius-md)] border border-dp-border px-4 py-3 font-sans text-[14px] text-dp-ink-muted"
        >
          Supabase is not configured, so account creation is unavailable.
        </p>
      ) : null}

      {/*
        noValidate: field-level messages come from the action so browser bubbles
        never compete with the in-form errors.
      */}
      <form action={formAction} noValidate className="flex flex-col gap-5">
        <input type="hidden" name="next" value={next} />
        <AuthTextField
          name="displayName"
          label="Display name"
          autoComplete="name"
          hint="Optional"
          error={fieldErrors.displayName}
        />
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
          autoComplete="new-password"
          minLength={8}
          hint="At least 8 characters."
          error={fieldErrors.password}
        />

        {state.message ? <AuthErrorState message={state.message} /> : null}

        <Button type="submit" variant="primary" fullWidth disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="font-sans text-[13px] leading-relaxed text-dp-ink-muted">
        By creating an account you agree to our{" "}
        <Link
          href="/terms"
          className="font-medium text-dp-primary underline underline-offset-4"
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="font-medium text-dp-primary underline underline-offset-4"
        >
          Privacy
        </Link>{" "}
        notice. An account is optional — you can keep device-only saves.
      </p>

      <div className="space-y-3 border-t border-dp-border pt-6 text-center">
        <p className="font-sans text-[14px] text-dp-ink-muted">
          Already have an account?{" "}
          <Link
            href={`/login${q}`}
            className="font-semibold text-dp-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
        <DevicePassportNotice />
      </div>
    </div>
  );
}
