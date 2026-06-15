import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "../lib/session";

export default async function StudioPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const projects = [
    { id: "1", name: "Mystic Battler", updated: "2m ago", status: "Draft" },
    { id: "2", name: "Sector Trader", updated: "1h ago", status: "Review" },
    { id: "3", name: "Pixel Dungeon", updated: "3h ago", status: "Published" },
  ];

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Studio</h1>
          <p className="mt-1 font-mono text-xs text-bkg-slate/60">
            Welcome, {session.email}
          </p>
        </div>

        <Link href="/game-docs/new" className="pixel-btn">
          New doc
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.id} href={`/game-docs/${project.id}`} className="pixel-card block p-5 transition-colors hover:border-bkg-teal/70">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-mono text-sm font-semibold text-white">{project.name}</h2>
                <p className="mt-1 font-mono text-xs text-bkg-slate/60">Updated {project.updated}</p>
              </div>
              <span className="border border-bkg-amber/60 bg-bkg-amber/10 px-2 py-0.5 font-mono text-xs text-bkg-amber">
                {project.status}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="h-2 w-full bg-bkg-cobalt/60" />
              <div className="h-2 w-5/6 bg-bkg-cobalt/60" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
