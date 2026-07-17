import { forgotPasswordAction } from "@/app/auth/actions";
import { AuthForm, AuthLinks } from "@/components/auth/AuthForm";
import { safeInternalPath } from "@/lib/auth/redirect";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const next = safeInternalPath(
    typeof params.next === "string" ? params.next : undefined,
  );

  return (
    <AuthForm
      title="Reset password"
      description="We will email reset instructions when the address can receive mail."
      action={forgotPasswordAction}
      next={next}
      submitLabel="Send reset link"
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
  );
}
