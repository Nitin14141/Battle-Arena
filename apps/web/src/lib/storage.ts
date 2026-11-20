import type { BattleMode, BattleRunResult, CharacterProfile } from "@battle-arena/shared";

const HISTORY_KEY = "battle-arena:history:v1";
const LAST_RUN_KEY = "battle-arena:last-run:v1";
const GUEST_KEY = "battle-arena:guest:v1";
const PENDING_KEY = "battle-arena:pending:v1";
const RESEARCH_KEY = "battle-arena:researched:v1";
const MAX_STORED_RUNS = 8;
const MAX_RESEARCHED_PROFILES = 40;

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

function readJson<T>(storage: Storage, key: string): T | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function saveLastRun(run: BattleRunResult): void {
  if (!hasWindow()) return;
  try {
    sessionStorage.setItem(LAST_RUN_KEY, JSON.stringify(run));
  } catch {
    // Storage can be full or blocked; history below is best-effort too.
  }
}

export function readLastRun(): BattleRunResult | null {
  if (!hasWindow()) return null;
  return readJson<BattleRunResult>(sessionStorage, LAST_RUN_KEY);
}

export function saveRunToHistory(run: BattleRunResult): void {
  if (!hasWindow()) return;
  const existing = listRunHistory().filter((entry) => entry.runId !== run.runId);
  const next = [run, ...existing].slice(0, MAX_STORED_RUNS);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next.slice(0, 3)));
    } catch {
      // Ignore: private mode can refuse all writes.
    }
  }
}

export function listRunHistory(): BattleRunResult[] {
  if (!hasWindow()) return [];
  const runs = readJson<BattleRunResult[]>(localStorage, HISTORY_KEY);
  if (!Array.isArray(runs)) return [];
  return runs.filter((run) => Boolean(run?.runId && run.modes?.length));
}

export function getRunById(runId: string): BattleRunResult | null {
  return listRunHistory().find((run) => run.runId === runId) ?? null;
}

export function deleteRun(runId: string): void {
  if (!hasWindow()) return;
  const next = listRunHistory().filter((run) => run.runId !== runId);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export function clearRunHistory(): void {
  if (!hasWindow()) return;
  localStorage.removeItem(HISTORY_KEY);
  sessionStorage.removeItem(LAST_RUN_KEY);
}

export interface PendingBattle {
  a: string;
  b: string;
  modes: BattleMode[];
  seed: number;
}

export function savePendingBattle(pending: PendingBattle): void {
  if (!hasWindow()) return;
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

export function readPendingBattle(): PendingBattle | null {
  if (!hasWindow()) return null;
  return readJson<PendingBattle>(sessionStorage, PENDING_KEY);
}

/* ── Researched profiles ──────────────────────────────────────
 * The server cache lives on ephemeral storage per instance, so a researched
 * fighter can disappear between pages. The browser keeps its own copy and the
 * battle pages read from it, which makes a researched matchup always playable.
 */
export function saveResearchedProfile(profile: CharacterProfile): void {
  if (!hasWindow() || !profile?.id) return;
  const existing = listResearchedProfiles().filter((entry) => entry.id !== profile.id);
  try {
    localStorage.setItem(RESEARCH_KEY, JSON.stringify([profile, ...existing].slice(0, MAX_RESEARCHED_PROFILES)));
  } catch {
    try {
      localStorage.setItem(RESEARCH_KEY, JSON.stringify([profile, ...existing].slice(0, 8)));
    } catch {
      // Private mode can refuse writes; the server cache still usually works.
    }
  }
}

export function listResearchedProfiles(): CharacterProfile[] {
  if (!hasWindow()) return [];
  const profiles = readJson<CharacterProfile[]>(localStorage, RESEARCH_KEY);
  if (!Array.isArray(profiles)) return [];
  return profiles.filter((profile) => Boolean(profile?.id && profile?.name && profile.intelligence));
}

export function readResearchedProfile(id: string): CharacterProfile | null {
  return listResearchedProfiles().find((profile) => profile.id === id) ?? null;
}

export interface GuestProfile {
  name: string;
}

export function readGuestProfile(): GuestProfile {
  if (!hasWindow()) return { name: "Guest Commander" };
  const stored = readJson<GuestProfile>(localStorage, GUEST_KEY);
  return stored?.name ? stored : { name: "Guest Commander" };
}

export function saveGuestProfile(profile: GuestProfile): void {
  if (!hasWindow()) return;
  localStorage.setItem(GUEST_KEY, JSON.stringify(profile));
}
