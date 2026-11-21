"use client";

import React, { useEffect, useState } from "react";
import type { CharacterCategory, EmblemTheme } from "@battle-arena/shared";

const THEMES: Record<EmblemTheme, { from: string; to: string; ring: string; glow: string }> = {
  violet: { from: "#5b21b6", to: "#b026ff", ring: "#c084fc", glow: "rgba(176,38,255,0.45)" },
  crimson: { from: "#7f1d1d", to: "#ff3b3b", ring: "#f87171", glow: "rgba(255,59,59,0.4)" },
  azure: { from: "#1e3a8a", to: "#00d4ff", ring: "#7dd3fc", glow: "rgba(0,212,255,0.4)" },
  emerald: { from: "#064e3b", to: "#22c55e", ring: "#86efac", glow: "rgba(34,197,94,0.4)" },
  amber: { from: "#78350f", to: "#f59e0b", ring: "#fcd34d", glow: "rgba(245,158,11,0.4)" },
  steel: { from: "#1e293b", to: "#94a3b8", ring: "#cbd5e1", glow: "rgba(148,163,184,0.35)" },
  rose: { from: "#831843", to: "#fb7185", ring: "#fda4af", glow: "rgba(251,113,133,0.4)" },
  teal: { from: "#134e4a", to: "#2dd4bf", ring: "#5eead4", glow: "rgba(45,212,191,0.4)" },
};

const SIZES = {
  sm: "h-10 w-10 text-sm rounded-lg",
  md: "h-14 w-14 text-lg rounded-xl",
  lg: "h-20 w-20 text-2xl rounded-2xl",
  xl: "h-32 w-32 text-3xl rounded-3xl",
} as const;

function initialsFor(name: string): string {
  const words = name.split(/\s+/).filter((word) => /[A-Za-z]/.test(word));
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

/**
 * Fighters whose portrait is not stored on the profile (for example a profile
 * cached before portraits existed) are looked up once per page session.
 */
/** Public CDNs are served through our own origin (some block hotlinking). */
function portraitSrc(url: string): string {
  if (url.startsWith("/")) return url;
  return `/api/character-image/proxy?url=${encodeURIComponent(url)}`;
}

const portraitCache = new Map<string, string | null>();
const portraitRequests = new Map<string, Promise<string | null>>();

function lookupPortrait(
  name: string,
  universe?: string | null,
  category?: CharacterCategory | null,
): Promise<string | null> {
  const key = `${name}|${universe ?? ""}|${category ?? ""}`.toLowerCase();
  if (portraitCache.has(key)) return Promise.resolve(portraitCache.get(key) ?? null);
  const running = portraitRequests.get(key);
  if (running) return running;

  const params = new URLSearchParams({ name });
  if (universe) params.set("universe", universe);
  if (category) params.set("category", category);

  const request = fetch(`/api/character-image?${params.toString()}`)
    .then((response) => (response.ok ? response.json() : null))
    .then((body: { data?: { url?: string } } | null) => {
      const url = body?.data?.url ?? null;
      portraitCache.set(key, url);
      return url;
    })
    .catch(() => {
      portraitCache.set(key, null);
      return null;
    })
    .finally(() => portraitRequests.delete(key));

  portraitRequests.set(key, request);
  return request;
}

export function CharacterEmblem({
  name,
  theme,
  size = "md",
  className = "",
  image,
  universe,
  category,
}: {
  name: string;
  theme: EmblemTheme;
  size?: keyof typeof SIZES;
  className?: string;
  /** Known portrait. When omitted the component resolves one automatically. */
  image?: string | null;
  universe?: string | null;
  category?: CharacterCategory | null;
}) {
  const palette = THEMES[theme] ?? THEMES.steel;
  const [source, setSource] = useState<string | null>(image ?? null);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setSource(image ?? null);
    setBroken(false);
  }, [image]);

  useEffect(() => {
    if (image) return;
    let active = true;
    lookupPortrait(name, universe, category).then((url) => {
      if (active && url) setSource(url);
    });
    return () => {
      active = false;
    };
  }, [name, universe, category, image]);

  const showPortrait = Boolean(source) && !broken;

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-white/15 font-display font-black text-white ${SIZES[size]} ${className}`}
      style={{
        backgroundImage: `linear-gradient(140deg, ${palette.from} 0%, ${palette.to} 100%)`,
        boxShadow: `0 0 24px -6px ${palette.glow}`,
      }}
    >
      {showPortrait ? (
        // eslint-disable-next-line @next/next/no-img-element -- portraits come from many public hosts
        <img
          src={source ? portraitSrc(source) : undefined}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      ) : (
        <>
          <span className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]" />
          <span className="relative tracking-tight drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
            {initialsFor(name)}
          </span>
        </>
      )}
      <span
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset"
        style={{ borderColor: palette.ring }}
      />
    </div>
  );
}

export default CharacterEmblem;
