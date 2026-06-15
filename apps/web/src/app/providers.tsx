"use client";

import { SessionProvider } from "@bkg/auth";
import { ThemeProvider } from "@bkg/config";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
}
