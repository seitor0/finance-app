"use client";

import type { ReactNode } from "react";
import { AppProvider as Provider } from "@/context/AppContext";

export default function AppProvider({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}
