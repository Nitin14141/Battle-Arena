import Link from "next/link";
import type { CharacterProfile } from "@battle-arena/shared";
import { ArenaImage } from "@/components/ui/ArenaImage";
import { CharacterEmblem } from "@/components/CharacterEmblem";
import { arenaImageFor } from "@/lib/images";

export function CharacterCard({
  character,
  compact = false,
}: {
  character: CharacterProfile;
  compact?: boolean;
}) {
  const power = Math.round(
    (Object.values(character.intelligence).reduce((a, b) => a + b, 0) +
      Object.values(character.combat).reduce((a, b) => a + b, 0)) /
      18,
  );

  return (
    <Link
      href={`/character/${character.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-arena-border/60 bg-arena-surface/70 transition-all duration-300 hover:-translate-y-1 hover:border-arena-purple/50 hover:shadow-[0_18px_50px_-20px_rgba(176,38,255,0.45)]"
    >
      <div className="relative">
        <ArenaImage
          src={arenaImageFor(character.id)}
          alt={`${character.universe} arena backdrop`}
          className={compact ? "h-24 w-full" : "h-32 w-full"}
          overlay
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 flex items-end p-4">
          <div className="flex items-center gap-3">
            <CharacterEmblem name={character.name} theme={character.theme} size={compact ? "sm" : "md"} />
            <div className="min-w-0">
              <h3 className="truncate font-display text-lg font-bold text-white group-hover:text-arena-blue">
                {character.name}
              </h3>
              <p className="truncate text-xs text-arena-text2">{character.universe}</p>
            </div>
          </div>
        </div>
        <span className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-arena-text2 backdrop-blur">
          {character.category}
        </span>
      </div>

      <div className="space-y-2 p-4">
        <p className="line-clamp-2 text-xs leading-relaxed text-arena-text2">{character.description}</p>
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-arena-text3">
          <span>Power index</span>
          <span className="font-mono font-bold text-arena-blue">{power}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-black/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-arena-purple to-arena-blue"
            style={{ width: `${power}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

export default CharacterCard;
