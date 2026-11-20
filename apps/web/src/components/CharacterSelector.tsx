"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { CharacterCategory, CharacterProfile } from "@battle-arena/shared";
import { CHARACTER_ROSTER } from "@/data/characters";
import { CharacterEmblem } from "@/components/CharacterEmblem";
import { listResearchedProfiles, saveResearchedProfile } from "@/lib/storage";

const CATEGORY_TABS: { id: CharacterCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fictional", label: "Fictional" },
  { id: "historical", label: "Real world" },
];

function overall(character: CharacterProfile): number {
  const values = [...Object.values(character.intelligence), ...Object.values(character.combat)];
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function CharacterSelector({
  side,
  selected,
  onSelect,
  onClear,
  excludeId,
}: {
  side: "A" | "B";
  selected: CharacterProfile | null;
  onSelect: (character: CharacterProfile) => void;
  onClear: () => void;
  excludeId?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CharacterCategory | "all">("all");
  const [remote, setRemote] = useState<CharacterProfile[]>([]);
  const [researching, setResearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search previously researched fighters as the user types.
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setRemote([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/characters/search?q=${encodeURIComponent(term)}&limit=20`);
        if (!response.ok) return;
        const payload = (await response.json()) as { data?: CharacterProfile[] };
        if (cancelled) return;
        setRemote((payload.data ?? []).filter((character) => character.source === "ai-researched"));
      } catch {
        // Offline search simply falls back to the curated roster.
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const combined = [...CHARACTER_ROSTER];

    // Profiles researched in this browser survive even if the server cache is gone.
    for (const character of [...remote, ...listResearchedProfiles()]) {
      if (!combined.some((entry) => entry.id === character.id)) combined.push(character);
    }

    return combined
      .filter((character) => {
        if (character.id === excludeId) return false;
        if (category !== "all" && character.category !== category) return false;
        if (!normalized) return true;
        return [
          character.name,
          character.universe,
          character.origin,
          character.era ?? "",
          ...character.aliases,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      })
      .slice(0, 8);
  }, [query, category, excludeId, remote]);

  const accentClass = side === "A" ? "text-arena-purple" : "text-arena-blue";

  const research = async () => {
    const name = query.trim();
    if (name.length < 1 || researching) return;

    setResearching(true);
    setError(null);
    try {
      const response = await fetch("/api/characters/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const payload = (await response.json()) as {
        data?: { character: CharacterProfile };
        error?: string;
        detail?: string;
      };

      if (!response.ok || !payload.data?.character) {
        throw new Error(payload.error || "Research failed.");
      }

      saveResearchedProfile(payload.data.character);
      onSelect(payload.data.character);
      setQuery("");
      setRemote([]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Research failed.");
    } finally {
      setResearching(false);
    }
  };

  if (selected) {
    return (
      <div className="glass flex h-full flex-col rounded-3xl border border-arena-border/60 p-6">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold uppercase tracking-[0.3em] ${accentClass}`}>Fighter {side}</span>
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-arena-text3 underline-offset-4 hover:text-white hover:underline"
          >
            Change
          </button>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <CharacterEmblem name={selected.name} theme={selected.theme} size="lg" />
          <div className="min-w-0">
            <h3 className="truncate font-display text-2xl font-bold text-white">{selected.name}</h3>
            <p className="truncate text-sm text-arena-text2">{selected.universe}</p>
            <p className="mt-1 text-[11px] uppercase tracking-widest text-arena-text3">
              {selected.category === "historical" ? "real world" : "fictional"} · {selected.origin}
            </p>
          </div>
        </div>

        {selected.source === "ai-researched" && (
          <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-arena-gold/40 bg-arena-gold/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-arena-gold">
            ✦ AI researched
          </p>
        )}

        {selected.evidence.some((line) => line.includes("Baseline fallback")) && (
          <p className="mt-2 rounded-lg border border-arena-orange/30 bg-arena-orange/10 px-2.5 py-2 text-[10px] leading-relaxed text-arena-orange">
            Baseline profile — the AI could not validate full attributes. Change and research
            again for a better profile.
          </p>
        )}

        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-arena-text2">{selected.description}</p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-arena-border/50 bg-black/30 p-2">
            <p className="font-mono text-lg font-bold text-arena-blue">{overall(selected)}</p>
            <p className="text-[10px] uppercase tracking-widest text-arena-text3">Overall</p>
          </div>
          <div className="rounded-xl border border-arena-border/50 bg-black/30 p-2">
            <p className="font-mono text-lg font-bold text-arena-purple">{selected.combat.attackPower}</p>
            <p className="text-[10px] uppercase tracking-widest text-arena-text3">Attack</p>
          </div>
          <div className="rounded-xl border border-arena-border/50 bg-black/30 p-2">
            <p className="font-mono text-lg font-bold text-arena-gold">{selected.intelligence.strategic}</p>
            <p className="text-[10px] uppercase tracking-widest text-arena-text3">Strategy</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {selected.abilities.slice(0, 4).map((ability) => (
            <span
              key={ability}
              className="rounded-full border border-arena-purple/25 bg-arena-purple/10 px-2.5 py-1 text-[11px] text-arena-purple"
            >
              {ability}
            </span>
          ))}
        </div>

        <Link
          href={`/character/${selected.id}`}
          className="mt-auto pt-5 text-xs font-semibold text-arena-text3 underline-offset-4 hover:text-arena-blue hover:underline"
        >
          View full profile →
        </Link>
      </div>
    );
  }

  return (
    <div className="glass flex h-full flex-col rounded-3xl border border-arena-border/60 p-6">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-black text-white ${
            side === "A"
              ? "bg-gradient-to-tr from-arena-purple to-arena-purple2 shadow-glow"
              : "bg-gradient-to-tr from-arena-blue to-arena-blue2 shadow-glowBlue"
          }`}
        >
          {side}
        </span>
        <div>
          <h2 className="font-display text-xl font-bold text-white">Fighter {side}</h2>
          <p className="text-xs text-arena-text3">
            {CHARACTER_ROSTER.length} curated · research any character
          </p>
        </div>
      </div>

      <div className="mt-5">
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && query.trim().length >= 1) {
              event.preventDefault();
              void research();
            }
          }}
          placeholder="Search any character…"
          aria-label={`Search fighter ${side}`}
          className="w-full rounded-xl border border-arena-border bg-black/40 px-4 py-3 text-sm text-white placeholder:text-arena-text3 focus:border-arena-blue focus:outline-none focus:ring-1 focus:ring-arena-blue"
        />
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-arena-text3">
        Side character? Add the show or film in brackets, e.g. “Jaggu (Chhota Bheem)”.
      </p>

      {query.trim().length >= 1 && (
        <button
          type="button"
          onClick={() => void research()}
          disabled={researching}
          className={`mt-3 w-full rounded-lg px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all ${
            researching
              ? "cursor-wait border border-arena-border bg-arena-surface/40 text-arena-text3"
              : "bg-gradient-to-r from-arena-purple to-arena-blue text-white hover:shadow-glow"
          }`}
        >
          {researching
            ? "Researching… usually under 30s"
            : `✦ Research “${query.trim().slice(0, 28)}” with AI`}
        </button>
      )}

      {researching && (
        <p
          role="status"
          className="mt-2 rounded-lg border border-arena-purple/25 bg-arena-purple/10 px-2.5 py-2 text-[10px] leading-relaxed text-arena-text2"
        >
          Researching “{query.trim()}”… free models usually answer in under 30 seconds.
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-arena-red/30 bg-arena-red/10 px-2.5 py-2 text-[11px] leading-relaxed text-arena-red">
          {error}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCategory(tab.id)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
              category === tab.id
                ? "bg-gradient-to-r from-arena-purple to-arena-blue text-white"
                : "border border-arena-border text-arena-text3 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 max-h-[19rem] space-y-2 overflow-y-auto pr-1">
        {results.length === 0 && (
          <div className="rounded-xl border border-dashed border-arena-border p-4 text-center">
            {query.trim().length >= 1 ? (
              <p className="text-sm text-arena-text3">
                No curated fighter matches “{query.trim()}”. Use the research button above to add them.
              </p>
            ) : (
              <p className="text-sm text-arena-text3">No curated fighter matches those filters.</p>
            )}
          </div>
        )}
        {results.map((character) => (
          <button
            key={character.id}
            type="button"
            onClick={() => onSelect(character)}
            className="group flex w-full items-center gap-3 rounded-xl border border-arena-border/50 bg-black/25 p-3 text-left transition-colors hover:border-arena-purple/50 hover:bg-arena-surface/60"
          >
            <CharacterEmblem name={character.name} theme={character.theme} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-sm font-bold text-white group-hover:text-arena-blue">
                  {character.name}
                </span>
                {character.source === "ai-researched" && (
                  <span className="shrink-0 rounded border border-arena-gold/40 px-1 py-0.5 text-[9px] font-bold text-arena-gold">
                    AI
                  </span>
                )}
              </span>
              <span className="block truncate text-[11px] text-arena-text3">
                {character.universe} · {character.category === "historical" ? "real world" : "fictional"}
              </span>
            </span>
            <span className="font-mono text-xs text-arena-text2">{overall(character)}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-arena-purple/25 bg-gradient-to-br from-arena-purple/10 to-arena-blue/5 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-arena-purple">
          Any universe · AI research
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-arena-text2">
          Can&apos;t find them? A free open-weight model reads Wikipedia evidence and builds a
          complete, validated profile. The engine still decides the fight.
        </p>
        <Link
          href={query.trim().length >= 1 ? `/research?name=${encodeURIComponent(query.trim())}` : "/research"}
          className="mt-3 inline-block text-[11px] font-semibold text-arena-gold underline-offset-4 hover:text-white hover:underline"
        >
          Open the full research page →
        </Link>
        <p className="mt-2 text-[10px] text-arena-text3">
          Free models only · no paid fallback · cached after the first run
        </p>
      </div>
    </div>
  );
}

export default CharacterSelector;
