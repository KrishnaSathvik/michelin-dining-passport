import type { ReactNode } from "react";
import { AuthMobileBrandStrip } from "./AuthBrandPanel";

type AuthFormPanelProps = {
  children: ReactNode;
};

/** Right form column — atmospheric brand strip on tablet/mobile. */
export function AuthFormPanel({ children }: AuthFormPanelProps) {
  return (
    <div className="flex w-full flex-1 flex-col bg-dp-bg px-5 py-0 sm:px-10 lg:w-[45%] lg:bg-transparent lg:px-16 lg:py-10 xl:w-[42%] xl:px-20">
      <AuthMobileBrandStrip />
      <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center pb-10 pt-2 lg:py-0">
        {children}
      </div>
    </div>
  );
}
