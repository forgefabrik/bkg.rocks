import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@bkg/ui/styles";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BKG",
  description: "BKG monorepo"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
