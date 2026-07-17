"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { AuthActionState } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";

const initialState: AuthActionState = { ok: false, message: "" };

type Field = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
};

type AuthFormProps = {
  title: string;
  description?: string;
  action: (
    prev: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  fields: Field[];
  submitLabel: string;
  next?: string;
  footer?: React.ReactNode;
  /** When true, omit the outer card chrome (for tabbed shells). */
  embedded?: boolean;
  headingLevel?: "h1" | "h2";
};

export function AuthForm({
  title,
  description,
  action,
  fields,
  submitLabel,
  next = "/passport",
  footer,
  embedded = false,
  headingLevel = "h1",
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const HeadingTag = headingLevel;

  const body = (
    <>
      <HeadingTag
        className={`font-display text-ink ${headingLevel === "h1" ? "text-3xl sm:text-4xl" : "text-2xl"}`}
      >
        {title}
      </HeadingTag>
      {description ? (
        <p className="mt-2 font-sans text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
      ) : null}

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />
        {fields.map((field) => (
          <label key={field.name} className="flex flex-col gap-1.5">
            <span className="font-sans text-sm text-ink">{field.label}</span>
            <input
              name={field.name}
              type={field.type ?? "text"}
              required={field.required}
              autoComplete={field.autoComplete}
              className="min-h-11 rounded-[var(--radius-md)] border border-border bg-bg px-3 font-sans text-sm text-ink outline-none focus:border-forest"
            />
          </label>
        ))}

        {state.message ? (
          <p
            role="status"
            className={`font-sans text-sm ${state.ok ? "text-forest" : "text-burgundy"}`}
          >
            {state.message}
          </p>
        ) : null}

        <Button type="submit" variant="primary" disabled={pending} className="w-full">
          {pending ? "Working…" : submitLabel}
        </Button>
      </form>

      {footer ? (
        <div className="mt-6 font-sans text-sm text-ink-muted">{footer}</div>
      ) : null}
    </>
  );

  if (embedded) {
    return <div className="w-full">{body}</div>;
  }

  return (
    <div className="mx-auto w-full max-w-[28rem] rounded-[var(--radius-lg)] border border-border bg-bg px-6 py-8 sm:px-8">
      {body}
    </div>
  );
}

type LoginAuthPanelProps = {
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
};

export function LoginAuthPanel({
  next,
  passwordAction,
  magicAction,
  googleAction,
  googleEnabled,
}: LoginAuthPanelProps) {
  const [tab, setTab] = useState<"password" | "magic">("password");

  return (
    <div className="mx-auto w-full max-w-[28rem] rounded-[var(--radius-lg)] border border-border bg-bg px-6 py-8 sm:px-8">
      <div
        className="flex gap-1 rounded-[var(--radius-md)] bg-surface-soft p-1"
        role="tablist"
        aria-label="Sign-in method"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "password"}
          className={`min-h-10 flex-1 rounded-[var(--radius-sm)] font-sans text-sm ${
            tab === "password"
              ? "bg-bg text-ink shadow-sm"
              : "text-ink-muted hover:text-ink"
          }`}
          onClick={() => setTab("password")}
        >
          Password
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "magic"}
          className={`min-h-10 flex-1 rounded-[var(--radius-sm)] font-sans text-sm ${
            tab === "magic"
              ? "bg-bg text-ink shadow-sm"
              : "text-ink-muted hover:text-ink"
          }`}
          onClick={() => setTab("magic")}
        >
          Magic link
        </button>
      </div>

      <div className="mt-6" role="tabpanel">
        {tab === "password" ? (
          <AuthForm
            embedded
            headingLevel="h1"
            title="Sign in"
            description="Access your cloud Passport and sync device saves after you authenticate."
            action={passwordAction}
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
        ) : (
          <AuthForm
            embedded
            headingLevel="h1"
            title="Magic link"
            description="Passwordless sign-in via email. We never store your password for this flow."
            action={magicAction}
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
            footer={<AuthLinks next={next} />}
          />
        )}
      </div>

      {googleEnabled && googleAction ? (
        <form action={googleAction} className="mt-4">
          <input type="hidden" name="next" value={next} />
          <Button type="submit" variant="secondary" className="w-full">
            Continue with Google
          </Button>
        </form>
      ) : null}

      <p className="mt-6 font-sans text-sm text-ink-muted">
        Prefer device-only saving?{" "}
        <Link
          href="/passport"
          className="text-forest underline-offset-4 hover:underline"
        >
          Continue to Passport
        </Link>
      </p>
    </div>
  );
}

export function AuthLinks({ next }: { next: string }) {
  const q = `?next=${encodeURIComponent(next)}`;
  return (
    <p className="flex flex-wrap gap-x-3 gap-y-1">
      <Link
        href={`/login${q}`}
        className="text-forest underline-offset-4 hover:underline"
      >
        Sign in
      </Link>
      <Link
        href={`/signup${q}`}
        className="text-forest underline-offset-4 hover:underline"
      >
        Create account
      </Link>
      <Link
        href={`/forgot-password${q}`}
        className="text-forest underline-offset-4 hover:underline"
      >
        Forgot password
      </Link>
    </p>
  );
}
