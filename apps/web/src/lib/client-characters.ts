import type { CharacterProfile } from "@battle-arena/shared";
import { getCharacterById } from "@/data/characters";

/** Client-side lookup: curated roster first, then the server research cache. */
export async function loadCharacter(id: string): Promise<CharacterProfile | null> {
  const curated = getCharacterById(id);
  if (curated) return curated;

  try {
    const response = await fetch(`/api/characters/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: CharacterProfile };
    return payload.data ?? null;
  } catch {
    return null;
  }
}
