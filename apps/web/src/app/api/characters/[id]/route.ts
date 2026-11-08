import { NextResponse } from "next/server";
import { resolveCharacterById } from "@/lib/server-characters";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const character = await resolveCharacterById(id);

  if (!character) {
    return NextResponse.json(
      { success: false, error: "Character not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: character });
}
