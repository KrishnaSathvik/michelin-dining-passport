"use client";

import { PassportProvider } from "@/lib/passport/PassportProvider";
import type { Restaurant } from "@/lib/data/types";
import type { ReactNode } from "react";

type PassportClientShellProps = {
  restaurants: Restaurant[];
  children: ReactNode;
};

export function PassportClientShell({
  restaurants,
  children,
}: PassportClientShellProps) {
  return <PassportProvider restaurants={restaurants}>{children}</PassportProvider>;
}
