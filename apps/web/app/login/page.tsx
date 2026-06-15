
import Link from "next/link";

export default async function LoginPage() {
  return (
    <section className="mx-auto max-w-md">
      <div className="pixel-card px-6 py-8 sm:px-8 sm:py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 font-mono text-xs text-bkg-slate/70">
            Sign in to your BKG Studio workspace.
          </p>
        </div>

        <form
          action="/api/auth/login"
          method="post"
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="block font-mono text-xs uppercase tracking-wider text-bkg-slate">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full border-2 border-bkg-cobalt bg-bkg-navy px-3 py-2 font-mono text-sm text-white placeholder-bkg-slate/40 focus:border-bkg-teal focus:outline-none"
              placeholder="you@studio.bkg"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-mono text-xs uppercase tracking-wider text-bkg-slate">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full border-2 border-bkg-cobalt bg-bkg-navy px-3 py-2 font-mono text-sm text-white placeholder-bkg-slate/40 focus:border-bkg-teal focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="w-full pixel-btn">
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center font-mono text-xs text-bkg-slate/70">
          Need an account?{" "}
          <Link href="/register" className="text-bkg-teal hover:underline">Create one</Link>
        </p>
      </div>
    </section>
  );
}
