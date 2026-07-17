import { forgotPasswordAction } from "@/app/auth/actions";
import { ForgotPasswordForm } from "@/components/stitch/auth/ForgotPasswordForm";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { safeInternalPath } from "@/lib/auth/redirect";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata = buildPageMetadata({
  title: "Forgot password",
  description: "Request a password reset link for your Dining Passport account.",
  path: "/forgot-password",
  noIndex: true,
});

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const next = safeInternalPath(
    typeof params.next === "string" ? params.next : undefined,
  );
  const forceSuccess =
    process.env.NODE_ENV !== "production" && params.preview === "success";

  return (
    <ForgotPasswordForm
      next={next}
      action={forgotPasswordAction}
      forceSuccess={forceSuccess}
    />
  );
}
