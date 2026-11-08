"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CharacterProfile } from "@battle-arena/shared";
import { CHARACTER_ROSTER } from "@/data/characters";
import { CharacterEmblem } from "@/components/CharacterEmblem";

const FIELD_SIZE = 8;

interface Match {
  a: CharacterProfile;
  b: CharacterProfile;
  winner: CharacterProfile;
  score: string;
}

interface Round {
  label: string;
  matches: Match[];
}

function pickField(): CharacterProfile[] {
  const pool = [...CHARACTER_ROSTER];
  const picked: CharacterProfile[] = [];
  while (picked.length < FIELD_SIZE && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}

async function simulateMatch(a: CharacterProfile, b: CharacterProfile): Promise<Match> {
  const response = await fetch("/api/battle/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      a: a.id,
      b: b.id,
      modes: ["overall"],
      seed: Math.floor(Math.random() * 2_000_000_000),
    }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "A bracket match failed.");
  }

  const mode = payload.data.modes[0];
  let winner = a;
  if (mode.overall.winner === "b_wins") winner = b;
  else if (mode.overall.winner !== "a_wins") {
    winner = mode.overall.aWinRate >= mode.overall.bWinRate ? a : b;
  }

  return {
    a,
    b,
    winner,
    score: `${mode.overall.aWins}–${mode.overall.bWins}`,
  };
}

export default function TournamentPage() {
  const [field, setField] = useState<CharacterProfile[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [champion, setChampion] = useState<CharacterProfile | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setField(pickField());
  }, []);

  const shuffle = () => {
    if (running) return;
    setField(pickField());
    setRounds([]);
    setChampion(null);
    setError(null);
  };

  const run = async () => {
    if (running || field.length < FIELD_SIZE) return;
    setRunning(true);
    setError(null);
    setRounds([]);
    setChampion(null);

    try {
      let current = field;
      const labels = ["Quarter-finals", "Semi-finals", "Final"];
      const collected: Round[] = [];

      for (let index = 0; index < labels.length; index += 1) {
        const matches: Match[] = [];
        for (let slot = 0; slot < current.length; slot += 2) {
          matches.push(await simulateMatch(current[slot], current[slot + 1]));
        }
        collected.push({ label: labels[index], matches });
        setRounds([...collected]);
        current = matches.map((match) => match.winner);
      }

      setChampion(current[0] ?? null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The gauntlet failed.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-12">
        <section className="text-center">
          <span className="inline-block rounded-full border border-arena-gold/30 bg-arena-gold/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-arena-gold">
            Eight-legend gauntlet
          </span>
          <h1 className="mt-4 font-display text-4xl font-black text-white sm:text-5xl">
            GRAND <span className="gradient-text">TOURNAMENT</span>
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-arena-text2">
            A single-elimination bracket simulated live through the same engine. Seven matches, one
            champion. Ties are broken by win rate, never by narrative.
          </p>
        </section>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={run}
            disabled={running || field.length < FIELD_SIZE}
            className="rounded-full bg-gradient-to-r from-arena-purple to-arena-blue px-6 py-3 text-xs font-bold uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {running ? "Simulating bracket…" : champion ? "Run gauntlet again" : "Run gauntlet"}
          </button>
          <button
            type="button"
            onClick={shuffle}
            disabled={running}
            className="rounded-full border border-arena-border px-6 py-3 text-xs font-bold uppercase tracking-widest text-arena-text2 hover:text-white disabled:opacity-50"
          >
            Shuffle field
          </button>
        </div>

        {error && (
          <p className="mx-auto mt-5 max-w-xl rounded-xl border border-arena-red/30 bg-arena-red/10 px-4 py-3 text-center text-sm text-arena-red">
            {error}
          </p>
        )}

        {champion && (
          <section className="mt-8 rounded-3xl border border-arena-gold/40 bg-arena-gold/10 p-6 text-center animate-fade-in">
            <p className="text-[10px] uppercase tracking-[0.4em] text-arena-gold">Champion</p>
            <div className="mt-3 flex items-center justify-center gap-4">
              <CharacterEmblem name={champion.name} theme={champion.theme} size="xl" />
              <div className="text-left">
                <h2 className="font-display text-3xl font-black text-white">{champion.name}</h2>
                <p className="text-sm text-arena-text2">{champion.universe}</p>
              </div>
            </div>
            <Link
              href={`/character/${champion.id}`}
              className="mt-4 inline-block text-xs font-semibold text-arena-gold hover:underline"
            >
              View champion profile →
            </Link>
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-3 font-display text-lg font-bold text-white">Field of eight</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {field.map((character) => (
              <div
                key={character.id}
                className="flex items-center gap-2 rounded-xl border border-arena-border/50 bg-arena-surface/40 p-3"
              >
                <CharacterEmblem name={character.name} theme={character.theme} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{character.name}</p>
                  <p className="truncate text-[10px] text-arena-text3">{character.universe}</p>
                </div>
              </div>
            ))}
            {field.length === 0 && <p className="text-sm text-arena-text3">Preparing field…</p>}
          </div>
        </section>

        {rounds.length > 0 && (
          <section className="mt-10 grid gap-4 md:grid-cols-3">
            {rounds.map((round) => (
              <div key={round.label} className="rounded-2xl border border-arena-border/60 bg-arena-surface/30 p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-arena-text3">
                  {round.label}
                </h3>
                <div className="space-y-2">
                  {round.matches.map((match) => (
                    <div
                      key={`${match.a.id}-${match.b.id}`}
                      className="rounded-xl border border-arena-border/40 bg-black/30 p-3"
                    >
                      {[match.a, match.b].map((fighter) => (
                        <div
                          key={fighter.id}
                          className={`flex items-center justify-between gap-2 py-0.5 text-xs ${
                            fighter.id === match.winner.id ? "font-bold text-white" : "text-arena-text3"
                          }`}
                        >
                          <span className="truncate">{fighter.name}</span>
                          {fighter.id === match.winner.id && <span className="text-arena-green">✓</span>}
                        </div>
                      ))}
                      <p className="mt-1 font-mono text-[10px] text-arena-text3">{match.score}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        <p className="mt-8 text-center text-[11px] text-arena-text3">
          Brackets run in the browser and are not saved. Community tournaments arrive in Phase E.
        </p>
      </div>
    </main>
  );
}
