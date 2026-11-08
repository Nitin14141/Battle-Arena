import type { Metadata } from "next";
import Link from "next/link";
import { ResearchLab } from "@/components/ResearchLab";
import { CHARACTER_ROSTER } from "@/lib/roster";

export const metadata: Metadata = {
  title: "Research any character",
  description:
    "Research any fictional or deceased historical character with free AI, then fight them in the deterministic Battle Arena engine.",
};

export default function ResearchPage() {
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-5xl px-5 pb-24 pt-12">
        <section className="text-center">
          <span className="inline-block rounded-full border border-arena-gold/30 bg-arena-gold/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-arena-gold">
            Open roster · anyone
          </span>
          <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-white sm:text-6xl">
            RESEARCH <span className="gradient-text">ANYONE</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-arena-text2 sm:text-base">
            {CHARACTER_ROSTER.length} curated fighters are only the beginning. Type any fictional
            character — from Doraemon to a side character like Jaggu — or any deceased historical
            figure, including Mahatma Gandhi. The free AI builds a validated profile; the engine
            decides every fight.
          </p>
        </section>

        <ResearchLab />

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Name anyone",
              text: "Any universe, era, manga, comic, film, game or show. Side characters can include the franchise in brackets for accuracy.",
            },
            {
              step: "02",
              title: "AI reads evidence",
              text: "A free open-weight model uses public source material, then builds and validates a complete profile. Wrong-character substitutions are rejected.",
            },
            {
              step: "03",
              title: "Fight immediately",
              text: "Your new fighter is cached and playable. Pick an opponent and the deterministic engine runs 100 trials per mode.",
            },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl border border-arena-border/60 bg-arena-surface/40 p-5">
              <span className="font-mono text-xs font-bold text-arena-purple">{item.step}</span>
              <h2 className="mt-2 font-display text-lg font-bold text-white">{item.title}</h2>
              <p className="mt-2 text-xs leading-relaxed text-arena-text2">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-arena-border/60 bg-black/25 p-5 text-center">
          <p className="text-xs leading-relaxed text-arena-text2">
            No living real people. No paid AI fallback. Researched profiles are cached for 30 days,
            and the AI never chooses a winner. Disputed feats are marked as automatically researched.
          </p>
          <Link
            href="/character-explorer"
            className="mt-4 inline-block text-xs font-semibold text-arena-text3 underline-offset-4 hover:text-arena-blue hover:underline"
          >
            Prefer a ready-made fighter? Browse the curated roster →
          </Link>
        </section>
      </div>
    </main>
  );
}
