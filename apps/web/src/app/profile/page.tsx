"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { BattleRunResult } from "@battle-arena/shared";
import {
  clearRunHistory,
  deleteRun,
  listRunHistory,
  readGuestProfile,
  saveGuestProfile,
} from "@/lib/storage";

export default function ProfilePage() {
  const [name, setName] = useState("Guest Commander");
  const [draft, setDraft] = useState("Guest Commander");
  const [editing, setEditing] = useState(false);
  const [runs, setRuns] = useState<BattleRunResult[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const profile = readGuestProfile();
    setName(profile.name);
    setDraft(profile.name);
    setRuns(listRunHistory());
    setLoaded(true);
  }, []);

  const saveName = () => {
    const next = draft.trim() || "Guest Commander";
    setName(next);
    saveGuestProfile({ name: next });
    setEditing(false);
  };

  const refresh = () => setRuns(listRunHistory());

  const remove = (runId: string) => {
    deleteRun(runId);
    refresh();
  };

  const clearAll = () => {
    if (!window.confirm("Delete every locally saved battle?")) return;
    clearRunHistory();
    setRuns([]);
  };

  const modesPlayed = new Set(runs.flatMap((run) => run.modes.map((mode) => mode.mode))).size;
  const fightersUsed = new Set(runs.flatMap((run) => [run.characterA.name, run.characterB.name])).size;
  const totalTrials = runs.reduce(
    (sum, run) => sum + run.modes.reduce((modeSum, mode) => modeSum + mode.overall.totalTrials, 0),
    0,
  );

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-5xl px-5 pb-24 pt-12">
        <section className="rounded-3xl border border-arena-border/60 bg-arena-surface/40 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-arena-purple to-arena-blue font-display text-3xl font-black text-white shadow-glow">
              {name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 text-center sm:text-left">
              {editing ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    maxLength={32}
                    aria-label="Display name"
                    className="rounded-lg border border-arena-border bg-black/40 px-3 py-2 text-sm text-white focus:border-arena-blue focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={saveName}
                    className="rounded-lg bg-gradient-to-r from-arena-purple to-arena-blue px-4 py-2 text-xs font-bold uppercase tracking-widest text-white"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(name);
                      setEditing(false);
                    }}
                    className="rounded-lg border border-arena-border px-4 py-2 text-xs font-semibold text-arena-text2"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="font-display text-3xl font-black text-white">{name}</h1>
                  <p className="mt-1 text-xs uppercase tracking-[0.3em] text-arena-text3">Guest profile · local only</p>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="mt-3 rounded-lg border border-arena-border px-4 py-2 text-xs font-semibold text-arena-text2 hover:border-arena-blue hover:text-white"
                  >
                    Edit name
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-arena-text3">
            Account sign-in, cloud-saved battles and cross-device history are part of Phase E. Until
            then everything here stays in this browser and can be deleted at any time.
          </p>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Saved battles", value: runs.length, tone: "text-arena-purple" },
            { label: "Modes played", value: modesPlayed, tone: "text-arena-blue" },
            { label: "Fighters used", value: fightersUsed, tone: "text-arena-gold" },
            { label: "Trials run", value: totalTrials, tone: "text-arena-green" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-arena-border/60 bg-arena-surface/40 p-4 text-center">
              <p className={`font-mono text-3xl font-black ${stat.tone}`}>{stat.value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-arena-text3">{stat.label}</p>
            </div>
          ))}
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-white">Saved battles</h2>
            {runs.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="rounded-full border border-arena-red/40 px-4 py-1.5 text-xs font-semibold text-arena-red hover:bg-arena-red/10"
              >
                Clear all
              </button>
            )}
          </div>

          {!loaded && <p className="mt-4 animate-pulse text-sm text-arena-text3">Loading…</p>}

          {loaded && runs.length === 0 && (
            <div className="mt-4 rounded-2xl border border-dashed border-arena-border p-10 text-center">
              <p className="text-sm text-arena-text2">No battles saved yet.</p>
              <Link
                href="/battle-setup"
                className="mt-4 inline-block rounded-full bg-gradient-to-r from-arena-purple to-arena-blue px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white"
              >
                Start a battle
              </Link>
            </div>
          )}

          <div className="mt-4 space-y-2">
            {runs.map((run) => (
              <div
                key={run.runId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-arena-border/60 bg-arena-surface/30 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    {run.characterA.name} <span className="text-arena-text3">vs</span> {run.characterB.name}
                  </p>
                  <p className="text-[11px] text-arena-text3">
                    {new Date(run.generatedAt).toLocaleString()} · {run.modes.length} mode(s)
                  </p>
                </div>
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
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
