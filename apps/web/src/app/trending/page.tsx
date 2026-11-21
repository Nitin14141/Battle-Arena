import Link from "next/link";
import { CharacterEmblem } from "@/components/CharacterEmblem";
import { characterImageFor } from "@/lib/portraits";
import { getCharacterById } from "@/lib/roster";
import { arenaImageFor } from "@/lib/images";
import { ArenaImage } from "@/components/ui/ArenaImage";

const CURATED = [
  {
    a: "gojo-satoru",
    b: "ryomen-sukuna",
    reason: "The canonical rivalry: infinite defence against dismantling offence.",
    tag: "Anime",
  },
  {
    a: "superman",
    b: "goku",
    reason: "The oldest cross-universe argument in fandom, finally run through a fixed ruleset.",
    tag: "Crossover",
  },
  {
    a: "batman",
    b: "light-yagami",
    reason: "Preparation and deduction versus information warfare. Pure intelligence mode.",
    tag: "Intelligence",
  },
  {
    a: "alexander-the-great",
    b: "napoleon-bonaparte",
    reason: "Two of history's fastest campaigners on neutral ground.",
    tag: "Historical",
  },
  {
    a: "zhuge-liang",
    b: "sun-tzu",
    reason: "Two strategic doctrines that never met in life, compared trial by trial.",
    tag: "Strategy",
  },
  {
    a: "saber",
    b: "wonder-woman",
    reason: "Holy sword against divine steel — durability and speed decide it.",
    tag: "Strength",
  },
  {
    a: "miyamoto-musashi",
    b: "levi-ackerman",
    reason: "Historical duelling craft against anime aerial blade work.",
    tag: "Blades",
  },
  {
    a: "thanos",
    b: "darth-vader",
    reason: "Two titans of screen villainy with very different paths to dominance.",
    tag: "Villains",
  },
];

export default function TrendingPage() {
  const matchups = CURATED.map((entry) => ({
    ...entry,
    characterA: getCharacterById(entry.a),
    characterB: getCharacterById(entry.b),
  })).filter((entry) => entry.characterA && entry.characterB);

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-12">
        <section className="text-center">
          <span className="inline-block rounded-full border border-arena-orange/30 bg-arena-orange/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-arena-orange">
            Curated matchups
          </span>
          <h1 className="mt-4 font-display text-4xl font-black text-white sm:text-5xl">
            TRENDING <span className="gradient-text">BATTLES</span>
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-arena-text2">
            Hand-picked debates with a one-click simulation. Community voting and live trending
            rankings arrive with the database phase.
          </p>
        </section>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {matchups.map((entry) => {
            const a = entry.characterA!;
            const b = entry.characterB!;
            return (
              <article
                key={`${a.id}-${b.id}`}
                className="group relative overflow-hidden rounded-2xl border border-arena-border/60 bg-arena-surface/40 p-5"
              >
                <ArenaImage
                  src={arenaImageFor(`${a.id}${b.id}`)}
                  alt="Arena backdrop"
                  className="absolute inset-0 h-full w-full opacity-20"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  overlay
                />
                <div className="relative">
                  <span className="rounded-full border border-arena-border bg-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-arena-text3">
                    {entry.tag}
                  </span>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <CharacterEmblem
                        name={a.name}
                        theme={a.theme}
                        size="sm"
                        image={characterImageFor(a)}
                        universe={a.universe}
                        category={a.category}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">{a.name}</p>
                        <p className="truncate text-[10px] text-arena-text3">{a.universe}</p>
                      </div>
                    </div>
                    <span className="font-display text-xs font-black text-arena-text3">VS</span>
                    <div className="flex min-w-0 items-center gap-2">
                      <CharacterEmblem
                        name={b.name}
                        theme={b.theme}
                        size="sm"
                        image={characterImageFor(b)}
                        universe={b.universe}
                        category={b.category}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">{b.name}</p>
                        <p className="truncate text-[10px] text-arena-text3">{b.universe}</p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-arena-text2">{entry.reason}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/battle-configuration?a=${a.id}&b=${b.id}&mode=overall`}
                      className="rounded-lg bg-gradient-to-r from-arena-purple to-arena-blue px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-white"
                    >
                      Simulate
                    </Link>
                    <Link
                      href={`/battle-configuration?a=${a.id}&b=${b.id}&mode=intelligence`}
                      className="rounded-lg border border-arena-border px-3 py-2 text-[11px] font-semibold text-arena-text2 hover:text-white"
                    >
                      Intelligence only
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
