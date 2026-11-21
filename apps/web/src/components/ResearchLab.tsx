"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { CharacterProfile } from "@battle-arena/shared";
import { CharacterEmblem } from "@/components/CharacterEmblem";
import { characterImageFor } from "@/lib/portraits";
import { saveResearchedProfile } from "@/lib/storage";

interface ResearchMeta {
  model: string;
  sources: { title: string; url: string }[];
  cached: boolean;
  sourced: boolean;
  fallback?: boolean;
}

interface ResearchData {
  character: CharacterProfile;
  meta?: ResearchMeta;
}

const EXAMPLES = [
  "Lionel Messi",
  "Gandhi",
  "Beyonder",
  "Jaggu (Chhota Bheem)",
];

export function ResearchLab() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("name");
    if (initial) setName(initial);
  }, []);

  const research = async (subject?: string) => {
    const target = (subject ?? name).trim();
    if (target.length < 1 || loading) return;

    setName(target);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/characters/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: target }),
      });
      const payload = (await response.json()) as {
        data?: ResearchData;
        error?: string;
        detail?: string;
      };

      if (!response.ok || !payload.data?.character) {
        throw new Error(payload.error || "The research request failed.");
      }

      saveResearchedProfile(payload.data.character);
      setResult(payload.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The research request failed.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setName("");
    inputRef.current?.focus();
  };

  const meta = result?.meta;
  const resultSources = meta?.sources ?? [];
  const resultCached = meta?.cached ?? false;
  const resultSourced = meta?.sourced ?? true;
  const resultFallback = meta?.fallback ?? false;

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-arena-border/60 bg-arena-surface/40">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void research();
        }}
        className="border-b border-arena-border/50 p-5 sm:p-6"
      >
        <label htmlFor="research-name" className="text-[10px] font-bold uppercase tracking-[0.3em] text-arena-purple">
          Person or character
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="research-name"
            ref={inputRef}
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
            placeholder="Anyone — Messi, Gandhi, side characters…"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-xl border border-arena-border bg-black/40 px-4 py-3 text-sm text-white placeholder:text-arena-text3 focus:border-arena-blue focus:outline-none focus:ring-1 focus:ring-arena-blue"
          />
          <button
            type="submit"
            disabled={loading || name.trim().length < 1}
            className={`rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
              loading || name.trim().length < 1
                ? "cursor-not-allowed border border-arena-border bg-arena-surface/40 text-arena-text3"
                : "bg-gradient-to-r from-arena-purple to-arena-blue text-white shadow-glow hover:scale-[1.01]"
            }`}
          >
            {loading ? "Researching…" : "Research fighter"}
          </button>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-arena-text3">
          For a side character, add the show or film in brackets — for example “Jaggu (Chhota Bheem)”.
          Free models only; a cold profile usually takes a few seconds to about 30 seconds and is then cached.
        </p>
      </form>

      <div className="p-5 sm:p-6">
        {loading && (
          <div role="status" aria-live="polite" className="rounded-2xl border border-arena-purple/30 bg-arena-purple/10 p-5">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-arena-purple" />
              <p className="text-sm font-semibold text-white">Researching “{name.trim()}”…</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-arena-text2">
              Reading public evidence, building the profile, and validating it. Free models can be
              slow or return bad JSON; the pipeline retries once and then falls back to a baseline.
              Please don’t close this page.
            </p>
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-2xl border border-arena-red/30 bg-arena-red/10 p-5">
            <p className="text-sm font-semibold text-arena-red">{error}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-arena-text2">
              Free models occasionally time out or return malformed data. Try again; if the name is
              ambiguous, add the show or film in brackets.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void research()}
                className="rounded-full bg-gradient-to-r from-arena-purple to-arena-blue px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-arena-border px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-arena-text2 hover:text-white"
              >
                Change name
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="animate-fade-in">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <CharacterEmblem
                name={result.character.name}
                theme={result.character.theme}
                size="lg"
                image={characterImageFor(result.character)}
                universe={result.character.universe}
                category={result.character.category}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-arena-purple/30 bg-arena-purple/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-arena-purple">
                    {result.character.category === "historical" ? "Real world" : "Fictional"}
                  </span>
                  <span className="rounded-full border border-arena-border bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-arena-text2">
                    {result.character.universe}
                  </span>
                  <span className="rounded-full border border-arena-gold/40 bg-arena-gold/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-arena-gold">
                    {resultFallback
                      ? "Baseline profile"
                      : resultCached
                        ? "Cached profile"
                        : "AI researched"}
                  </span>
                  {!resultSourced && (
                    <span className="rounded-full border border-arena-orange/40 bg-arena-orange/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-arena-orange">
                      Unverified
                    </span>
                  )}
                </div>
                <h2 className="mt-2 font-display text-3xl font-black text-white">{result.character.name}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-arena-text2">
                  {result.character.description}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {result.character.abilities.slice(0, 8).map((ability) => (
                <span
                  key={ability}
                  className="rounded-full border border-arena-purple/25 bg-arena-purple/10 px-2.5 py-1 text-[11px] text-arena-purple"
                >
                  {ability}
                </span>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={`/battle-setup?a=${result.character.id}`}
                className="rounded-full bg-gradient-to-r from-arena-purple to-arena-blue px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white"
              >
                Fight as {result.character.name}
              </Link>
              <Link
                href={`/character/${result.character.id}`}
                className="rounded-full border border-arena-border px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-arena-text2 hover:text-white"
              >
                Full profile
              </Link>
              {resultFallback && (
                <button
                  type="button"
                  onClick={() => void research(result.character.name)}
                  className="rounded-full border border-arena-orange/40 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-arena-orange hover:text-white"
                >
                  Try full research again
                </button>
              )}
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-arena-border px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-arena-text3 hover:text-white"
              >
                Research another
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-arena-border/50 bg-black/25 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-arena-text3">Evidence</p>
              {resultSources.length > 0 ? (
                <ul className="mt-2 space-y-1 text-xs text-arena-text3">
                  {resultSources.map((source) => (
                    <li key={source.url}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline-offset-4 hover:text-arena-blue hover:underline"
                      >
                        {source.title}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="mt-2 space-y-1 text-xs text-arena-text3">
                  {result.character.evidence.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
              )}
              {resultCached && (
                <p className="mt-2 text-[10px] text-arena-text3">Loaded from cache — no AI request was made.</p>
              )}
              {resultFallback && (
                <p className="mt-2 text-[10px] leading-relaxed text-arena-orange">
                  The AI could not validate a full profile. This fighter uses conservative baseline
                  attributes so you can still battle; try again for researched attributes.
                </p>
              )}
            </div>
          </div>
        )}

        {!loading && !error && !result && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-arena-text3">
              Try one of these
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => void research(example)}
                  disabled={loading}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-arena-border/60 bg-black/25 px-4 py-3 text-left transition-colors hover:border-arena-purple/50 hover:bg-arena-surface/60 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="text-sm font-semibold text-white">{example}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-arena-purple">
                    Research →
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-arena-text3">
              The 44 curated fighters are a starting roster, not a limit. Any fictional character or
              any real person — living or historical — can be researched. Misspellings and small side
              characters are supported; add the show or film in brackets when a name is ambiguous.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default ResearchLab;
