"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BattleRunResult } from "@battle-arena/shared";
import { readPendingBattle, saveLastRun, saveRunToHistory } from "@/lib/storage";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function BattleProgressPage() {
  const router = useRouter();
  const started = useRef(false);
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState("Preparing the simulation…");
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const pending = readPendingBattle();
    if (!pending) {
      setError("No battle is queued. Configure a matchup first.");
      return;
    }

    (async () => {
      try {
        const response = await fetch("/api/battle/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pending),
        });
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.error ?? "The simulation failed.");
        }

        const run = payload.data as BattleRunResult;
        const total = run.modes.reduce((count, mode) => count + mode.scenarioResults.length, 0);
        let completed = 0;

        for (const mode of run.modes) {
          for (const scenario of mode.scenarioResults) {
            completed += 1;
            setLabel(`${mode.mode.toUpperCase()} · ${scenario.scenarioName}`);
            setLog((previous) =>
              [...previous, `${mode.mode} — ${scenario.scenarioName} (${scenario.summary.aWins}–${scenario.summary.bWins})`].slice(-6),
            );
            setProgress(Math.round((completed / total) * 100));
            await sleep(70);
          }
        }

        saveLastRun(run);
        saveRunToHistory(run);
        setLabel("Simulation complete. Opening results…");
        setProgress(100);
        await sleep(450);
        router.push("/battle-results");
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "The simulation failed.");
      }
    })();
  }, [router]);

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-3xl px-5 py-24">
        <section className="text-center">
          <span className="inline-block rounded-full border border-arena-purple/30 bg-arena-purple/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-arena-purple">
            Simulation running
          </span>
          <h1 className="mt-4 font-display text-4xl font-black text-white sm:text-5xl">
            BATTLE <span className="gradient-text">ENGINE</span>
          </h1>
          <p className="mt-2 text-sm text-arena-text2">
            Deterministic scoring across ten scenarios. No AI decides these outcomes.
          </p>
        </section>

        {error ? (
          <div className="mt-12 rounded-2xl border border-arena-red/30 bg-arena-red/10 p-8 text-center">
            <p className="text-sm text-arena-red">{error}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/battle-configuration"
                className="rounded-full bg-gradient-to-r from-arena-purple to-arena-blue px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white"
              >
                Back to configuration
              </Link>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-full border border-arena-border px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-arena-text2 hover:text-white"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <section className="mt-12 rounded-3xl border border-arena-border/60 bg-arena-surface/40 p-6 sm:p-8">
            <div className="flex items-baseline justify-between">
              <p className="text-xs uppercase tracking-widest text-arena-text3">{label}</p>
              <p className="font-mono text-3xl font-black gradient-text">{progress}%</p>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full border border-arena-border bg-black/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-arena-purple to-arena-blue transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-6 space-y-1.5 font-mono text-[11px] text-arena-text3">
              {log.length === 0 && <p className="animate-pulse">Initialising seeded RNG…</p>}
              {log.map((entry, index) => (
                <p key={`${entry}-${index}`} className="truncate">
                  <span className="text-arena-green">✓</span> {entry}
                </p>
              ))}
            </div>

            <p className="mt-6 text-center text-[11px] text-arena-text3">
              100 trials per mode · 10 detailed reports per mode
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
