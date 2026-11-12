import Link from "next/link";
import { ArenaImage } from "@/components/ui/ArenaImage";
import { CharacterCard } from "@/components/CharacterCard";
import { CharacterEmblem } from "@/components/CharacterEmblem";
import { RecentBattles } from "@/components/RecentBattles";
import { ARENA_GALLERY, ARENA_IMAGES } from "@/lib/images";
import { CHARACTER_ROSTER, getCharacterById, rosterStats } from "@/lib/roster";

const MODES = [
  {
    id: "intelligence",
    title: "Intelligence",
    icon: "🧠",
    description: "Strategy, prediction, deception and resource control. Strength alone cannot win this mode.",
    accent: "from-arena-blue/20 to-transparent",
    href: "/battle-setup?mode=intelligence",
  },
  {
    id: "strength",
    title: "Strength",
    icon: "⚔️",
    description: "Direct combat across power, speed, durability, abilities and equipment.",
    accent: "from-arena-red/20 to-transparent",
    href: "/battle-setup?mode=strength",
  },
  {
    id: "overall",
    title: "Overall",
    icon: "🌌",
    description: "Every capability interacting. Preparation and counters can overturn a power gap.",
    accent: "from-arena-purple/20 to-transparent",
    href: "/battle-setup?mode=overall",
  },
];

const FEATURED = [
  { a: "gojo-satoru", b: "ryomen-sukuna", label: "Infinity vs Dismantle" },
  { a: "superman", b: "goku", label: "The eternal crossover" },
  { a: "batman", b: "light-yagami", label: "Prep vs information" },
  { a: "alexander-the-great", b: "napoleon-bonaparte", label: "Campaign speed" },
];

const PREVIEW_IDS = [
  "gojo-satoru",
  "ryomen-sukuna",
  "superman",
  "batman",
  "sun-tzu",
  "miyamoto-musashi",
  "wonder-woman",
  "darth-vader",
];

export default function HomePage() {
  const stats = rosterStats();
  const preview = PREVIEW_IDS.map((id) => getCharacterById(id)).filter(Boolean);
  const featured = FEATURED.map((entry) => ({
    ...entry,
    characterA: getCharacterById(entry.a),
    characterB: getCharacterById(entry.b),
  })).filter((entry) => entry.characterA && entry.characterB);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-arena-border/40">
        <ArenaImage
          src={ARENA_IMAGES.hero}
          alt="Celestial ring fortress arena"
          className="absolute inset-0 h-full w-full"
          sizes="100vw"
          priority
          overlay
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,5,11,0.25),rgba(5,5,11,0.9))]" />
        <div className="absolute inset-0 arena-grid opacity-40" />

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 text-center sm:px-5 sm:pb-28 sm:pt-28">
          <span className="inline-flex max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-arena-purple/30 bg-black/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-arena-text2 backdrop-blur sm:px-4 sm:tracking-[0.3em]">
            <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-arena-green" />
            Engine online · 100 trials<span className="hidden sm:inline"> per mode</span>
          </span>

          <h1 className="mt-5 font-display text-[clamp(1.65rem,8.8vw,6rem)] font-black leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl">
            EVERY UNIVERSE.
            <br />
            <span className="gradient-text">EVERY LEGEND.</span>
            <br />
            ONE BATTLEFIELD.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-arena-text2 sm:text-base">
            Pick two characters from any world or era. The engine runs ten scenarios and one hundred
            deterministic trials, then explains exactly why the result came out the way it did.
          </p>

          <div className="mx-auto mt-6 flex max-w-sm flex-col items-stretch justify-center gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/battle-setup"
              className="w-full rounded-full bg-gradient-to-r from-arena-purple to-arena-blue px-8 py-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-white shadow-glow transition-transform hover:scale-105 sm:w-auto"
            >
              Start a battle
            </Link>
            <Link
              href="/research"
              className="w-full rounded-full border border-arena-gold/30 bg-arena-gold/10 px-8 py-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-arena-gold backdrop-blur transition-colors hover:border-arena-gold hover:text-white sm:w-auto"
            >
              Research anyone
            </Link>
            <Link
              href="/character-explorer"
              className="w-full rounded-full border border-white/20 bg-black/40 px-8 py-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-arena-text2 backdrop-blur transition-colors hover:border-arena-blue hover:text-white sm:w-auto"
            >
              Explore the roster
            </Link>
          </div>

          <p className="mx-auto mt-4 max-w-xl text-[11px] text-arena-text3">
            The curated roster is only the start — research any character, from Doraemon to Gandhi.
          </p>

          <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Curated fighters", value: stats.total },
              { label: "Universes", value: stats.universes },
              { label: "Battle modes", value: 3 },
              { label: "Trials per mode", value: 100 },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur">
                <p className="font-mono text-2xl font-black text-white">{item.value}</p>
                <p className="text-[10px] uppercase tracking-widest text-arena-text3">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modes */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:py-20">
        <div className="mb-10 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-arena-purple">Three modalities</p>
          <h2 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl">CHOOSE YOUR BATTLE</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {MODES.map((mode) => (
            <Link
              key={mode.id}
              href={mode.href}
              className="group relative overflow-hidden rounded-2xl border border-arena-border/60 bg-arena-surface/40 p-6 transition-all hover:-translate-y-1 hover:border-arena-purple/50"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${mode.accent} opacity-0 transition-opacity group-hover:opacity-100`} />
              <div className="relative">
                <span className="text-3xl">{mode.icon}</span>
                <h3 className="mt-4 font-display text-xl font-bold text-white">{mode.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-arena-text2">{mode.description}</p>
                <span className="mt-5 inline-block text-[11px] font-bold uppercase tracking-widest text-arena-blue">
                  Configure →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured matchups */}
      <section className="border-y border-arena-border/40 bg-black/20">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-arena-orange">Featured</p>
              <h2 className="mt-2 font-display text-3xl font-black text-white">CURATED MATCHUPS</h2>
            </div>
            <Link href="/trending" className="text-xs font-semibold text-arena-text3 hover:text-arena-blue">
              All trending battles →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {featured.map((entry) => {
              const a = entry.characterA!;
              const b = entry.characterB!;
              return (
                <div
                  key={`${a.id}-${b.id}`}
                  className="min-w-0 rounded-2xl border border-arena-border/60 bg-arena-surface/40 p-4"
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <CharacterEmblem name={a.name} theme={a.theme} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">{a.name}</p>
                        <p className="truncate text-[10px] text-arena-text3">{a.universe}</p>
                      </div>
                    </div>
                    <span className="px-1 font-display text-[10px] font-black text-arena-text3">VS</span>
                    <div className="flex min-w-0 items-center justify-end gap-2 text-right">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">{b.name}</p>
                        <p className="truncate text-[10px] text-arena-text3">{b.universe}</p>
                      </div>
                      <CharacterEmblem name={b.name} theme={b.theme} size="sm" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-arena-border/30 pt-3">
                    <p className="min-w-0 truncate text-[10px] uppercase tracking-widest text-arena-text3">
                      {entry.label}
                    </p>
                    <Link
                      href={`/battle-configuration?a=${a.id}&b=${b.id}&mode=overall`}
                      className="shrink-0 rounded-lg bg-arena-purple/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-arena-purple hover:bg-arena-purple/30"
                    >
                      Simulate
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:py-20">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-arena-blue">Arena network</p>
          <h2 className="mt-2 font-display text-3xl font-black text-white">SIX BATTLEGROUNDS</h2>
          <p className="mt-2 text-sm text-arena-text2">
            Every matchup is assigned a stage. Conditions inside the engine still change per scenario.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ARENA_GALLERY.map((arena) => (
            <div
              key={arena.src}
              className="group relative overflow-hidden rounded-2xl border border-arena-border/50"
            >
              <ArenaImage
                src={arena.src}
                alt={arena.title}
                className="h-44 w-full"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <p className="font-display text-sm font-bold text-white">{arena.title}</p>
                <p className="text-[10px] uppercase tracking-widest text-arena-text3">{arena.tag}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Roster preview */}
      <section className="border-y border-arena-border/40 bg-black/20">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-arena-purple">Roster</p>
              <h2 className="mt-2 font-display text-3xl font-black text-white">LEGENDS READY TO FIGHT</h2>
            </div>
            <Link href="/character-explorer" className="text-xs font-semibold text-arena-text3 hover:text-arena-blue">
              All {CHARACTER_ROSTER.length} fighters →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {preview.map((character) => (
              <CharacterCard key={character!.id} character={character!} compact />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:py-20">
        <div className="mb-10 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-arena-gold">Process</p>
          <h2 className="mt-2 font-display text-3xl font-black text-white">HOW A BATTLE RUNS</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Select two fighters",
              text: "Search the roster by name, universe, origin or ability. Historical and fictional fighters can meet on neutral ground.",
            },
            {
              step: "02",
              title: "Pick modes and conditions",
              text: "Choose intelligence, strength or overall. Ten fixed scenarios apply, from full preparation to randomized conditions.",
            },
            {
              step: "03",
              title: "Read the evidence",
              text: "Get win splits, draws, inconclusive trials, attribute radar, ten reports and a seed you can reuse to reproduce it.",
            },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl border border-arena-border/60 bg-arena-surface/40 p-6">
              <span className="font-mono text-xs font-bold text-arena-purple">{item.step}</span>
              <h3 className="mt-2 font-display text-lg font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-arena-text2">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent */}
      <section className="mx-auto max-w-6xl px-5 pb-12 sm:pb-20">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-arena-blue">This browser</p>
            <h2 className="mt-2 font-display text-2xl font-black text-white">YOUR RECENT BATTLES</h2>
          </div>
          <Link href="/battle-history" className="text-xs font-semibold text-arena-text3 hover:text-arena-blue">
            Full history →
          </Link>
        </div>
        <RecentBattles />
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-arena-purple/30">
          <ArenaImage
            src={ARENA_IMAGES.neon}
            alt="Neon arena"
            className="absolute inset-0 h-full w-full"
            sizes="100vw"
            overlay
          />
          <div className="relative px-6 py-14 text-center sm:px-12">
            <h2 className="font-display text-3xl font-black text-white sm:text-4xl">
              THE ARENA IS <span className="gradient-text">WAITING</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-arena-text2">
              No account needed. Pick two legends and see what the engine actually says.
            </p>
            <Link
              href="/battle-setup"
              className="mt-6 inline-block rounded-full bg-gradient-to-r from-arena-purple to-arena-blue px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-glow transition-transform hover:scale-105"
            >
              Enter the arena
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
