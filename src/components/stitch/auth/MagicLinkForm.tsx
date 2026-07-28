"use client";

import { useActionState, useEffect, useRef } from "react";
import type { AuthActionState } from "@/app/auth/actions";
import { Button } from "@/components/stitch/Button";
import { AuthErrorState } from "./AuthErrorState";
import { AuthSuccessState } from "./AuthSuccessState";
import { AuthTextField } from "./AuthTextField";

const initialState: AuthActionState = { ok: false, message: "" };

type MagicLinkFormProps = {
  action: (
    prev: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  next: string;
  onBack?: () => void;
};

export function MagicLinkForm({ action, next, onBack }: MagicLinkFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state.ok) headingRef.current?.focus();
  }, [state.ok]);

  if (state.ok) {
    return (
      <AuthSuccessState
        title="Check your email"
        description="If that address can receive mail, a sign-in link is on the way. Open it on this device to continue."
        icon="mail"
      >
        <h2 ref={headingRef} tabIndex={-1} className="sr-only">
          Magic link sent
        </h2>
        {onBack ? (
          <Button type="button" variant="secondary" fullWidth onClick={onBack}>
            Back to password sign in
          </Button>
        ) : null}
      </AuthSuccessState>
    );
  }

  return (
    <div className="flex flex-col gap-8" data-auth-form="magic-link">
      <header className="space-y-3">
        <p className="dp-label-caps text-dp-ink-muted">Passwordless</p>
        <h1 className="dp-headline-md text-dp-primary-deep">Sign in with email</h1>
        <p className="font-sans text-[16px] leading-relaxed text-dp-ink-secondary">
          We’ll send a one-time link. You are not signed in until you open it.
        </p>
      </header>

      <form action={formAction} noValidate className="flex flex-col gap-5">
        <input type="hidden" name="next" value={next} />
        <AuthTextField
          name="email"
          label="Email address"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          error={state.fieldErrors?.email}
        />

        {state.message ? <AuthErrorState message={state.message} /> : null}

        <Button type="submit" variant="primary" fullWidth disabled={pending}>
          {pending ? "Sending…" : "Email me a link"}
        </Button>
      </form>

      {onBack ? (
        <p className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-11 items-center font-sans text-[14px] text-dp-ink-secondary underline-offset-4 hover:text-dp-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          >
            Use password instead
          </button>
        </p>
      ) : null}
    </div>
  );
}
