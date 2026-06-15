import Link from "next/link";

export default function Home() {
  return (
    <section className="relative animate-float">
      <div className="absolute -inset-16 -z-10 bg-gradient-to-br from-bkg-cobalt/60 to-bkg-navy/60 blur-3xl" />

      <div className="pixel-card px-8 py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              Build worlds with <span className="text-bkg-teal">pixel logic.</span>
            </h1>
            <p className="mt-4 text-bkg-slate/80 sm:text-lg">
              Design, document, and iterate on game systems from a single browser-based studio.
              Ship playable prototypes faster with structured docs, live previews, and realtime collaboration.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="pixel-btn">
                Start for free
              </Link>
              <Link href="/login" className="pixel-btn bg-transparent text-bkg-teal hover:text-white hover:bg-bkg-teal/20">
                Sign in
              </Link>
            </div>

            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {[
                "Structured game document authoring",
                "Realtime collaborative editing",
                "Publish artifacts + changelogs",
                "Ship-ready export formats",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2 font-mono text-xs text-bkg-slate/80">
                  <span className="mt-1 inline-block h-2 w-2 border border-bkg-teal bg-bkg-teal/60" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden shrink-0 lg:block">
            <div className="pixel-card p-6 w-[360px]">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-3 w-3 border border-bkg-teal/80 bg-bkg-teal/30" />
                <span className="h-3 w-3 border border-bkg-amber/80 bg-bkg-amber/30" />
                <span className="h-3 w-3 border border-bkg-teal/80 bg-bkg-teal/30" />
              </div>
              <div className="space-y-3">
                <div className="h-28 border border-bkg-cobalt bg-bkg-navy/60" />
                <div className="h-16 border border-bkg-cobalt bg-bkg-navy/60" />
                <div className="h-10 border border-bkg-cobalt bg-bkg-navy/60" />
              </div>
              <div className="mt-4">
                <div className="h-3 w-24 bg-bkg-teal/25" />
                <div className="mt-2 h-3 w-40 bg-bkg-cobalt/70" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
