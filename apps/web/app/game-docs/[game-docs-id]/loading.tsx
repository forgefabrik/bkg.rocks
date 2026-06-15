import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Game Docs",
};

export default async function GameDocsLoading() {
  return (
    <div className="pixel-card px-6 py-8">
      <div className="space-y-4">
        <div className="h-6 w-32 bg-bkg-cobalt/60 animate-pulse" />
        <div className="h-28 w-full bg-bkg-cobalt/60 animate-pulse" />
        <div className="h-64 w-full bg-bkg-cobalt/60 animate-pulse" />
      </div>
    </div>
  );
}
