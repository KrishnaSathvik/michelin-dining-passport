import { updatePasswordAction } from "@/app/auth/actions";
import { ResetPasswordForm } from "@/components/stitch/auth/ResetPasswordForm";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getVerifiedUser } from "@/lib/auth/session";

export const metadata = buildPageMetadata({
  title: "Reset password",
  description: "Choose a new password for your Dining Passport account.",
  path: "/reset-password",
  noIndex: true,
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const forceSuccess =
    process.env.NODE_ENV !== "production" && params.preview === "success";
  const user = await getVerifiedUser();

  return (
    <ResetPasswordForm
      action={updatePasswordAction}
      hasRecoverySession={Boolean(user) || forceSuccess}
      forceSuccess={forceSuccess}
    />
  );
}
