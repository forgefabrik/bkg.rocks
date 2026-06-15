import "./globals.css";
import Link from "next/link";
import { getSession } from "./lib/session";

export const metadata = {
  title: "BKG Studio",
  description: "Blueprint. Kinetic. Genesis.",
};

const NAV = [
  { href: "/", label: "Home" },
  { href: "/studio", label: "Studio" },
  { href: "/game-docs/1", label: "Game Docs" },
];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en">
      <body className="min-h-screen bg-bkg-navy text-bkg-slate antialiased">
        <div className="fixed inset-0 bg-pixel-grid pointer-events-none" aria-hidden="true" />

        <header className="relative border-b border-bkg-cobalt bg-bkg-navy/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center border border-bkg-teal bg-bkg-teal/20 shadow-[0_0_12px_rgba(34,211,187,0.25)] transition-shadow group-hover:shadow-[0_0_22px_rgba(34,211,187,0.55)]">
                <span className="font-mono font-bold text-bkg-teal">B</span>
              </span>
              <span className="font-mono text-sm font-semibold uppercase tracking-widest text-white">
                BKG <span className="text-bkg-teal">Studio</span>
              </span>
            </Link>

            <nav className="flex items-center gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-bkg-slate transition-colors hover:text-bkg-teal hover:bg-bkg-cobalt/40"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mx-2 h-4 w-px bg-bkg-cobalt" />
              {session ? (
                <Link href="/studio" className="pixel-btn">
                  {session.email}
                </Link>
              ) : (
                <Link href="/login" className="pixel-btn">
                  Login
                </Link>
              )}
            </nav>
          </div>
        </header>

        <main className="relative mx-auto max-w-6xl px-4 py-10">
          {children}
        </main>

        <footer className="relative border-t border-bkg-cobalt/60 bg-bkg-navy/60">
          <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xs text-bkg-slate/70">
              &copy; {new Date().getFullYear()} BKG Studio. Blueprint. Kinetic. Genesis.
            </p>
            <p className="font-mono text-xs text-bkg-slate/50">
              Built with Next.js + Tailwind
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
