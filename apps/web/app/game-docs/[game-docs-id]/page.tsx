import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "../../lib/session";

type Block = { kind: "heading"; text: string } | { kind: "paragraph"; text: string } | { kind: "bullet"; items: string[] };

const DOC: Record<string, { title: string; updated: string; blocks: Block[] }> = {
  1: {
    title: "Mystic Battler Design Doc",
    updated: "2 minutes ago",
    blocks: [
      { kind: "heading", text: "Core Loop" },
      { kind: "paragraph", text: "Players battle across three lanes with elemental units. Synergies shift depending on kinetic timing windows, encouraging repeat play." },
      { kind: "heading", text: "Visual Style" },
      { kind: "paragraph", text: "Blueprint chrome, kinetic outlines, and a genesis palette that stretches toward bright highlights. HUD reads at small scales." },
      { kind: "heading", text: "Systems" },
      { kind: "bullet", items: ["Mana board", "Elemental buffs", "Roster mannequins"] },
    ],
  },
};

export default async function GameDocsPage({
  params,
}: {
  params: Promise<{ "game-docs-id": string }>;
}) {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const { "game-docs-id": id } = await params;
  const doc = DOC[id as "1"];
  if (!doc) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/studio" className="font-mono text-xs text-bkg-teal hover:underline">&lt; Studio</Link>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white">{doc.title}</h1>
          <p className="mt-1 font-mono text-xs text-bkg-slate/60">Updated {doc.updated}</p>
        </div>

        <div className="flex gap-3">
          <button className="pixel-btn">Preview</button>
          <button className="pixel-btn bg-transparent text-bkg-teal hover:text-white hover:bg-bkg-teal/20">Export</button>
        </div>
      </div>

      <div className="pixel-card px-6 py-8 sm:px-8 sm:py-10">
        <div className="space-y-6">
          {doc.blocks.map((block, idx) => {
            if (block.kind === "heading") {
              return <h2 key={idx} className="text-xl font-semibold text-white">{block.text}</h2>;
            }

            if (block.kind === "paragraph") {
              return (
                <p key={idx} className="text-bkg-slate/80 leading-relaxed">
                  {block.text}
                </p>
              );
            }

            if (block.kind === "bullet") {
              return (
                <ul key={idx} className="grid gap-2">
                  {block.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 font-mono text-sm text-bkg-slate/80">
                      <span className="mt-1 inline-flex h-2.5 w-2.5 items-center justify-center border border-bkg-teal bg-bkg-teal/60" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              );
            }

            return null;
          })}
        </div>
      </div>
    </section>
  );
}
