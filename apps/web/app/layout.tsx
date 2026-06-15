import "@bkg/ui/styles";
import "./globals.css";

export const metadata = {
  title: "BKG Monorepo",
  description: "BKG application built with Turborepo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}