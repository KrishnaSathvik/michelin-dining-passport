"use server";

import { redirect } from "next/navigation";
import { authErrorMessage } from "@/lib/auth/errors";
import { safeInternalPath } from "@/lib/auth/redirect";
import { getSiteUrl, isGoogleAuthEnabled } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  ok: boolean;
  message: string;
};

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formString(formData, "email");
  const password = formString(formData, "password");
  const displayName = formString(formData, "displayName");
  const next = safeInternalPath(formString(formData, "next"), "/passport");

  if (!email || !password) {
    return { ok: false, message: "Email and password are required." };
  }
  if (password.length < 8) {
    return {
      ok: false,
      message: "Choose a stronger password (at least 8 characters).",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
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
  } catch {
    return {
      ok: false,
      message: "Unable to reach authentication services. Try again later.",
    };
  }

  redirect(`/login?verify=1&next=${encodeURIComponent(next)}`);
}

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formString(formData, "email");
  const password = formString(formData, "password");
  const next = safeInternalPath(formString(formData, "next"), "/passport");

  if (!email || !password) {
    return { ok: false, message: "Email and password are required." };
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
  if (!email) return { ok: false, message: "Email is required." };

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
  if (!email) return { ok: false, message: "Email is required." };

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
      message: "Choose a stronger password (at least 8 characters).",
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
