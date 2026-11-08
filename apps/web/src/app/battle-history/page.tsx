"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { BattleMode, BattleRunResult } from "@battle-arena/shared";
import { clearRunHistory, deleteRun, listRunHistory } from "@/lib/storage";

const FILTERS: { id: "all" | BattleMode; label: string }[] = [
  { id: "all", label: "All" },
  { id: "intelligence", label: "Intelligence" },
  { id: "strength", label: "Strength" },
  { id: "overall", label: "Overall" },
];

function winnerLabel(run: BattleRunResult): string {
  const mode = run.modes[0];
  if (!mode) return "No result";
  if (mode.overall.winner === "a_wins") return `${run.characterA.name} wins`;
  if (mode.overall.winner === "b_wins") return `${run.characterB.name} wins`;
  if (mode.overall.winner === "inconclusive") return "Inconclusive";
  return "Draw";
}

export default function BattleHistoryPage() {
  const [runs, setRuns] = useState<BattleRunResult[]>([]);
  const [filter, setFilter] = useState<"all" | BattleMode>("all");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setRuns(listRunHistory());
    setLoaded(true);
  }, []);

  const filtered = runs.filter((run) =>
    filter === "all" ? true : run.modes.some((mode) => mode.mode === filter),
  );

  const remove = (runId: string) => {
    deleteRun(runId);
    setRuns(listRunHistory());
  };

  const clearAll = () => {
    if (!window.confirm("Delete every locally saved battle?")) return;
    clearRunHistory();
    setRuns([]);
  };

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-5xl px-5 pb-24 pt-12">
        <section className="text-center">
          <span className="inline-block rounded-full border border-arena-purple/30 bg-arena-purple/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-arena-purple">
            Battle history
          </span>
          <h1 className="mt-4 font-display text-4xl font-black text-white sm:text-5xl">
            SAVED <span className="gradient-text">RECORDS</span>
          </h1>
          <p className="mt-2 text-sm text-arena-text2">
            Guest mode stores results in this browser. Accounts and server history arrive in Phase E.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setFilter(entry.id)}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                  filter === entry.id
                    ? "bg-gradient-to-r from-arena-purple to-arena-blue text-white"
                    : "border border-arena-border text-arena-text3 hover:text-white"
                }`}
              >
                {entry.label}
              </button>
            ))}
          </div>
          {runs.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="rounded-full border border-arena-red/40 px-4 py-2 text-xs font-semibold text-arena-red hover:bg-arena-red/10"
            >
              Clear all
            </button>
          )}
        </div>

        {!loaded && <p className="mt-12 animate-pulse text-center text-sm text-arena-text3">Loading records…</p>}

        {loaded && filtered.length === 0 && (
          <div className="mt-12 rounded-2xl border border-dashed border-arena-border p-12 text-center">
            <p className="text-sm text-arena-text2">
              {runs.length === 0 ? "No battles saved yet." : "No battles match this mode filter."}
            </p>
            <Link
              href="/battle-setup"
              className="mt-5 inline-block rounded-full bg-gradient-to-r from-arena-purple to-arena-blue px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white"
            >
              Run your first battle
            </Link>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {filtered.map((run) => (
            <article
              key={run.runId}
              className="rounded-2xl border border-arena-border/60 bg-arena-surface/40 p-5 transition-colors hover:border-arena-purple/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate font-display text-lg font-bold text-white">
                    {run.characterA.name} <span className="text-arena-text3">vs</span> {run.characterB.name}
                  </h2>
                  <p className="mt-0.5 text-xs text-arena-text3">
                    {new Date(run.generatedAt).toLocaleString()} · seed {run.seed} · {run.engineVersion}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {run.modes.map((mode) => (
                    <span
                      key={mode.mode}
                      className="rounded-full border border-arena-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-arena-text3"
                    >
                      {mode.mode}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm">
                  <span className="text-arena-text3">Result: </span>
                  <span className="font-semibold text-arena-gold">{winnerLabel(run)}</span>
                  <span className="ml-2 font-mono text-xs text-arena-text3">
                    {run.modes[0]?.overall.aWins}–{run.modes[0]?.overall.bWins}
                  </span>
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/battle-results?run=${run.runId}`}
                    className="rounded-lg bg-arena-purple/20 px-3 py-1.5 text-xs font-semibold text-arena-purple hover:bg-arena-purple/30"
                  >
                    Open
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(run.runId)}
                    className="rounded-lg border border-arena-border px-3 py-1.5 text-xs font-semibold text-arena-text3 hover:border-arena-red hover:text-arena-red"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
