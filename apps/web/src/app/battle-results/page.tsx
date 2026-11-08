"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { BattleRunResult } from "@battle-arena/shared";
import { BattleResults } from "@/components/BattleResults";
import { getRunById, readLastRun } from "@/lib/storage";

export default function BattleResultsPage() {
  const [run, setRun] = useState<BattleRunResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const runId = params.get("run");
    const stored = runId ? getRunById(runId) : null;
    setRun(stored ?? readLastRun());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <main className="page-shell">
        <div className="mx-auto max-w-3xl px-5 py-24 text-center">
          <p className="animate-pulse text-sm uppercase tracking-[0.3em] text-arena-text3">Loading results…</p>
        </div>
      </main>
    );
  }

  if (!run) {
    return (
      <main className="page-shell">
        <div className="mx-auto max-w-3xl px-5 py-24 text-center">
          <h1 className="font-display text-3xl font-black text-white">No battle result found</h1>
          <p className="mt-2 text-sm text-arena-text2">
            Results are stored in this browser. Run a battle to create one.
          </p>
          <Link
            href="/battle-setup"
            className="mt-6 inline-block rounded-full bg-gradient-to-r from-arena-purple to-arena-blue px-6 py-3 text-sm font-bold uppercase tracking-widest text-white"
          >
            Start a battle
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-arena-purple">Battle results</p>
            <h1 className="font-display text-3xl font-black text-white sm:text-4xl">
              {run.characterA.name} <span className="text-arena-text3">vs</span> {run.characterB.name}
            </h1>
            <p className="mt-1 font-mono text-xs text-arena-text3">
              {run.runId} · {new Date(run.generatedAt).toLocaleString()}
            </p>
          </div>
          <Link href="/battle-history" className="text-xs font-semibold text-arena-text3 hover:text-arena-blue">
            View history →
          </Link>
        </header>

        <BattleResults result={run} />
      </div>
    </main>
  );
}
