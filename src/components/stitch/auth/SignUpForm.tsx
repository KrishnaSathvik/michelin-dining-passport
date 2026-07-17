"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { AuthActionState } from "@/app/auth/actions";
import { Button } from "@/components/stitch/Button";
import { AuthErrorState } from "./AuthErrorState";
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
  const q = `?next=${encodeURIComponent(next)}`;

  return (
    <div className="flex flex-col gap-8" data-auth-form="sign-up">
      <header className="space-y-2">
        <h1 className="dp-headline-md text-dp-ink">Create an Account</h1>
        <p className="font-sans text-[16px] leading-relaxed text-dp-ink-muted">
          Save visits, notes, and collections to your cloud Passport.
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

      <form action={formAction} className="flex flex-col gap-6">
        <input type="hidden" name="next" value={next} />
        <AuthTextField
          name="displayName"
          label="Display name"
          autoComplete="name"
          hint="Optional"
        />
        <AuthTextField
          name="email"
          label="Email address"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
        />
        <PasswordField
          name="password"
          label="Password"
          required
          autoComplete="new-password"
          minLength={8}
          hint="At least 8 characters."
        />

        {state.message ? <AuthErrorState message={state.message} /> : null}

        <Button type="submit" variant="primary" fullWidth disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="font-sans text-[13px] leading-relaxed text-dp-ink-muted">
        By creating an account you agree to use Dining Passport responsibly. An
        account is optional — you can keep a device-only Passport.
      </p>

      <div className="space-y-3 text-center">
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
