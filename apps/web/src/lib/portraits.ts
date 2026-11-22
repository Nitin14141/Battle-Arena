import type { CharacterProfile } from "@battle-arena/shared";
import { CHARACTER_IMAGES } from "@/data/character-images";
import { CHARACTER_ROSTER } from "@/data/characters";

/**
 * A researched profile can be the same fighter under another name ("Anthony
 * Stark" or "Bruce Wayne" resolved separately from the curated Iron Man and
 * Batman). Reuse the curated portrait for a known name or alias instead of
 * showing initials.
 */
function portraitForKnownAlias(name: string | null | undefined): string | undefined {
  if (!name) return undefined;
  const needle = name.trim().toLowerCase();
  const match = CHARACTER_ROSTER.find(
    (fighter) =>
      fighter.name.toLowerCase() === needle ||
      fighter.aliases.some((alias) => alias.toLowerCase() === needle),
  );
  if (!match) return undefined;
  return match.imageUrl ?? CHARACTER_IMAGES[match.id]?.url;
}

/**
 * Portrait for a fighter: the AI research pipeline stores an `imageUrl` on the
 * profile; curated fighters use the map generated from free public APIs.
 * Returns undefined when nothing is known, so the initials emblem is shown.
 */
export function characterImageFor(
  character:
    | (Pick<CharacterProfile, "id" | "imageUrl"> & { name?: string | null })
    | null
    | undefined,
): string | undefined {
  if (!character) return undefined;
  if (character.imageUrl) return character.imageUrl;
  return CHARACTER_IMAGES[character.id]?.url ?? portraitForKnownAlias(character.name);
}

export function characterImageCredit(
  character: Pick<CharacterProfile, "id" | "imageUrl"> | null | undefined,
): string | undefined {
  if (!character) return undefined;
  if (character.imageUrl) return undefined;
  return CHARACTER_IMAGES[character.id]?.source;
}
