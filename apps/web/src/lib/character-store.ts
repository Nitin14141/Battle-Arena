import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { CharacterProfile } from "@battle-arena/shared";

/**
 * Persistent cache for AI-researched characters.
 *
 * This is a cache, not the canonical database: Phase E replaces it with
 * PostgreSQL. Until then it keeps researched fighters available across
 * requests and restarts, and it lives outside the project tree so writing it
 * never triggers a Next.js dev reload.
 */

const DATA_DIR = process.env.RESEARCH_CACHE_DIR || path.join(os.tmpdir(), "battle-arena");
const DATA_FILE = path.join(DATA_DIR, "researched-characters.json");
const MAX_ENTRIES = 300;
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const FALLBACK_TTL_MS = 24 * 60 * 60 * 1000;

export interface ResearchedEntry {
  profile: CharacterProfile;
  model: string;
  createdAt: string;
  sourced: boolean;
  fallback?: boolean;
}

type Store = Record<string, ResearchedEntry>;

let memory: Store | null = null;
let loading: Promise<Store> | null = null;
let writeChain: Promise<void> = Promise.resolve();

async function load(): Promise<Store> {
  if (memory) return memory;
  if (loading) return loading;

  loading = (async () => {
    try {
      const raw = await fs.readFile(DATA_FILE, "utf8");
      const parsed = JSON.parse(raw) as Store;
      memory = parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      memory = {};
    }
    return memory;
  })();

  return loading;
}

function prune(store: Store): void {
  const now = Date.now();
  // Keep the newest 300 entries and drop anything past the cache TTL.
  const entries = Object.entries(store)
    .filter(
      ([, entry]) =>
        now - Date.parse(entry.createdAt) < (entry.fallback ? FALLBACK_TTL_MS : TTL_MS),
    )
    .sort((a, b) => Date.parse(b[1].createdAt) - Date.parse(a[1].createdAt));

  for (const key of Object.keys(store)) delete store[key];
  for (const [key, entry] of entries.slice(0, MAX_ENTRIES)) store[key] = entry;
}

async function persist(store: Store): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const temp = `${DATA_FILE}.${process.pid}.tmp`;
    await fs.writeFile(temp, JSON.stringify(store, null, 2), "utf8");
    await fs.rename(temp, DATA_FILE);
  } catch (error) {
    // An unwritable cache must never fail a battle: memory still has the profile.
    console.error("Could not persist researched character cache:", error);
  }
}

export async function saveResearchedCharacter(entry: ResearchedEntry): Promise<void> {
  const store = await load();
  store[entry.profile.id] = entry;
  prune(store);

  writeChain = writeChain.then(() => persist(store), () => persist(store));
  await writeChain;
}

export async function getResearchedCharacter(id: string): Promise<ResearchedEntry | null> {
  const store = await load();
  const entry = store[id];
  if (!entry) return null;
  if (Date.now() - Date.parse(entry.createdAt) > (entry.fallback ? FALLBACK_TTL_MS : TTL_MS)) {
    delete store[id];
    return null;
  }
  return entry;
}

export async function listResearchedCharacters(limit = 100): Promise<CharacterProfile[]> {
  const store = await load();
  return Object.values(store)
    .filter(
      (entry) => Date.now() - Date.parse(entry.createdAt) < (entry.fallback ? FALLBACK_TTL_MS : TTL_MS),
    )
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, limit)
    .map((entry) => entry.profile);
}

export async function findResearchedCharacters({
  query,
  category,
  universe,
  limit = 20,
}: {
  query?: string;
  category?: "fictional" | "historical" | "all";
  universe?: string;
  limit?: number;
}): Promise<CharacterProfile[]> {
  const normalized = (query ?? "").trim().toLowerCase();
  const all = await listResearchedCharacters(MAX_ENTRIES);

  return all
    .filter((character) => {
      if (category && category !== "all" && character.category !== category) return false;
      if (universe && universe !== "all" && character.universe !== universe) return false;
      if (!normalized) return true;
      const haystack = [
        character.name,
        character.universe,
        character.origin,
        character.era ?? "",
        ...character.aliases,
        ...character.tags,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    })
    .slice(0, limit);
}
