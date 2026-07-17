import Link from "next/link";

type DevicePassportNoticeProps = {
  href?: string;
  label?: string;
};

export function DevicePassportNotice({
  href = "/passport",
  label = "Continue with device-only Passport",
}: DevicePassportNoticeProps) {
  return (
    <p className="text-center">
      <Link
        href={href}
        className="inline-flex min-h-11 items-center justify-center gap-1 font-sans text-[14px] text-dp-ink-secondary underline-offset-4 hover:text-dp-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
      >
        {label}
        <span aria-hidden="true">→</span>
      </Link>
    </p>
  );
}
