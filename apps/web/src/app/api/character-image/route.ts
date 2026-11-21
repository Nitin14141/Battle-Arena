import { NextResponse } from "next/server";
import type { CharacterCategory } from "@battle-arena/shared";
import { resolveCharacterImage } from "@/lib/character-image";

export const runtime = "nodejs";

/**
 * GET /api/character-image?name=...&universe=...&category=...
 * Returns a free public portrait for a fighter, or null when none is found.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = (searchParams.get("name") ?? "").trim().slice(0, 90);
  const universe = (searchParams.get("universe") ?? "").trim().slice(0, 90) || null;
  const categoryParam = searchParams.get("category");
  const category: CharacterCategory | null =
    categoryParam === "historical" || categoryParam === "fictional" ? categoryParam : null;

  if (!name) {
    return NextResponse.json({ success: false, error: "A character name is required." }, { status: 400 });
  }

  const image = await resolveCharacterImage({ name, universe, category });

  return NextResponse.json(
    { success: true, data: image },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
