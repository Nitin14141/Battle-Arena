import { NextResponse } from "next/server";
import type { CharacterCategory } from "@battle-arena/shared";
import { searchRoster } from "@/lib/roster";
import { findResearchedCharacters } from "@/lib/character-store";

export const runtime = "nodejs";

const CATEGORIES = new Set(["fictional", "historical"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? searchParams.get("query") ?? "";
  const categoryParam = searchParams.get("category") ?? "all";
  const universe = searchParams.get("universe") ?? "all";
  const limitParam = Number(searchParams.get("limit") ?? "20");
  const limit = Number.isFinite(limitParam) ? Math.min(100, Math.max(1, limitParam)) : 20;

  const category: CharacterCategory | "all" = CATEGORIES.has(categoryParam)
    ? (categoryParam as CharacterCategory)
    : "all";

  const characters = searchRoster({ query, category, universe, limit });

  // Researched fighters are only searchable once the user has created them.
  if (query.trim().length > 0) {
    const researched = await findResearchedCharacters({ query, category, universe, limit });
    for (const character of researched) {
      if (!characters.some((entry) => entry.id === character.id)) characters.push(character);
    }
  }

  const data = characters.slice(0, limit);

  return NextResponse.json({
    success: true,
    count: data.length,
    data,
    // Kept for any older client that expected this key.
    characters: data,
  });
}
