import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-arena-purple">About</p>
        <h1 className="mt-3 font-display text-4xl font-black text-white sm:text-5xl">
          WHAT <span className="gradient-text">BATTLE ARENA</span> IS
        </h1>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-arena-text2">
          <p>
            Battle Arena is a character comparison platform. You pick two fighters, choose one or
            more battle modes, and the engine runs ten scenarios of ten trials each. Every trial is
            computed from a fixed attribute profile, scenario modifiers, ability interactions and a
            seeded random number generator.
          </p>

          <section>
            <h2 className="font-display text-xl font-bold text-white">The engine decides, not the AI</h2>
            <p className="mt-2">
              Outcomes are produced by the TypeScript simulation engine. The AI layer, when enabled,
              researches profiles and writes narration. It cannot invent win percentages or change a
              winner. The random seed is stored so any result can be reproduced exactly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white">What the modes measure</h2>
            <ul className="mt-2 space-y-2">
              <li>
                <span className="text-arena-blue">Intelligence</span> — strategy, tactics, prediction,
                deception, adaptability and resource management.
              </li>
              <li>
                <span className="text-arena-red">Strength</span> — power, attack, speed, reaction,
                durability, defence, stamina, endurance and combat skill.
              </li>
              <li>
                <span className="text-arena-purple">Overall</span> — both groups interacting, with
                scenario-specific weighting, ability counters and equipment effects.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white">Characters and evidence</h2>
            <p className="mt-2">
              The roster covers fictional characters from anime, manga, comics, film, television,
              games and novels, plus deceased historical figures. Historical battles are explicitly
              hypothetical and use documented equipment and recorded accounts, not invented powers.
              Living people are never combat participants.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white">Current status</h2>
            <p className="mt-2">
              Phases A and B are complete: the build is clean, every route renders, the full battle
              flow works, and results are reproducible. Accounts, the database and community tools are
              planned for later phases. Guest results are stored only in your browser.
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/battle-setup"
            className="rounded-full bg-gradient-to-r from-arena-purple to-arena-blue px-6 py-3 text-xs font-bold uppercase tracking-widest text-white"
          >
            Start a battle
          </Link>
          <Link
            href="/character-explorer"
            className="rounded-full border border-arena-border px-6 py-3 text-xs font-bold uppercase tracking-widest text-arena-text2 hover:text-white"
          >
            Browse the roster
          </Link>
        </div>
      </div>
    </main>
  );
}
