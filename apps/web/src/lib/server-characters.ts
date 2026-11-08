import type { CharacterProfile } from "@battle-arena/shared";
import { getCharacterById } from "@/lib/roster";
import { getResearchedCharacter } from "@/lib/character-store";

/** Server-side lookup across the curated roster and the AI research cache. */
export async function resolveCharacterById(id: string): Promise<CharacterProfile | null> {
  if (!id || id.length > 120) return null;
  const curated = getCharacterById(id);
  if (curated) return curated;
  const researched = await getResearchedCharacter(id);
  return researched?.profile ?? null;
}
