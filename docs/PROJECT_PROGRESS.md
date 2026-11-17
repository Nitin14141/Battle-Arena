# Battle Arena — Development Progress

_Last updated: 7 November 2026_

## Phase status

| Phase | Scope | Status | Completion |
|---|---|---|---:|
| A | Stabilize build, routes, broken buttons | Completed | 100% |
| B | End-to-end deterministic battle flow | Completed | 100% |
| C | Visual system, artwork, legal pages | Mostly complete | 90% |
| D | Real AI research and narration | In progress — live open-roster research | 75% |
| E | PostgreSQL, accounts, community | Not started | 10% |
| F | Admin auth, security audit, deployment | Not started | 10% |

Overall functional completion: **~54%** of the original master scope, with the playable core and live open-roster research finished.

## Phase A — Stabilize (complete)

- Fixed 24 TypeScript errors; `pnpm --filter battle-arena-web typecheck` passes.
- Removed the `/character-profile` 500 (caused by an undefined image source).
- Replaced fake selectors with working selectors that emit the selected profile.
- Added the missing `/battle-configuration` route.
- Rewrote the results component to match the API payload.
- Added `/about`, `/privacy`, `/terms`, `/not-found`.
- Fixed env loading: the root `.env` is now read by Next.js.
- Removed state updates during render in community, trending, history, profile and results.
- Removed obsolete AI-coupled duplicate engines and dead routes.

## Phase B — Battle flow (complete)

- One deterministic engine: 10 scenarios × 10 trials = 100 trials per mode.
- Seeded RNG (mulberry32) and stored seed; identical runs reproduce exactly.
- Draw and inconclusive bands; no forced winner.
- Ability-counter and weakness-exploitation modifiers.
- Scenario-specific attribute weighting, volatility and equipment effects.
- Ten deterministic reports per mode derived from the actual trial output.
- Full UI flow with real progress reveal, radar, tallies, confidence and JSON export.
- Local guest history (max 8 runs), guest profile and tournament gauntlet.

## Phase C — Visual system (90%)

- Seven arena artworks integrated across hero, gallery, cards, results and CTA.
- Generated emblem avatar system for every character (no fake portrait files).
- Responsive navigation with mobile menu, shared footer, legal pages.
- Remaining: optional real character portraits if supplied, final motion polish.

## Phase D — Any-character AI research (50%)

Built and type-checked:

- `POST /api/characters/research` turns **any name** into a validated character profile.
- Free Wikipedia evidence lookup (search + extract) with prompt-injection stripping.
- Free-only OpenRouter client: `:free` models only, no paid fallback, ordered model fallbacks.
- Strict Zod schema: 1–100 attribute clamps, controlled tag vocabulary, and real people who may be living or historical.
- Researched profiles are cached (30 days), searchable, have dynamic profile pages and can fight
  in all three modes. The deterministic engine still computes every outcome.
- Battle Setup exposes “Research “name””, shows progress and surfaces API errors inline.

Live:

- A free OpenRouter key is configured server-side; every visitor uses it automatically.
- Doraemon, Dekisugi (Doraemon), Jaggu (Chhota Bheem), Mahatma Gandhi and Beyonder were researched and played successfully.
- A dedicated `/research` page plus links from the navbar, home, roster and Battle Setup make any-character research discoverable; the roster now shows cached researched fighters.
- Battle Setup now has a primary research button directly under the name field, a loading status, and a full-research-page fallback link.
- If a free model cannot validate a very obscure character, a clearly labelled 24-hour baseline profile keeps them playable while allowing a later retry.
- Gandhi vs Beyonder ran 100 trials with 10 reports, confirming cross-era historical-vs-fiction battles.
- Free models can return prose instead of JSON; the pipeline repairs with a second model and JSON mode.
- Subject-name enforcement stops a model from substituting the franchise's main character.
- Narration, evidence-review UI and a model registry are not built yet.

Verified end-to-end with a temporary fixture and a **local mock OpenRouter endpoint** (no real key,
no paid or free quota used): research → Wikipedia evidence → JSON validation → cache → generated
profile page → 100-trial battle with 10 reports. “Guts” resolves “Guts (Berserk)” ahead of
“Guts (album)” using page-category ranking. Test fixture and cache removed.

Live verification: Doraemon, Dekisugi and Jaggu were researched; Doraemon vs Jaggu ran 100 trials
with 10 reports. The key is server-side only and absent from the client bundle.

## Phase E — Data and accounts

- Expand Prisma schema to the full entity list, migrate and seed the roster.
- Auth.js, server history, voting, community threads, trending rankings.

## Phase F — Security and deployment

- Admin authorization, rate limiting, CSRF, deployment and backup plan.

## Verification evidence (7 November 2026)

- `pnpm --filter battle-arena-web typecheck` — passes with 0 errors.
- `pnpm --filter battle-arena-web build` — passes; 69 pages generated, including 44 character profiles.
- All 20 routes return HTTP 200 (or the intended 307 redirect from `/battle` and `/character-profile`).
- Battle API, seed 42, all three modes: 100 trials per mode, 10 scenarios, 10 reports, tallies sum to 100, draws and inconclusive outcomes present.
- Identical seed reproduces identical tallies; a different seed changes them.
- Input guards verified: same fighter → 400, unknown fighter → 404, empty mode list → 400.
- Browser click-through completed: configuration → run 100 trials → results with winner, tallies, radar, seed and ten reports.
- Fixed a missing `next/image` dimension that caused 500s on home, roster, trending and character pages.
- Removed the `useSearchParams` Suspense dependency from setup, configuration and results so the pages hydrate reliably.
- Made the headline decisive factor winner-scoped; it previously could name the losing fighter.

## Known limitations

- Docker is not installed on the development machine, so PostgreSQL is not running.
- Guest data is local to one browser and limited to eight saved runs.
- Community threads are read-only samples.
- AI provider is not called during a battle; it only builds character profiles.
- Free AI research is capped at roughly 50 new characters/day by OpenRouter's free tier.
- Free-model quality and latency vary; invalid JSON is repaired once, then reported clearly.
- Researched profiles live in an OS-temp cache, not PostgreSQL, until Phase E.
- Characters without a Wikipedia page are labelled unverified.
