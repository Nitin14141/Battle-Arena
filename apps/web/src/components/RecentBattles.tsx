"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { BattleRunResult } from "@battle-arena/shared";
import { CharacterEmblem } from "@/components/CharacterEmblem";
import { characterImageFor } from "@/lib/portraits";
import { listRunHistory } from "@/lib/storage";

function resultLabel(run: BattleRunResult): string {
  const mode = run.modes[0];
  if (!mode) return "Saved";
  if (mode.overall.winner === "a_wins") return `${run.characterA.name} wins`;
  if (mode.overall.winner === "b_wins") return `${run.characterB.name} wins`;
  if (mode.overall.winner === "inconclusive") return "Inconclusive";
  return "Draw";
}

export function RecentBattles() {
  const [runs, setRuns] = useState<BattleRunResult[] | null>(null);

  useEffect(() => {
    setRuns(listRunHistory().slice(0, 3));
  }, []);

  if (runs === null) {
    return <p className="animate-pulse text-sm text-arena-text3">Loading recent battles…</p>;
  }

  if (runs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-arena-border p-8 text-center">
        <p className="text-sm text-arena-text2">No battles saved in this browser yet.</p>
        <Link
          href="/battle-setup"
          className="mt-4 inline-block rounded-full bg-gradient-to-r from-arena-purple to-arena-blue px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white"
        >
          Run the first one
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {runs.map((run) => (
        <Link
          key={run.runId}
          href={`/battle-results?run=${run.runId}`}
          className="rounded-2xl border border-arena-border/60 bg-arena-surface/40 p-4 transition-colors hover:border-arena-purple/50"
        >
          <div className="flex items-center gap-2">
            <CharacterEmblem
              name={run.characterA.name}
              theme={run.characterA.theme}
              size="sm"
              image={characterImageFor(run.characterA)}
              universe={run.characterA.universe}
              category={run.characterA.category}
            />
            <span className="text-[10px] font-bold uppercase tracking-widest text-arena-text3">vs</span>
            <CharacterEmblem
              name={run.characterB.name}
              theme={run.characterB.theme}
              size="sm"
              image={characterImageFor(run.characterB)}
              universe={run.characterB.universe}
              category={run.characterB.category}
            />
          </div>
          <p className="mt-3 truncate text-sm font-bold text-white">
            {run.characterA.name} <span className="text-arena-text3">/</span> {run.characterB.name}
          </p>
          <p className="mt-1 text-xs text-arena-gold">{resultLabel(run)}</p>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-arena-text3">
            {run.modes.map((mode) => mode.mode).join(" · ")}
          </p>
        </Link>
      ))}
    </div>
  );
}

export default RecentBattles;
