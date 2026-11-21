"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BattleMode, CharacterProfile } from "@battle-arena/shared";
import { CharacterEmblem } from "@/components/CharacterEmblem";
import { characterImageFor } from "@/lib/portraits";
import { loadCharacter } from "@/lib/client-characters";
import { savePendingBattle } from "@/lib/storage";

const MODE_OPTIONS: {
  id: BattleMode;
  title: string;
  description: string;
  icon: string;
  accent: string;
}[] = [
  {
    id: "intelligence",
    title: "Intelligence",
    description: "Strategy, prediction, deception and resource control. Raw strength is not enough here.",
    icon: "🧠",
    accent: "border-arena-blue/50 bg-arena-blue/10",
  },
  {
    id: "strength",
    title: "Strength",
    description: "Direct combat: power, speed, durability, abilities and equipment.",
    icon: "⚔️",
    accent: "border-arena-red/50 bg-arena-red/10",
  },
  {
    id: "overall",
    title: "Overall",
    description: "Every capability interacting. A weaker fighter can win through preparation or counters.",
    icon: "🌌",
    accent: "border-arena-purple/50 bg-arena-purple/10",
  },
];

const SCENARIOS = [
  "Standard battle",
  "Maximum eligible power",
  "No preparation",
  "Full preparation",
  "Complete knowledge of opponent",
  "Limited equipment",
  "Full standard equipment",
  "Unfamiliar environment",
  "Tactical challenge",
  "Randomized conditions",
];

export default function BattleConfigurationPage() {
  const router = useRouter();
  const [a, setA] = useState<CharacterProfile | null>(null);
  const [b, setB] = useState<CharacterProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [modes, setModes] = useState<BattleMode[]>(["overall"]);
  const [seed, setSeed] = useState(20261107);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const aId = params.get("a");
    const bId = params.get("b");
    const requested = params.get("mode") as BattleMode | null;
    if (requested && MODE_OPTIONS.some((option) => option.id === requested)) {
      setModes([requested]);
    }

    (async () => {
      const [loadedA, loadedB] = await Promise.all([
        aId ? loadCharacter(aId) : Promise.resolve(null),
        bId ? loadCharacter(bId) : Promise.resolve(null),
      ]);
      if (cancelled) return;
      setA(loadedA);
      setB(loadedB);
      setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleMode = (mode: BattleMode) => {
    setModes((current) =>
      current.includes(mode) ? current.filter((entry) => entry !== mode) : [...current, mode],
    );
    setError(null);
  };

  const start = () => {
    if (!a || !b) return;
    if (modes.length === 0) {
      setError("Select at least one battle mode.");
      return;
    }
    savePendingBattle({ a: a.id, b: b.id, modes, seed });
    router.push("/battle-progress");
  };

  if (!loaded) {
    return (
      <main className="page-shell flex min-h-[60vh] items-center justify-center">
        <p className="animate-pulse text-sm uppercase tracking-[0.3em] text-arena-text3">Loading configuration…</p>
      </main>
    );
  }

  if (!a || !b) {
    return (
      <main className="page-shell">
        <div className="mx-auto max-w-2xl px-5 py-24 text-center">
          <h1 className="font-display text-3xl font-black text-white">No matchup selected</h1>
          <p className="mt-2 text-sm text-arena-text2">
            Choose two fighters first, then come back to configure the battle.
          </p>
          <Link
            href="/battle-setup"
            className="mt-6 inline-block rounded-full bg-gradient-to-r from-arena-purple to-arena-blue px-6 py-3 text-sm font-bold uppercase tracking-widest text-white"
          >
            Select fighters
          </Link>
        </div>
      </main>
    );
  }

  const totalTrials = modes.length * 100;

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-12">
        <section className="text-center">
          <span className="inline-block rounded-full border border-arena-blue/30 bg-arena-blue/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-arena-blue">
            Battle configuration
          </span>
          <h1 className="mt-4 font-display text-4xl font-black text-white sm:text-5xl">
            SET THE <span className="gradient-text">CONDITIONS</span>
          </h1>
        </section>

        <section className="mt-10 flex items-center justify-center gap-4 rounded-3xl border border-arena-border/60 bg-arena-surface/40 p-5">
          <CharacterEmblem
            name={a.name}
            theme={a.theme}
            size="md"
            image={characterImageFor(a)}
            universe={a.universe}
            category={a.category}
          />
          <div className="text-center">
            <p className="text-sm font-bold text-white">{a.name}</p>
            <p className="text-[11px] uppercase tracking-widest text-arena-purple">A</p>
          </div>
          <span className="mx-2 font-display text-lg font-black text-arena-text3">VS</span>
          <div className="text-center">
            <p className="text-sm font-bold text-white">{b.name}</p>
            <p className="text-[11px] uppercase tracking-widest text-arena-blue">B</p>
          </div>
          <CharacterEmblem
            name={b.name}
            theme={b.theme}
            size="md"
            image={characterImageFor(b)}
            universe={b.universe}
            category={b.category}
          />
        </section>

        <section className="mt-10">
          <h2 className="mb-4 font-display text-xl font-bold text-white">Battle modes</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {MODE_OPTIONS.map((option) => {
              const active = modes.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleMode(option.id)}
                  aria-pressed={active}
                  className={`rounded-2xl border p-5 text-left transition-all ${
                    active
                      ? `${option.accent} shadow-[0_0_30px_-12px_rgba(176,38,255,0.5)]`
                      : "border-arena-border/60 bg-arena-surface/30 hover:border-arena-text3/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{option.icon}</span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border text-[11px] ${
                        active
                          ? "border-arena-blue bg-arena-blue text-black"
                          : "border-arena-border text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-bold text-white">{option.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-arena-text2">{option.description}</p>
                </button>
              );
            })}
          </div>
          {error && <p className="mt-3 text-sm text-arena-red">{error}</p>}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-arena-border/60 bg-arena-surface/30 p-5">
            <h2 className="font-display text-lg font-bold text-white">Scenarios applied to every mode</h2>
            <p className="mt-1 text-xs text-arena-text3">
              Each scenario runs ten trials. Ten scenarios × ten trials = 100 trials per mode.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {SCENARIOS.map((scenario, index) => (
                <div
                  key={scenario}
                  className="flex items-center gap-2 rounded-lg border border-arena-border/40 bg-black/25 px-3 py-2 text-xs text-arena-text2"
                >
                  <span className="font-mono text-[10px] text-arena-text3">{String(index + 1).padStart(2, "0")}</span>
                  {scenario}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-arena-border/60 bg-arena-surface/30 p-5">
              <h2 className="font-display text-lg font-bold text-white">Run summary</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-arena-text3">Modes selected</dt>
                  <dd className="font-mono text-arena-text2">{modes.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-arena-text3">Trials per mode</dt>
                  <dd className="font-mono text-arena-text2">100</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-arena-text3">Total trials</dt>
                  <dd className="font-mono text-arena-gold">{totalTrials}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-arena-text3">Reports</dt>
                  <dd className="font-mono text-arena-text2">{modes.length * 10}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-arena-border/60 bg-arena-surface/30 p-5">
              <label htmlFor="seed" className="block text-xs font-bold uppercase tracking-widest text-arena-text3">
                Random seed
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="seed"
                  type="number"
                  value={seed}
                  onChange={(event) => setSeed(Number(event.target.value) || 0)}
                  className="w-full rounded-lg border border-arena-border bg-black/40 px-3 py-2 font-mono text-sm text-white focus:border-arena-blue focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSeed(Math.floor(Math.random() * 2_000_000_000))}
                  className="rounded-lg border border-arena-border px-3 py-2 text-xs font-semibold text-arena-text2 hover:border-arena-blue hover:text-white"
                >
                  Randomize
                </button>
              </div>
              <p className="mt-2 text-[11px] text-arena-text3">
                The same seed reproduces the same result exactly.
              </p>
            </div>

            <button
              type="button"
              onClick={start}
              className="w-full rounded-xl bg-gradient-to-r from-arena-purple to-arena-blue px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-glow transition-transform hover:scale-[1.01]"
            >
              Run {totalTrials} trials
            </button>
            <Link href="/battle-setup" className="block text-center text-xs text-arena-text3 hover:text-white">
              ← Change fighters
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
