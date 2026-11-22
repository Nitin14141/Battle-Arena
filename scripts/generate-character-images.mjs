/**
 * Resolves a portrait image for every curated fighter using free public APIs
 * (Wikipedia page images, AniList and Fandom wikis) and writes
 * apps/web/src/data/character-images.ts.
 *
 * Run with: node scripts/generate-character-images.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const rosterPath = path.join(root, "apps/web/src/data/characters.ts");
const outPath = path.join(root, "apps/web/src/data/character-images.ts");

const FANDOM_WIKIS = {
  "DC Comics": "dc.fandom.com",
  Marvel: "marvel.fandom.com",
  "Star Wars": "starwars.fandom.com",
  "The Lord of the Rings": "lotr.fandom.com",
  "God of War": "godofwar.fandom.com",
  "The Witcher": "witcher.fandom.com",
};

/** Exact wiki titles where the plain character name points at a variant page. */
const WIKI_TITLES = {
  thor: "Thor Odinson (Earth-616)",
  superman: "Superman (Clark Kent)",
  batman: "Batman (Bruce Wayne)",
  "wonder-woman": "Diana of Themyscira (Prime Earth)",
  "the-flash": "Flash (Barry Allen)",
  "iron-man": "Anthony Stark (Earth-616)",
  "doctor-strange": "Stephen Strange (Earth-616)",
  thanos: "Thanos (Earth-616)",
  "shivaji-bhonsale": "Shivaji",
};

/** Characters whose article title is not the display name. */
const WIKI_SEARCH = {
  "shivaji-bhonsale": "Shivaji Bhonsale",
};

const WIDTH = 600;
/**
 * Wikipedia only serves some files at the 960px rendition: asking for 800px
 * returns HTTP 400 for a number of portraits, which left those fighters with
 * no image at all. Always request 960 and never rewrite it back down.
 */
const WIKI_WIDTH = 960;

const toUpgrade = (url) => url.replace(/scale-to-width-down\/\d+/, `scale-to-width-down/${WIDTH}`);
const stripQuery = (url) => url.split("?")[0];

const USER_AGENT = "BattleArena/0.2 (https://battle-arena-beta-five.vercel.app; character portraits)";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function json(url, init) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    let response;
    try {
      response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(15000),
        headers: { "user-agent": USER_AGENT, ...(init?.headers ?? {}) },
      });
    } catch {
      return null;
    }
    if (response.status === 429) {
      await sleep(5000 * (attempt + 1));
      continue;
    }
    if (!response.ok) return null;
    return response.json();
  }
  return null;
}

function pickPage(data) {
  return Object.values(data?.query?.pages ?? {})[0] ?? null;
}

async function wikipedia(title) {
  const endpoint = new URL("https://en.wikipedia.org/w/api.php");
  endpoint.search = new URLSearchParams({
    action: "query",
    format: "json",
    redirects: "1",
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: String(WIKI_WIDTH),
    titles: title,
  }).toString();
  const page = pickPage(await json(endpoint.href));
  if (!page?.thumbnail?.source) return null;
  return { url: stripQuery(page.thumbnail.source), source: `Wikipedia · ${page.title}` };
}

async function wikipediaSearch(query) {
  const endpoint = new URL("https://en.wikipedia.org/w/api.php");
  endpoint.search = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: query,
    gsrlimit: "1",
    redirects: "1",
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: String(WIKI_WIDTH),
  }).toString();
  const page = pickPage(await json(endpoint.href));
  if (!page?.thumbnail?.source) return null;
  return { url: stripQuery(page.thumbnail.source), source: `Wikipedia · ${page.title}` };
}

async function fandom(wiki, title) {
  const endpoint = new URL(`https://${wiki}/api.php`);
  endpoint.search = new URLSearchParams({
    action: "query",
    format: "json",
    redirects: "1",
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: String(WIDTH),
    titles: title,
  }).toString();
  const page = pickPage(await json(endpoint.href));
  if (page?.thumbnail?.source) {
    return { url: toUpgrade(page.thumbnail.source), source: `Fandom · ${page.title}` };
  }
  return fandomSearch(wiki, title);
}

async function fandomSearch(wiki, query) {
  const endpoint = new URL(`https://${wiki}/api.php`);
  endpoint.search = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `intitle:${query}`,
    gsrlimit: "1",
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: String(WIDTH),
  }).toString();
  const page = pickPage(await json(endpoint.href));
  if (!page?.thumbnail?.source) return null;
  return { url: toUpgrade(page.thumbnail.source), source: `Fandom · ${page.title}` };
}

async function anilist(term) {
  const data = await json("https://graphql.anilist.co", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      query:
        "query ($search: String) { Character(search: $search) { name { full } image { large medium } } }",
      variables: { search: term },
    }),
  });
  const character = data?.data?.Character;
  const url = character?.image?.large ?? character?.image?.medium;
  if (!url || !character?.name?.full) return null;
  return { url, source: `AniList · ${character.name.full}`, name: character.name.full };
}

const tokens = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((token) => token.length > 2 && !["the", "of", "and"].includes(token));

const sameToken = (left, right) => {
  if (left === right) return true;
  if (left.length < 4 || right.length < 4) return false;
  return left.slice(0, 4) === right.slice(0, 4);
};

function matches(a, b) {
  const left = tokens(a);
  const right = tokens(b);
  if (left.length === 0 || right.length === 0) return false;
  const matched = left.filter((token) => right.some((other) => sameToken(token, other))).length;
  return matched / new Set([...left, ...right]).size >= 0.5;
}

async function resolve(entry) {
  const wiki = FANDOM_WIKIS[entry.universe];
  const title = WIKI_TITLES[entry.id] ?? entry.name;

  if (entry.category === "historical") {
    return (
      (await wikipedia(title)) ??
      (await wikipediaSearch(WIKI_SEARCH[entry.id] ?? `${entry.name} ${entry.universe}`)) ??
      (await wikipediaSearch(entry.name))
    );
  }

  if (wiki) {
    const hit = await fandom(wiki, title);
    if (hit) return hit;
  }

  const terms = [
    entry.name,
    ...(entry.aliases ?? []),
    entry.name.split(/\s+/).reverse().join(" "),
    entry.name.split(/\s+/)[0],
  ];
  for (const term of terms) {
    const hit = await anilist(term);
    if (hit && matches(entry.name, hit.name)) return hit;
    if (hit && (entry.aliases ?? []).some((alias) => matches(alias, hit.name))) return hit;
  }

  return (await wikipedia(title)) ?? (await wikipediaSearch(`${entry.name} ${entry.universe}`));
}

const source = fs.readFileSync(rosterPath, "utf8");
const entries = [...source.matchAll(/build\(\{([\s\S]*?)\n  \}\),/g)].map((match) => {
  const block = match[1];
  const field = (key) => block.match(new RegExp(`\\n\\s+${key}: "([^"]+)"`))?.[1];
  const aliasesLine = block.match(/\n\s+aliases: \[([^\]]*)\]/)?.[1] ?? "";
  const aliases = [...aliasesLine.matchAll(/"([^"]+)"/g)].map((alias) => alias[1]);
  return {
    id: field("id"),
    name: field("name"),
    universe: field("universe"),
    category: field("category"),
    aliases,
  };
});

if (entries.length === 0) {
  console.error("No roster entries parsed — aborting.");
  process.exit(1);
}

/** Reuse already-resolved entries so a rate-limited run can be resumed. */
function existingEntries() {
  if (!fs.existsSync(outPath) || process.argv.includes("--force")) return {};
  const text = fs.readFileSync(outPath, "utf8");
  const found = {};
  for (const match of text.matchAll(/"([^"]+)": \{ url: "([^"]+)", source: "([^"]*)" \}/g)) {
    found[match[1]] = { url: match[2], source: match[3] };
    found[match[1]].name = match[3];
  }
  return found;
}

const resolved = existingEntries();
for (const entry of entries) {
  if (resolved[entry.id]) {
    console.log(`· ${entry.id.padEnd(24)} kept ${resolved[entry.id].source}`);
    continue;
  }
  let hit = null;
  try {
    hit = await resolve(entry);
  } catch (error) {
    console.warn(`! ${entry.id}: ${error.message}`);
  }
  resolved[entry.id] = hit;
  console.log(`${hit ? "✓" : "✗"} ${entry.id.padEnd(24)} ${hit ? `${hit.source}  ${hit.url}` : entry.name}`);
  await sleep(1200);
}

const missing = Object.entries(resolved).filter(([, value]) => !value).map(([id]) => id);

const body = Object.entries(resolved)
  .filter(([, value]) => value)
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([id, value]) => `  ${JSON.stringify(id)}: { url: ${JSON.stringify(value.url)}, source: ${JSON.stringify(value.source)} },`)
  .join("\n");

fs.writeFileSync(
  outPath,
  `/**
 * Portrait images for the curated roster, resolved from free public sources
 * (Wikipedia page images, AniList and Fandom wikis).
 *
 * Generated by scripts/generate-character-images.mjs — re-run it to refresh.
 */
export interface CharacterImage {
  url: string;
  source: string;
}

export const CHARACTER_IMAGES: Record<string, CharacterImage> = {
${body}
};
`,
);

console.log(`\nWrote ${outPath} (${Object.keys(resolved).length - missing.length}/${entries.length})`);
if (missing.length > 0) console.log(`Unresolved: ${missing.join(", ")}`);
