# Battle Arena

**Every Universe. Every Legend. One Battlefield.**

AI-assisted fictional and historical character battles with a deterministic simulation engine,
ten scenarios and one hundred trials per mode.

## Current status

Phases **A (stabilize)** and **B (battle flow)** are complete. Phases C–F are queued. See
[`docs/PROJECT_PROGRESS.md`](docs/PROJECT_PROGRESS.md).

What works today:

- Clean TypeScript build and every route renders.
- Full flow: roster → battle setup → configuration → progress → results.
- 44 curated fighters (fictional and deceased historical) with full attribute profiles.
- **Any character** can be researched at `/research` with a free open-weight model, validated and
  added to the roster. The 44 curated fighters are just the starting roster; the free key is
  configured server-side (see `docs/AI_SETUP.md`).
- 10 fixed scenarios × 10 trials = 100 trials per mode; deterministic seeded RNG.
- Three modes, individually or together, with draws and inconclusive outcomes.
- Ten data-grounded reports per mode, attribute radar, tally, confidence and reproducible seed.
- Local guest history, guest profile, eight-fighter tournament gauntlet.
- Character explorer with search, category/universe filters and profile pages.
- Seven arena artworks used across the site plus generated emblem avatars.

What is intentionally not built yet:

- AI battle narration and an evidence-review UI (Phase D; character research is live with a
  server-side free key).
- PostgreSQL persistence, accounts, community posting/voting (Phase E).
- Admin authentication, deployment hardening (Phase F).

## Requirements

- Node.js ≥ 22
- pnpm 11

## Setup

```bash
pnpm install
pnpm --filter battle-arena-web dev
```

Open http://localhost:3000.

The workspace keeps one `.env` at the repository root. `apps/web/next.config.js` loads it for
Next.js; Prisma reads it for migrations.

## Useful commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the web app |
| `pnpm --filter battle-arena-web typecheck` | Type-check the web app and packages it imports |
| `pnpm build` | Production build |
| `pnpm check` | Run each package's type check |
| `pnpm prisma:generate` | Generate the Prisma client |

## Structure

```
apps/web                 Next.js 15 app (UI + API routes)
apps/worker              BullMQ worker (stub until Phase E)
packages/shared          Types, constants, env, logging
packages/simulation-engine  Deterministic 10×10 battle engine
packages/report-engine   Deterministic report generation
packages/ai-engine       OpenRouter / Ollama / mock providers (Phase D)
packages/research-engine Wikipedia + Wikidata adapters (Phase D)
packages/validation      Sanitizers and Zod schemas
packages/database        Prisma client
prisma/schema.prisma     Database schema (Phase E expansion)
images/                  Original artwork (source of the public copies)
apps/web/public/images   Optimised filenames served by Next.js
```

## Simulation rules

- The engine never calls an AI provider.
- The AI layer, when enabled, may only describe engine output.
- Winners, win rates and seeds are never rewritten for narrative effect.
- Same characters, modes and seed produce the same result.

## Artwork

All artwork is user-supplied and lives in `images/` with a served copy under
`apps/web/public/images/`. See [`docs/IMAGE_ASSETS.md`](docs/IMAGE_ASSETS.md) for the inventory
and naming.
