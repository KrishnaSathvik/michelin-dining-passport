import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";

type AuthFormPanelProps = {
  children: ReactNode;
};

/** Right form column — compact product identity on tablet/mobile. */
export function AuthFormPanel({ children }: AuthFormPanelProps) {
  return (
    <div className="flex w-full flex-1 flex-col justify-center px-5 py-10 sm:px-10 lg:w-[45%] lg:px-16 xl:w-[42%] xl:px-20">
      <p className="mb-8 font-display text-2xl text-dp-primary lg:hidden">
        {siteConfig.productName}
      </p>
      <div className="mx-auto w-full max-w-[440px]">{children}</div>
    </div>
  );
}
