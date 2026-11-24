import type { CharacterCategory } from "@battle-arena/shared";
import { CHARACTER_IMAGES } from "@/data/character-images";
import { CHARACTER_ROSTER } from "@/data/characters";

/**
 * Free portrait resolution.
 *
 * Fighters need a face, but nothing is uploaded by hand. This module asks free
 * public APIs — Wikipedia page images, AniList and Fandom wikis — for a portrait
 * and caches the answer in memory. Every source can fail or answer about the
 * wrong subject, so failures return null and the UI keeps its initials emblem.
 */

export interface ResolvedCharacterImage {
  url: string;
  source: string;
}

const FOUND_TTL = 7 * 24 * 60 * 60 * 1000;
const MISS_TTL = 10 * 60 * 1000;
const TIMEOUT = 6000;

const cache = new Map<string, { value: ResolvedCharacterImage | null; expires: number }>();

const FANDOM_WIKIS: { universe: RegExp; wiki: string }[] = [
  { universe: /^(dc|dc comics)$/i, wiki: "dc.fandom.com" },
  { universe: /^(marvel|marvel comics|mcu|marvel cinematic universe)$/i, wiki: "marvel.fandom.com" },
  { universe: /^star wars$/i, wiki: "starwars.fandom.com" },
  { universe: /^(the lord of the rings|middle-earth|lord of the rings)$/i, wiki: "lotr.fandom.com" },
  { universe: /^god of war$/i, wiki: "godofwar.fandom.com" },
  { universe: /^(the witcher|witcher)$/i, wiki: "witcher.fandom.com" },
  { universe: /^harry potter$/i, wiki: "harrypotter.fandom.com" },
  { universe: /^(the elder scrolls|skyrim)$/i, wiki: "elderscrolls.fandom.com" },
];

const ANIME_UNIVERSES =
  /jujutsu|naruto|one piece|dragon ball|one punch|death note|code geass|attack on titan|demon slayer|fate|bleach|my hero|chainsaw|hunter x hunter|tokyo ghoul|sword art|evangelion|fullmetal|studio ghibli|pokemon|pokémon|digimon|sailor moon|doraemon/i;

const WIDTH = "600";

const toUpgrade = (url: string) => url.replace(/scale-to-width-down\/\d+/, `scale-to-width-down/${WIDTH}`);
const stripQuery = (url: string) => url.split("?")[0];

/** Wikimedia Commons accepts a file name and serves a scaled rendition. */
function commonsFile(file: string): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file.replace(/ /g, "_"))}?width=${WIDTH}`;
}

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((token) => token.length > 2 && !["the", "of", "and", "the"].includes(token));
}

function sameToken(left: string, right: string): boolean {
  if (left === right) return true;
  if (left.length < 4 || right.length < 4) return false;
  return left.slice(0, 4) === right.slice(0, 4);
}

/**
 * Guards against a search API answering about a different person: the overlap
 * between the requested name and the returned name must be substantial.
 */
function sharesSubject(query: string, candidate: string): boolean {
  const expected = tokens(query);
  if (expected.length === 0) return true;
  const found = tokens(candidate);
  if (found.length === 0) return false;
  const matched = expected.filter((token) => found.some((other) => sameToken(token, other))).length;
  const union = new Set([...expected, ...found]).size;
  return matched / union >= 0.5;
}

async function getJson(url: string, init?: RequestInit): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: { accept: "application/json", ...(init?.headers ?? {}) },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

type WikiPage = { title?: string; thumbnail?: { source?: string } };

function pickPage(data: unknown): WikiPage | null {
  const pages = (data as { query?: { pages?: Record<string, WikiPage> } } | null)?.query?.pages;
  if (!pages) return null;
  return Object.values(pages)[0] ?? null;
}

async function wikipediaTitle(title: string): Promise<ResolvedCharacterImage | null> {
  const endpoint = new URL("https://en.wikipedia.org/w/api.php");
  endpoint.search = new URLSearchParams({
    action: "query",
    format: "json",
    redirects: "1",
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: WIDTH,
    titles: title,
  }).toString();
  const page = pickPage(await getJson(endpoint.href));
  const url = page?.thumbnail?.source;
  if (!url || !page?.title) return null;
  return { url: stripQuery(url), source: `Wikipedia · ${page.title}` };
}

async function wikipediaSearch(query: string, expect: string): Promise<ResolvedCharacterImage | null> {
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
    pithumbsize: WIDTH,
  }).toString();
  const page = pickPage(await getJson(endpoint.href));
  const url = page?.thumbnail?.source;
  if (!url || !page?.title) return null;
  if (!sharesSubject(expect, page.title)) return null;
  return { url: stripQuery(url), source: `Wikipedia · ${page.title}` };
}

async function fandomImage(wiki: string, title: string): Promise<ResolvedCharacterImage | null> {
  const endpoint = new URL(`https://${wiki}/api.php`);
  endpoint.search = new URLSearchParams({
    action: "query",
    format: "json",
    redirects: "1",
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: WIDTH,
    titles: title,
  }).toString();
  const page = pickPage(await getJson(endpoint.href));
  const url = page?.thumbnail?.source;
  if (!url || !page?.title) return fandomSearchImage(wiki, title);
  return { url: toUpgrade(url), source: `Fandom · ${page.title}` };
}

async function fandomSearchImage(wiki: string, query: string): Promise<ResolvedCharacterImage | null> {
  const endpoint = new URL(`https://${wiki}/api.php`);
  endpoint.search = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `intitle:${query}`,
    gsrlimit: "1",
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: WIDTH,
  }).toString();
  const page = pickPage(await getJson(endpoint.href));
  const url = page?.thumbnail?.source;
  if (!url || !page?.title) return null;
  // A search can answer with a different character entirely, so only accept a
  // page whose title actually refers to the requested fighter.
  if (!sharesSubject(query, page.title)) return null;
  return { url: toUpgrade(url), source: `Fandom · ${page.title}` };
}

/**
 * Best-effort franchise wikis for universes that are not in the fixed list.
 * Fandom slugs are inconsistent: "Game of Thrones" lives at
 * gameofthrones.fandom.com while "The Boys" lives at the-boys.fandom.com, so
 * both the joined and the hyphenated spelling are tried.
 */
function guessedFandomWikis(universe: string): string[] {
  const words = universe
    .toLowerCase()
    .replace(/\b(series|franchise|universe|comics|manga|anime|novel|novels)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return [];
  // Some wikis are named after the first word only (The Kingkiller Chronicle →
  // kingkiller.fandom.com), so that spelling is tried last.
  const head = words[0] === "the" ? words[1] : words[0];
  const slugs = [...new Set([words.join("-"), words.join(""), head ?? ""])];
  return slugs
    .filter((slug) => slug.length >= 3 && slug.length <= 30)
    .map((slug) => `${slug}.fandom.com`);
}

async function anilistImage(term: string): Promise<ResolvedCharacterImage | null> {
  const data = (await getJson("https://graphql.anilist.co", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query:
        "query ($search: String) { Character(search: $search) { name { full } image { large medium } } }",
      variables: { search: term },
    }),
  })) as
    | { data?: { Character?: { name?: { full?: string }; image?: { large?: string; medium?: string } } } }
    | null;

  const character = data?.data?.Character;
  const url = character?.image?.large ?? character?.image?.medium;
  const name = character?.name?.full;
  if (!url || !name) return null;
  if (!sharesSubject(term, name)) return null;
  return { url, source: `AniList · ${name}` };
}

function fandomWikiFor(universe: string | null | undefined): string | null {
  if (!universe) return null;
  const match = FANDOM_WIKIS.find((entry) => entry.universe.test(universe.trim()));
  return match?.wiki ?? null;
}

interface WikidataHit {
  id?: string;
  label?: string;
  description?: string;
}

interface WikidataClaim {
  mainsnak?: { datavalue?: { value?: unknown } };
}

interface WikidataEntity {
  labels?: Record<string, { value?: string }>;
  claims?: Record<string, WikidataClaim[]>;
}

async function wikidataSearch(term: string): Promise<WikidataHit[]> {
  const endpoint = new URL("https://www.wikidata.org/w/api.php");
  endpoint.search = new URLSearchParams({
    action: "wbsearchentities",
    format: "json",
    language: "en",
    uselang: "en",
    type: "item",
    limit: "5",
    search: term,
  }).toString();
  const data = (await getJson(endpoint.href)) as { search?: WikidataHit[] } | null;
  return data?.search ?? [];
}

async function wikidataEntities(ids: string[]): Promise<Record<string, WikidataEntity>> {
  if (ids.length === 0) return {};
  const endpoint = new URL("https://www.wikidata.org/w/api.php");
  endpoint.search = new URLSearchParams({
    action: "wbgetentities",
    format: "json",
    ids: ids.slice(0, 10).join("|"),
    props: "claims|labels",
    languages: "en",
  }).toString();
  const data = (await getJson(endpoint.href)) as { entities?: Record<string, WikidataEntity> } | null;
  return data?.entities ?? {};
}

/** P18 (image) values are Wikimedia Commons file names. */
function imageFiles(entity: WikidataEntity | undefined): string[] {
  return (entity?.claims?.P18 ?? [])
    .map((claim) => claim.mainsnak?.datavalue?.value)
    .filter((value): value is string => typeof value === "string" && value.length > 0);
}

/** P175 (performer) values are item references such as Q2813921. */
function performerIds(entity: WikidataEntity | undefined): string[] {
  return (entity?.claims?.P175 ?? [])
    .map((claim) => claim.mainsnak?.datavalue?.value)
    .map((value) =>
      value && typeof value === "object" && "id" in value ? String((value as { id?: unknown }).id) : null,
    )
    .filter((id): id is string => typeof id === "string" && id.startsWith("Q"));
}

/**
 * Wikidata portrait, including live-action casting.
 *
 * Wiki page images are missing for a lot of characters — especially fighters
 * from live-action films and series, whose articles are often about the actor
 * rather than the role. Wikidata links a character to the actor who plays them
 * (P175), so a portrait of the performer gives those fighters a real face
 * instead of initials.
 */
async function wikidataImage(term: string): Promise<ResolvedCharacterImage | null> {
  const hits = await wikidataSearch(term);
  if (hits.length === 0) return null;

  const matching = hits.filter((hit) => hit.id && hit.label && sharesSubject(term, hit.label));
  const pool = (matching.length > 0 ? matching : hits.slice(0, 1)).filter((hit) => hit.id);
  if (pool.length === 0) return null;

  const entities = await wikidataEntities(pool.map((hit) => hit.id as string));

  // The character's own picture first.
  for (const hit of pool) {
    const [file] = imageFiles(entities[hit.id as string]);
    if (file) return { url: commonsFile(file), source: `Wikidata · ${hit.label ?? term}` };
  }

  // Otherwise the actor who plays them.
  const cast = pool.flatMap((hit) => performerIds(entities[hit.id as string])).slice(0, 4);
  if (cast.length === 0) return null;

  const performers = await wikidataEntities(cast);
  for (const id of cast) {
    const [file] = imageFiles(performers[id]);
    if (!file) continue;
    const label = performers[id]?.labels?.en?.value;
    return { url: commonsFile(file), source: label ? `Actor · ${label}` : "Wikimedia Commons · actor portrait" };
  }
  return null;
}

export interface CharacterImageQuery {
  name: string;
  universe?: string | null;
  category?: CharacterCategory | null;
}

export async function resolveCharacterImage({
  name,
  universe,
  category,
}: CharacterImageQuery): Promise<ResolvedCharacterImage | null> {
  const trimmed = name.trim().slice(0, 90);
  if (!trimmed) return null;

  const key = `${trimmed}|${universe ?? ""}|${category ?? ""}`.toLowerCase();
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.value;

  // A curated fighter (or a known alias) always has a verified portrait, and
  // answering from it first avoids ambiguous names: a wiki search for "Bruce
  // Wayne" can return an unrelated character who happens to share the name.
  const needle = trimmed.toLowerCase();
  const curated = CHARACTER_ROSTER.find(
    (fighter) =>
      fighter.name.toLowerCase() === needle ||
      fighter.aliases.some((alias) => alias.toLowerCase() === needle),
  );
  const curatedImage = curated ? CHARACTER_IMAGES[curated.id] : undefined;
  if (curatedImage) {
    const value = { url: curatedImage.url, source: curatedImage.source };
    cache.set(key, { value, expires: Date.now() + FOUND_TTL });
    return value;
  }

  const remember = (value: ResolvedCharacterImage | null) => {
    cache.set(key, { value, expires: Date.now() + (value ? FOUND_TTL : MISS_TTL) });
    return value;
  };

  const wiki = fandomWikiFor(universe);
  const bareName = trimmed.replace(/\s*\([^)]*\)\s*$/, "");
  const isHistorical = category === "historical";
  const anime = ANIME_UNIVERSES.test(universe ?? "") || ANIME_UNIVERSES.test(trimmed);

  const wikipediaHit = async () =>
    (await wikipediaTitle(bareName)) ??
    (await wikipediaSearch(`${bareName} ${universe ?? ""}`.trim(), bareName)) ??
    (await wikipediaSearch(bareName, bareName));

  // Real-world figures are looked up on Wikipedia first, but a profile can be
  // labelled historical by mistake (or be a real name attached to a fictional
  // character), so a miss here falls through to the wiki and anime sources.
  if (isHistorical) {
    const hit = await wikipediaHit();
    if (hit) return remember(hit);
  }

  if (wiki) {
    const hit = (await fandomImage(wiki, bareName)) ?? (await fandomImage(wiki, trimmed));
    if (hit) return remember(hit);
  } else if (universe) {
    for (const guessed of guessedFandomWikis(universe)) {
      const hit = await fandomImage(guessed, bareName);
      if (hit) return remember(hit);
    }
  }

  if (anime || !wiki) {
    const variants = [bareName, bareName.split(/\s+/).reverse().join(" "), bareName.split(/\s+/)[0]];
    for (const variant of variants) {
      const hit = await anilistImage(variant);
      if (hit) return remember(hit);
    }
  }

  const wikidata = await wikidataImage(bareName);
  if (wikidata) return remember(wikidata);

  return remember(await wikipediaHit());
}
