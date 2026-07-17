/**
 * Map Supabase/auth errors to user-safe messages without leaking internals
 * or confirming whether an unrelated email has an account.
 */
export function authErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") return fallback;
  const message =
    "message" in error && typeof error.message === "string"
      ? error.message.toLowerCase()
      : "";
  const status =
    "status" in error && typeof error.status === "number" ? error.status : null;

  if (status === 429 || message.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (message.includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }
  if (message.includes("email not confirmed")) {
    return "Confirm your email before signing in.";
  }
  if (message.includes("user already registered")) {
    return "Unable to create this account. Try signing in instead.";
  }
  if (message.includes("password") && message.includes("weak")) {
    return "Choose a stronger password (at least 8 characters).";
  }
  if (message.includes("signup is disabled")) {
    return "New signups are temporarily unavailable.";
  }
  if (message.includes("expired") || message.includes("otp")) {
    return "This link has expired. Request a new one.";
  }
  if (message.includes("network") || message.includes("fetch")) {
    return "Unable to reach authentication services. Check your connection.";
  }
  return fallback;
}
