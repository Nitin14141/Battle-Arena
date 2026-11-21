"use client";

import { useState } from "react";
import Link from "next/link";
import { CharacterEmblem } from "@/components/CharacterEmblem";
import { characterImageFor } from "@/lib/portraits";
import { getCharacterById } from "@/data/characters";

const THREADS = [
  {
    id: "t1",
    title: "Gojo's Infinity versus Sukuna's Dismantle — does the engine agree with the manga?",
    category: "Matchup debates",
    author: "SorcererSupreme",
    replies: 42,
    a: "gojo-satoru",
    b: "ryomen-sukuna",
    body: "Run the overall mode with the default seed, then re-run with full knowledge and random conditions. The scenario split is the interesting part, not the headline winner.",
  },
  {
    id: "t2",
    title: "How should historical commanders be rated without inventing feats?",
    category: "Research & evidence",
    author: "TacticalMind",
    replies: 19,
    a: "alexander-the-great",
    b: "hannibal-barca",
    body: "The roster only scores what contemporary records or later histories actually describe. No equipment that did not exist, no invented stats.",
  },
  {
    id: "t3",
    title: "Intelligence mode should weight deception more than raw planning",
    category: "Engine rules",
    author: "ArenaMaster",
    replies: 85,
    a: "light-yagami",
    b: "lelouch-lamperouge",
    body: "Both fighters win by controlling information. Compare them under full knowledge and under zero preparation, then look at the average margin.",
  },
  {
    id: "t4",
    title: "Tournament seeding: should power index decide the bracket?",
    category: "Tournaments",
    author: "BracketSmith",
    replies: 31,
    a: "superman",
    b: "saitama",
    body: "Seeding by power index makes the bracket predictable. Seeding by universe creates better cross-category matches.",
  },
];

const CATEGORIES = ["All", "Matchup debates", "Research & evidence", "Engine rules", "Tournaments"];

export default function CommunityPage() {
  const [category, setCategory] = useState("All");
  const [openThread, setOpenThread] = useState<string | null>(null);

  const visible = THREADS.filter((thread) => category === "All" || thread.category === category);

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-5xl px-5 pb-24 pt-12">
        <section className="text-center">
          <span className="inline-block rounded-full border border-arena-teal/30 bg-arena-teal/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-arena-teal">
            Community preview
          </span>
          <h1 className="mt-4 font-display text-4xl font-black text-white sm:text-5xl">
            THE <span className="gradient-text">FORUM</span>
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-arena-text2">
            Reading is open to everyone. Posting, voting and replies need accounts, which are Phase E.
            The debates below are seeded examples so you can see the structure.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => setCategory(entry)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                category === entry
                  ? "bg-gradient-to-r from-arena-purple to-arena-blue text-white"
                  : "border border-arena-border text-arena-text3 hover:text-white"
              }`}
            >
              {entry}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          {visible.map((thread) => {
            const a = getCharacterById(thread.a);
            const b = getCharacterById(thread.b);
            const open = openThread === thread.id;

            return (
              <article key={thread.id} className="rounded-2xl border border-arena-border/60 bg-arena-surface/40 p-5">
                <button
                  type="button"
                  onClick={() => setOpenThread(open ? null : thread.id)}
                  className="w-full text-left"
                  aria-expanded={open}
                >
                  <span className="rounded-full border border-arena-purple/25 bg-arena-purple/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-arena-purple">
                    {thread.category}
                  </span>
                  <h2 className="mt-2 font-display text-lg font-bold text-white">{thread.title}</h2>
                  <p className="mt-1 text-xs text-arena-text3">
                    Started by {thread.author} · {thread.replies} replies · {open ? "Hide" : "Read preview"}
                  </p>
                </button>

                {open && (
                  <div className="mt-4 border-t border-arena-border/50 pt-4">
                    <p className="text-sm leading-relaxed text-arena-text2">{thread.body}</p>

                    {a && b && (
                      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-arena-border/50 bg-black/30 p-3">
                        <CharacterEmblem
                          name={a.name}
                          theme={a.theme}
                          size="sm"
                          image={characterImageFor(a)}
                          universe={a.universe}
                          category={a.category}
                        />
                        <span className="text-xs font-bold text-white">{a.name}</span>
                        <span className="text-[10px] text-arena-text3">vs</span>
                        <span className="text-xs font-bold text-white">{b.name}</span>
                        <CharacterEmblem
                          name={b.name}
                          theme={b.theme}
                          size="sm"
                          image={characterImageFor(b)}
                          universe={b.universe}
                          category={b.category}
                        />
                        <Link
                          href={`/battle-configuration?a=${a.id}&b=${b.id}&mode=overall`}
                          className="ml-auto rounded-lg bg-gradient-to-r from-arena-purple to-arena-blue px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white"
                        >
                          Simulate this
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
