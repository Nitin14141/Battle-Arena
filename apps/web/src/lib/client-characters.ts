import type { CharacterProfile } from "@battle-arena/shared";
import { getCharacterById } from "@/data/characters";
import { readResearchedProfile, saveResearchedProfile } from "@/lib/storage";

/**
 * Client-side lookup: curated roster, then the browser's copy of a researched
 * profile, then the server cache.
 *
 * The server cache is per-instance and ephemeral, so the browser copy is what
 * keeps a researched fighter playable across pages and deployments.
 */
export async function loadCharacter(id: string): Promise<CharacterProfile | null> {
  const curated = getCharacterById(id);
  if (curated) return curated;

  const local = readResearchedProfile(id);
  if (local) return local;

  try {
    const response = await fetch(`/api/characters/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: CharacterProfile };
    const profile = payload.data ?? null;
    if (profile?.source === "ai-researched") saveResearchedProfile(profile);
    return profile;
  } catch {
    return null;
  }
}
