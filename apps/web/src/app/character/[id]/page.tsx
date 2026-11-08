import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArenaImage } from "@/components/ui/ArenaImage";
import { CharacterEmblem } from "@/components/CharacterEmblem";
import { CHARACTER_ROSTER } from "@/lib/roster";
import { resolveCharacterById } from "@/lib/server-characters";
import { arenaImageFor } from "@/lib/images";

export function generateStaticParams() {
  return CHARACTER_ROSTER.map((character) => ({ id: character.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const character = await resolveCharacterById(id);
  if (!character) return { title: "Character not found" };
  return {
    title: character.name,
    description: character.description,
  };
}

function Bar({ label, value, tone }: { label: string; value: number; tone: "purple" | "blue" }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-wider text-arena-text3">
        <span>{label}</span>
        <span className="font-mono text-arena-text2">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-black/50">
        <div
          className={`h-full rounded-full ${tone === "purple" ? "bg-arena-purple" : "bg-arena-blue"}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default async function CharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const character = await resolveCharacterById(id);

  if (!character) notFound();

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-10">
        <Link href="/character-explorer" className="text-xs text-arena-text3 hover:text-arena-blue">
          ← Back to roster
        </Link>

        <section className="relative mt-4 overflow-hidden rounded-3xl border border-arena-border/60">
          <ArenaImage
            src={arenaImageFor(character.id)}
            alt={`${character.universe} arena`}
            className="absolute inset-0 h-full w-full opacity-40"
            sizes="100vw"
            overlay
            priority
          />
          <div className="relative flex flex-col gap-6 p-6 sm:p-10 md:flex-row md:items-end">
            <CharacterEmblem name={character.name} theme={character.theme} size="xl" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-arena-purple/30 bg-arena-purple/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-arena-purple">
                  {character.category}
                </span>
                <span className="rounded-full border border-arena-border bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-arena-text2">
                  {character.universe}
                </span>
                {character.source === "ai-researched" && (
                  <span className="rounded-full border border-arena-gold/40 bg-arena-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-arena-gold">
                    AI researched
                  </span>
                )}
                {character.era && (
                  <span className="rounded-full border border-arena-border bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-arena-text3">
                    {character.era}
                  </span>
                )}
              </div>
              <h1 className="mt-3 font-display text-4xl font-black text-white sm:text-5xl">{character.name}</h1>
              {character.aliases.length > 0 && (
                <p className="mt-1 text-sm text-arena-text3">Also known as {character.aliases.join(", ")}</p>
              )}
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-arena-text2">{character.description}</p>
              <p className="mt-2 text-xs text-arena-text3">Origin: {character.origin}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/battle-setup?a=${character.id}`}
                className="rounded-full bg-gradient-to-r from-arena-purple to-arena-blue px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white"
              >
                Fight as {character.name}
              </Link>
              <Link
                href="/battle-setup"
                className="rounded-full border border-arena-border px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-arena-text2 hover:text-white"
              >
                Choose an opponent
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-arena-border/60 bg-arena-surface/40 p-5">
            <h2 className="font-display text-lg font-bold text-white">Intelligence profile</h2>
            <p className="mb-4 text-xs text-arena-text3">How this fighter thinks, plans and adapts.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Bar label="Strategic" value={character.intelligence.strategic} tone="blue" />
              <Bar label="Tactical" value={character.intelligence.tactical} tone="blue" />
              <Bar label="Problem solving" value={character.intelligence.problemSolving} tone="blue" />
              <Bar label="Adaptability" value={character.intelligence.adaptability} tone="blue" />
              <Bar label="Experience" value={character.intelligence.experience} tone="blue" />
              <Bar label="Prediction" value={character.intelligence.prediction} tone="blue" />
              <Bar label="Deception" value={character.intelligence.deception} tone="blue" />
              <Bar label="Decision making" value={character.intelligence.decisionMaking} tone="blue" />
              <Bar label="Resource management" value={character.intelligence.resourceManagement} tone="blue" />
            </div>
          </section>

          <section className="rounded-2xl border border-arena-border/60 bg-arena-surface/40 p-5">
            <h2 className="font-display text-lg font-bold text-white">Combat profile</h2>
            <p className="mb-4 text-xs text-arena-text3">Direct combat capability and staying power.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Bar label="Strength" value={character.combat.strength} tone="purple" />
              <Bar label="Attack power" value={character.combat.attackPower} tone="purple" />
              <Bar label="Speed" value={character.combat.speed} tone="purple" />
              <Bar label="Reaction speed" value={character.combat.reactionSpeed} tone="purple" />
              <Bar label="Durability" value={character.combat.durability} tone="purple" />
              <Bar label="Defence" value={character.combat.defence} tone="purple" />
              <Bar label="Stamina" value={character.combat.stamina} tone="purple" />
              <Bar label="Endurance" value={character.combat.endurance} tone="purple" />
              <Bar label="Combat skill" value={character.combat.combatSkill} tone="purple" />
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-arena-border/60 bg-arena-surface/40 p-5">
            <h2 className="font-display text-lg font-bold text-white">Abilities</h2>
            <ul className="mt-3 space-y-2 text-sm text-arena-text2">
              {character.abilities.map((ability) => (
                <li key={ability} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-arena-purple" />
                  {ability}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-arena-border/60 bg-arena-surface/40 p-5">
            <h2 className="font-display text-lg font-bold text-white">Weaknesses</h2>
            <ul className="mt-3 space-y-2 text-sm text-arena-text2">
              {character.weaknesses.map((weakness) => (
                <li key={weakness} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-arena-red" />
                  {weakness}
                </li>
              ))}
            </ul>
            {character.equipment.length > 0 && (
              <>
                <h3 className="mt-5 text-[10px] font-bold uppercase tracking-widest text-arena-text3">Equipment</h3>
                <p className="mt-1 text-sm text-arena-text2">{character.equipment.join(" · ")}</p>
              </>
            )}
          </section>

          <section className="rounded-2xl border border-arena-border/60 bg-arena-surface/40 p-5">
            <h2 className="font-display text-lg font-bold text-white">Documented feats</h2>
            <ul className="mt-3 space-y-2 text-sm text-arena-text2">
              {character.feats.map((feat) => (
                <li key={feat} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-arena-blue" />
                  {feat}
                </li>
              ))}
            </ul>
            <h3 className="mt-5 text-[10px] font-bold uppercase tracking-widest text-arena-text3">Evidence</h3>
            <ul className="mt-1 space-y-1 text-xs text-arena-text3">
              {character.evidence.map((source) => (
                <li key={source}>• {source}</li>
              ))}
            </ul>
          </section>
        </div>

        <p className="mt-6 text-center text-[11px] text-arena-text3">
          {character.source === "ai-researched"
            ? "AI-researched profile built from public sources. Verify disputed feats; the deterministic engine still decides every battle outcome."
            : character.category === "historical"
              ? "Historical profile based on documented records. No living person participates."
              : "Fictional profile based on canon source material. Disputed feats are excluded from the engine."}
        </p>
      </div>
    </main>
  );
}
