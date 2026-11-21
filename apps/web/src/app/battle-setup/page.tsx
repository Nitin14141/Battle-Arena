"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CharacterProfile } from "@battle-arena/shared";
import { CharacterSelector } from "@/components/CharacterSelector";
import { CharacterEmblem } from "@/components/CharacterEmblem";
import { characterImageFor } from "@/lib/portraits";
import { loadCharacter } from "@/lib/client-characters";

function composites(character: CharacterProfile) {
  return [
    { label: "Strategy", value: Math.round((character.intelligence.strategic + character.intelligence.tactical) / 2) },
    { label: "Adaptability", value: character.intelligence.adaptability },
    { label: "Power", value: Math.round((character.combat.strength + character.combat.attackPower) / 2) },
    { label: "Speed", value: Math.round((character.combat.speed + character.combat.reactionSpeed) / 2) },
    { label: "Durability", value: Math.round((character.combat.durability + character.combat.defence) / 2) },
  ];
}

export default function BattleSetupPage() {
  const router = useRouter();
  const [a, setA] = useState<CharacterProfile | null>(null);
  const [b, setB] = useState<CharacterProfile | null>(null);
  const [mode, setMode] = useState("overall");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const aId = params.get("a");
    const bId = params.get("b");
    setMode(params.get("mode") ?? "overall");

    (async () => {
      const [loadedA, loadedB] = await Promise.all([
        aId ? loadCharacter(aId) : Promise.resolve(null),
        bId ? loadCharacter(bId) : Promise.resolve(null),
      ]);
      if (cancelled) return;
      setA(loadedA);
      setB(loadedB);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const proceed = () => {
    if (!a || !b) {
      setError("Select both fighters before continuing.");
      return;
    }
    if (a.id === b.id) {
      setError("Choose two different fighters.");
      return;
    }
    router.push(`/battle-configuration?a=${a.id}&b=${b.id}&mode=${mode}`);
  };

  const ready = Boolean(a && b && a.id !== b.id);

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-12">
        <section className="mb-10 text-center">
          <span className="inline-block rounded-full border border-arena-purple/30 bg-arena-purple/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-arena-purple">
            Battle setup
          </span>
          <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-white sm:text-6xl">
            SELECT YOUR <span className="gradient-text">FIGHTERS</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-arena-text2 sm:text-base">
            Pick two legends from any universe or era. The engine runs ten scenarios and one hundred
            deterministic trials before a winner is declared.
          </p>
          <Link
            href="/research"
            className="mt-3 inline-block text-xs font-semibold text-arena-gold underline-offset-4 hover:text-white hover:underline"
          >
            Can&apos;t find them? Research any character →
          </Link>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
          <CharacterSelector
            side="A"
            selected={a}
            onSelect={(character) => {
              setA(character);
              setError(null);
            }}
            onClear={() => setA(null)}
            excludeId={b?.id}
          />

          <div className="flex items-center justify-center lg:pt-28">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-arena-border bg-black/60 font-display text-sm font-black tracking-widest text-arena-text3">
              VS
            </span>
          </div>

          <CharacterSelector
            side="B"
            selected={b}
            onSelect={(character) => {
              setB(character);
              setError(null);
            }}
            onClear={() => setB(null)}
            excludeId={a?.id}
          />
        </section>

        {a && b && a.id !== b.id && (
          <section className="mt-8 grid animate-fade-in gap-6 rounded-3xl border border-arena-border/60 bg-arena-surface/40 p-6 lg:grid-cols-[1fr_1.4fr_1fr] lg:items-center">
            <div className="flex items-center gap-3">
              <CharacterEmblem
                name={a.name}
                theme={a.theme}
                size="lg"
                image={characterImageFor(a)}
                universe={a.universe}
                category={a.category}
              />
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-arena-purple">Fighter A</p>
                <p className="font-display text-xl font-bold text-white">{a.name}</p>
                <p className="text-xs text-arena-text3">{a.universe}</p>
              </div>
            </div>

            <div className="space-y-3">
              {composites(a).map((row, index) => {
                const other = composites(b)[index];
                const aAhead = row.value >= other.value;
                return (
                  <div key={row.label}>
                    <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest text-arena-text3">
                      <span className={aAhead ? "text-arena-purple" : ""}>{row.value}</span>
                      <span>{row.label}</span>
                      <span className={!aAhead ? "text-arena-blue" : ""}>{other.value}</span>
                    </div>
                    <div className="flex h-1.5 gap-1">
                      <div className="flex flex-1 justify-end overflow-hidden rounded-full bg-black/50">
                        <div className="h-full rounded-full bg-arena-purple" style={{ width: `${row.value}%` }} />
                      </div>
                      <div className="flex flex-1 overflow-hidden rounded-full bg-black/50">
                        <div className="h-full rounded-full bg-arena-blue" style={{ width: `${other.value}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 lg:flex-row-reverse lg:text-right">
              <CharacterEmblem
                name={b.name}
                theme={b.theme}
                size="lg"
                image={characterImageFor(b)}
                universe={b.universe}
                category={b.category}
              />
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-arena-blue">Fighter B</p>
                <p className="font-display text-xl font-bold text-white">{b.name}</p>
                <p className="text-xs text-arena-text3">{b.universe}</p>
              </div>
            </div>
          </section>
        )}

        {error && (
          <p className="mx-auto mt-6 max-w-xl rounded-xl border border-arena-red/30 bg-arena-red/10 px-4 py-3 text-center text-sm text-arena-red">
            {error}
          </p>
        )}

        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={proceed}
            aria-disabled={!ready}
            className={`rounded-full px-10 py-4 text-sm font-bold uppercase tracking-[0.2em] transition-all ${
              ready
                ? "bg-gradient-to-r from-arena-purple to-arena-blue text-white shadow-glow hover:scale-[1.02]"
                : "cursor-not-allowed border border-arena-border bg-arena-surface text-arena-text3"
            }`}
          >
            Continue to configuration
          </button>
          <p className="text-xs text-arena-text3">
            {ready ? "Both fighters locked. Choose your battle mode next." : "Select two different fighters to continue."}
          </p>
          <Link href="/character-explorer" className="text-xs text-arena-text3 underline-offset-4 hover:text-arena-blue hover:underline">
            Browse the full roster →
          </Link>
        </div>
      </div>
    </main>
  );
}
