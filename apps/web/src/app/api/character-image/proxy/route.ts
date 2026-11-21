import { NextResponse } from "next/server";

/**
 * GET /api/character-image/proxy?url=...
 *
 * Portraits come from public CDNs, and some of them (Fandom) answer 404 when a
 * browser sends a foreign Referer. Serving the bytes from our own origin keeps
 * every fighter portrait working and lets the response be cached at the edge.
 */
export const runtime = "nodejs";

const ALLOWED_HOSTS = new Set([
  "static.wikia.nocookie.net",
  "s4.anilist.co",
  "upload.wikimedia.org",
  "thumb.wikimedia.org",
]);

const USER_AGENT = "BattleArena/0.2 (character portraits)";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ success: false, error: "A url is required." }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid url." }, { status: 400 });
  }

  if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.hostname)) {
    return NextResponse.json({ success: false, error: "Host not allowed." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), {
      headers: { "user-agent": USER_AGENT, accept: "image/*" },
      cache: "no-store",
    });
  } catch (error) {
    console.warn(`Portrait proxy failed for ${target.toString()}:`, error);
    return new NextResponse(null, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  if (!upstream.ok || !upstream.body || !contentType.startsWith("image/")) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "content-type": contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
    },
  });
}
