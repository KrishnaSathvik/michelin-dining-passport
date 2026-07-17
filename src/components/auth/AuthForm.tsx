"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { AuthActionState } from "@/app/auth/actions";

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
  successRedirectHint?: string;
};

export function AuthForm({
  title,
  description,
  action,
  fields,
  submitLabel,
  next = "/passport",
  footer,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="mx-auto w-full max-w-md border border-border bg-bg-elevated/40 px-6 py-8">
      <h1 className="font-display text-3xl text-ink">{title}</h1>
      {description ? (
        <p className="mt-2 font-sans text-sm text-ink-muted">{description}</p>
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
              className="border border-border bg-bg px-3 py-2 font-sans text-sm text-ink outline-none focus:border-forest"
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

        <button
          type="submit"
          disabled={pending}
          className="bg-ink px-4 py-2.5 font-sans text-sm text-bg transition-opacity disabled:opacity-60"
        >
          {pending ? "Working…" : submitLabel}
        </button>
      </form>

      {footer ? <div className="mt-6 font-sans text-sm text-ink-muted">{footer}</div> : null}
    </div>
  );
}

export function AuthLinks({
  next,
}: {
  next: string;
}) {
  const q = `?next=${encodeURIComponent(next)}`;
  return (
    <p className="flex flex-wrap gap-x-3 gap-y-1">
      <Link href={`/login${q}`} className="text-forest underline-offset-4 hover:underline">
        Sign in
      </Link>
      <Link href={`/signup${q}`} className="text-forest underline-offset-4 hover:underline">
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
