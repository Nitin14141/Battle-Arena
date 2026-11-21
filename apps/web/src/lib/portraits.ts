import type { CharacterProfile } from "@battle-arena/shared";
import { CHARACTER_IMAGES } from "@/data/character-images";

/**
 * Portrait for a fighter: the AI research pipeline stores an `imageUrl` on the
 * profile; curated fighters use the map generated from free public APIs.
 * Returns undefined when nothing is known, so the initials emblem is shown.
 */
export function characterImageFor(
  character: Pick<CharacterProfile, "id" | "imageUrl"> | null | undefined,
): string | undefined {
  if (!character) return undefined;
  if (character.imageUrl) return character.imageUrl;
  return CHARACTER_IMAGES[character.id]?.url;
}

export function characterImageCredit(
  character: Pick<CharacterProfile, "id" | "imageUrl"> | null | undefined,
): string | undefined {
  if (!character) return undefined;
  if (character.imageUrl) return undefined;
  return CHARACTER_IMAGES[character.id]?.source;
}
