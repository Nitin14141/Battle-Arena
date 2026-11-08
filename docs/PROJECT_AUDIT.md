# Project Audit — 7 November 2026

Audit performed before any edits, using the type checker, a running dev server on port 3111 and
direct API calls.

## Original state

| Module | Status | Completion | Evidence |
|---|---|---:|---|
| Project setup | Partial | 80% | Monorepo installed; typecheck failed with 24 errors |
| Frontend | Partial | 55% | 18 routes rendered; `/character-profile` returned 500 |
| UI/UX | Partial | 60% | Strong visuals; broken placeholders; no mobile nav |
| Database | Partial | 15% | 8 models vs 28 required; no migrations or seed |
| Character system | Partial | 15% | 5 hardcoded mocks; no portraits |
| AI integration | Partial | 25% | Provider class existed but was bypassed at runtime |
| Research system | Partial | 20% | Wikipedia/Wikidata adapters unused |
| Intelligence mode | Partial | 20% | Engine inputs mismatched |
| Strength mode | Partial | 20% | Same |
| Overall mode | Partial | 20% | Same |
| Simulation engine | Partial | 35% | Correct RNG concept, wrong orchestration |
| Battle reports | UI-only | 10% | Never called |
| Authentication | UI-only | 5% | Fake magic link; no NextAuth route |
| Security | Partial | 30% | Headers and sanitizers only |
| Deployment | Partial | 10% | Draft Docker/nginx |
| **Overall** | | **~30%** | |

## Root causes found

1. **AI never ran.** `getEnv()` required `REDIS_URL`, which was absent. `.env` also sat at the repo
   root while Next ran in `apps/web`, so Next never loaded it. `AIService` silently fell back to
   `MockAIProvider`, which returns `scoreA/scoreB`, while the enhanced engines read `aScore/bScore`.
   Result: every trial was `0 vs 0` and every battle reported `b_wins`.
2. **Results component never matched the API.** The API returned
   `{ data: { overall, scenarioResults } }`; the component read `data.results` and `data.reports`
   and rendered `null`.
3. **Selection was impossible.** `CharacterSearch` had no `onSelect` prop, yet the setup page
   passed one and expected a selected character.
4. **Missing route.** “Proceed to Configuration” navigated to `/battle-configuration`, which did
   not exist.
5. **Fake trials.** The enhanced engines made one AI request per scenario and copied the same score
   into 100 trials — not a simulation. The orchestrator then multiplied that to 1,000 trials per mode.
6. **Broken images.** `/images/placeholder-character-*.jpg` never existed; `ArenaImage` called
   `startsWith` on `undefined` and crashed the profile route.
7. **Render-phase state updates** in community, trending, battle history, profile and results.
8. **Inaccurate documentation.** `docs/PROJECT_PROGRESS.md` claimed Phases 0–12 at 100%.

## Fixes applied in Phases A and B

- One deterministic engine with a declared scenario set and seeded RNG.
- AI removed from the outcome path; reports generated from engine output.
- Type-safe shared contracts for profiles, results and reports.
- Curated 44-character roster with evidence labels and weakness tags.
- Full working flow and local persistence.
- Missing pages and routes added; legacy routes redirect.
- Env loading fixed and env validation made non-fatal for optional services.
- Obsolete/dead code removed (see `CLEANUP_REPORT.md`).

## Remaining high-priority work

1. Phase D: real AI research and narration with a free-only OpenRouter guard.
2. Phase E: PostgreSQL, migrations, seed, accounts, server history, community.
3. Phase F: admin authorization, rate limiting, deployment verification.

## Verification after Phases A/B

- `tsc --noEmit`: passes (recorded in phase report).
- Every route returns HTTP 200.
- Battle API returns 100 trials per mode for all three modes.
- Same seed reproduces the same winner and tallies.
