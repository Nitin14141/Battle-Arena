import {
  CHARACTER_ROSTER,
  ROSTER_BY_ID,
  ROSTER_UNIVERSES,
  ROSTER_VERSION,
  getCharacterById,
} from "@/data/characters";
import type { CharacterCategory, CharacterProfile } from "@battle-arena/shared";

export { CHARACTER_ROSTER, ROSTER_BY_ID, ROSTER_UNIVERSES, ROSTER_VERSION, getCharacterById };

export interface RosterQuery {
  query?: string;
  category?: CharacterCategory | "all";
  universe?: string;
  limit?: number;
}

export function searchRoster({ query, category, universe, limit }: RosterQuery = {}): CharacterProfile[] {
  const normalized = (query ?? "").trim().toLowerCase();

  const matches = CHARACTER_ROSTER.filter((character) => {
    if (category && category !== "all" && character.category !== category) return false;
    if (universe && universe !== "all" && character.universe !== universe) return false;
    if (!normalized) return true;
    const haystack = [
      character.name,
      character.universe,
      character.origin,
      character.era ?? "",
      ...character.aliases,
      ...character.abilities,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });

  return typeof limit === "number" ? matches.slice(0, limit) : matches;
}

export function rosterStats() {
  const fictional = CHARACTER_ROSTER.filter((c) => c.category === "fictional").length;
  const historical = CHARACTER_ROSTER.filter((c) => c.category === "historical").length;
  const universes = new Set(CHARACTER_ROSTER.map((c) => c.universe)).size;
  const abilities = CHARACTER_ROSTER.reduce((total, c) => total + c.abilities.length, 0);

  return {
    total: CHARACTER_ROSTER.length,
    fictional,
    historical,
    universes,
    abilities,
    version: ROSTER_VERSION,
  };
}

export function averageScore(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function characterPower(character: CharacterProfile): number {
  const intelligence = Object.values(character.intelligence);
  const combat = Object.values(character.combat);
  return averageScore([...intelligence, ...combat]);
}
