import { updatePasswordAction } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/AuthForm";
import { getVerifiedUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function ResetPasswordPage() {
  const user = await getVerifiedUser();
  if (!user) {
    redirect("/login?next=/reset-password");
  }

  return (
    <AuthForm
      title="Choose a new password"
      description="You are signed in via a recovery link. Set a new password to continue."
      action={updatePasswordAction}
      next="/account"
      submitLabel="Update password"
      fields={[
        {
          name: "password",
          label: "New password",
          type: "password",
          required: true,
          autoComplete: "new-password",
        },
      ]}
    />
  );
}
