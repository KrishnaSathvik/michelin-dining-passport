"use server";

import { redirect } from "next/navigation";
import { authErrorMessage } from "@/lib/auth/errors";
import { safeInternalPath } from "@/lib/auth/redirect";
import { getSiteUrl, isGoogleAuthEnabled } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type AuthField = "email" | "password" | "displayName";

export type AuthFieldErrors = Partial<Record<AuthField, string>>;

export type AuthActionState = {
  ok: boolean;
  message: string;
  /** Per-field messages rendered beside the offending input. */
  fieldErrors?: AuthFieldErrors;
  /**
   * Signup only: the account was created but needs email confirmation before
   * a session exists, so the form shows a confirmation state in place.
   */
  status?: "check-email";
  email?: string;
};

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Deliberately permissive: the authoritative check is whether the address can
 * receive mail. This only catches obvious typos before a network round trip.
 */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function hasFieldErrors(errors: AuthFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formString(formData, "email");
  const password = formString(formData, "password");
  const displayName = formString(formData, "displayName");
  const next = safeInternalPath(formString(formData, "next"), "/passport");

  const fieldErrors: AuthFieldErrors = {};
  if (!email) {
    fieldErrors.email = "Enter your email address.";
  } else if (!looksLikeEmail(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }
  if (!password) {
    fieldErrors.password = "Choose a password.";
  } else if (password.length < 8) {
    fieldErrors.password = "Use at least 8 characters.";
  }
  if (displayName.length > 60) {
    fieldErrors.displayName = "Use 60 characters or fewer.";
  }
  if (hasFieldErrors(fieldErrors)) {
    return { ok: false, message: "", fieldErrors };
  }

  let needsConfirmation = false;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || undefined },
        emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      return {
        ok: false,
        message: authErrorMessage(error, "Unable to create account."),
      };
    }
    // Supabase only returns a session when email confirmation is disabled.
    needsConfirmation = !data.session;
  } catch {
    return {
      ok: false,
      message: "Unable to reach authentication services. Try again later.",
    };
  }

  if (needsConfirmation) {
    return { ok: true, message: "", status: "check-email", email };
  }

  redirect(next);
}

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formString(formData, "email");
  const password = formString(formData, "password");
  const next = safeInternalPath(formString(formData, "next"), "/passport");

  const fieldErrors: AuthFieldErrors = {};
  if (!email) fieldErrors.email = "Enter your email address.";
  if (!password) fieldErrors.password = "Enter your password.";
  if (hasFieldErrors(fieldErrors)) {
    return { ok: false, message: "", fieldErrors };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return {
        ok: false,
        message: authErrorMessage(error, "Unable to sign in."),
      };
    }
  } catch {
    return {
      ok: false,
      message: "Unable to reach authentication services. Try again later.",
    };
  }

  redirect(next);
}

export async function magicLinkAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formString(formData, "email");
  const next = safeInternalPath(formString(formData, "next"), "/passport");
  if (!email || !looksLikeEmail(email)) {
    return {
      ok: false,
      message: "",
      fieldErrors: {
        email: email ? "Enter a valid email address." : "Enter your email address.",
      },
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      return {
        ok: false,
        message: authErrorMessage(error, "Unable to send magic link."),
      };
    }
  } catch {
    return {
      ok: false,
      message: "Unable to reach authentication services. Try again later.",
    };
  }

  return {
    ok: true,
    message: "If that email can receive mail, a sign-in link is on the way.",
  };
}

export async function forgotPasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formString(formData, "email");
  if (!email || !looksLikeEmail(email)) {
    return {
      ok: false,
      message: "",
      fieldErrors: {
        email: email ? "Enter a valid email address." : "Enter your email address.",
      },
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
    });
    if (error) {
      return {
        ok: false,
        message: authErrorMessage(error, "Unable to start password reset."),
      };
    }
  } catch {
    return {
      ok: false,
      message: "Unable to reach authentication services. Try again later.",
    };
  }

  return {
    ok: true,
    message:
      "If that email can receive mail, password reset instructions are on the way.",
  };
}

export async function updatePasswordFormAction(formData: FormData): Promise<void> {
  const password = formString(formData, "password");
  if (password.length < 8) {
    redirect("/account?error=weak-password");
  }

  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      redirect("/login?next=/account");
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      redirect("/account?error=password");
    }
  } catch {
    redirect("/account?error=password");
  }

  redirect("/account?password=updated");
}

export async function updatePasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = formString(formData, "password");
  if (password.length < 8) {
    return {
      ok: false,
      message: "",
      fieldErrors: {
        password: password ? "Use at least 8 characters." : "Choose a password.",
      },
    };
  }

  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { ok: false, message: "Sign in again to update your password." };
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      return {
        ok: false,
        message: authErrorMessage(error, "Unable to update password."),
      };
    }
  } catch {
    return {
      ok: false,
      message: "Unable to reach authentication services. Try again later.",
    };
  }

  // Return success so the reset form can show the Stitch completion state.
  // Account password updates still redirect via updatePasswordFormAction.
  return {
    ok: true,
    message: "Your password has been successfully updated.",
  };
}

export async function signOutAction(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Still leave the account surface.
  }
  redirect("/");
}

export async function signInWithGoogleAction(formData: FormData): Promise<void> {
  if (!isGoogleAuthEnabled()) {
    redirect("/login?error=google-disabled");
  }
  const next = safeInternalPath(formString(formData, "next"), "/passport");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error || !data.url) {
    redirect("/login?error=oauth");
  }
  redirect(data.url);
}
