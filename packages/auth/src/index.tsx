"use client";

import { SessionProviderProps } from "next-auth/react";

export function SessionProvider({ children }: SessionProviderProps) {
  return <>{children}</>;
}
