"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CharacterCategory, CharacterProfile } from "@battle-arena/shared";
import { CharacterCard } from "@/components/CharacterCard";
import { CHARACTER_ROSTER, ROSTER_UNIVERSES, characterPower } from "@/lib/roster";
import { listResearchedProfiles } from "@/lib/storage";

type SortKey = "name" | "power";

export default function CharacterExplorerPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CharacterCategory | "all">("all");
  const [universe, setUniverse] = useState("all");
  const [sort, setSort] = useState<SortKey>("name");
  const [remote, setRemote] = useState<CharacterProfile[]>([]);

  // Previously researched fighters should appear in roster search, not just in Battle Setup.
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setRemote([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/characters/search?q=${encodeURIComponent(term)}&limit=24`);
        if (!response.ok) return;
        const payload = (await response.json()) as { data?: CharacterProfile[] };
        if (cancelled) return;
        setRemote((payload.data ?? []).filter((character) => character.source === "ai-researched"));
      } catch {
        // The curated roster still works if the research cache is unavailable.
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const results = useMemo(() => {
    const combined = [...CHARACTER_ROSTER];
    for (const character of [...remote, ...listResearchedProfiles()]) {
      if (!combined.some((entry) => entry.id === character.id)) combined.push(character);
    }

    const normalized = query.trim().toLowerCase();
    return combined
      .filter((character) => {
        if (category !== "all" && character.category !== category) return false;
        if (universe !== "all" && character.universe !== universe) return false;
        if (!normalized) return true;
        return [character.name, character.universe, character.origin, character.era ?? "", ...character.aliases]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      })
      .sort((a, b) =>
        sort === "power" ? characterPower(b) - characterPower(a) : a.name.localeCompare(b.name),
      );
  }, [query, category, universe, sort, remote]);

  const researchQuery = query.trim();
  const researchHref = `/research?name=${encodeURIComponent(researchQuery)}`;

  const surprise = () => {
    const first = CHARACTER_ROSTER[Math.floor(Math.random() * CHARACTER_ROSTER.length)];
    let second = first;
    while (second.id === first.id) {
      second = CHARACTER_ROSTER[Math.floor(Math.random() * CHARACTER_ROSTER.length)];
    }
    router.push(`/battle-configuration?a=${first.id}&b=${second.id}&mode=overall`);
  };

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-12">
        <section className="text-center">
          <span className="inline-block rounded-full border border-arena-blue/30 bg-arena-blue/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-arena-blue">
            Character roster
          </span>
          <h1 className="mt-4 font-display text-4xl font-black text-white sm:text-6xl">
            EVERY <span className="gradient-text">LEGEND</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-arena-text2 sm:text-base">
            {CHARACTER_ROSTER.length} curated starters across {ROSTER_UNIVERSES.length} universes and eras.
            Fictional canon, real-world figures (living or historical) — plus anyone you research.
          </p>
          <Link
            href="/research"
            className="mt-4 inline-block rounded-full border border-arena-gold/30 bg-arena-gold/10 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-arena-gold hover:border-arena-gold hover:text-white"
          >
            Can&apos;t find someone? Research any character →
          </Link>
        </section>

        <section className="mt-8 rounded-2xl border border-arena-border/60 bg-arena-surface/40 p-4">
          <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr_auto]">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, universe, origin or ability…"
              aria-label="Search roster"
              className="rounded-lg border border-arena-border bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-arena-text3 focus:border-arena-blue focus:outline-none"
            />

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as CharacterCategory | "all")}
              aria-label="Filter by category"
              className="rounded-lg border border-arena-border bg-black/40 px-3 py-2.5 text-sm text-arena-text2 focus:border-arena-blue focus:outline-none"
            >
              <option value="all">All categories</option>
              <option value="fictional">Fictional</option>
              <option value="historical">Real world</option>
            </select>

            <select
              value={universe}
              onChange={(event) => setUniverse(event.target.value)}
              aria-label="Filter by universe"
              className="rounded-lg border border-arena-border bg-black/40 px-3 py-2.5 text-sm text-arena-text2 focus:border-arena-blue focus:outline-none"
            >
              <option value="all">All universes</option>
              {ROSTER_UNIVERSES.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              aria-label="Sort roster"
              className="rounded-lg border border-arena-border bg-black/40 px-3 py-2.5 text-sm text-arena-text2 focus:border-arena-blue focus:outline-none"
            >
              <option value="name">Sort: A–Z</option>
              <option value="power">Sort: power index</option>
            </select>

            <button
              type="button"
              onClick={surprise}
              className="rounded-lg bg-gradient-to-r from-arena-purple to-arena-blue px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white"
            >
              Surprise me
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] uppercase tracking-widest text-arena-text3">
              Showing {results.length} {results.length === 1 ? "fighter" : "fighters"} · {CHARACTER_ROSTER.length} curated + AI-researched
            </p>
            {researchQuery.length >= 1 && (
              <Link
                href={researchHref}
                className="text-[11px] font-semibold text-arena-purple underline-offset-4 hover:text-arena-blue hover:underline"
              >
                Can&apos;t find “{researchQuery}”? Research them with AI →
              </Link>
            )}
          </div>
        </section>

        {results.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-arena-border p-12 text-center">
            <p className="text-sm text-arena-text2">
              {researchQuery.length >= 1
                ? `No curated fighter matches “${researchQuery}”.`
                : "No fighter matches those filters."}
            </p>
            {researchQuery.length >= 1 && (
              <Link
                href={researchHref}
                className="mt-4 inline-block rounded-full bg-gradient-to-r from-arena-purple to-arena-blue px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white"
              >
                Research “{researchQuery}” with AI →
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
                setUniverse("all");
              }}
              className="mt-4 block w-full text-xs font-semibold text-arena-text3 underline-offset-4 hover:text-white hover:underline sm:inline sm:w-auto sm:pl-4"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
