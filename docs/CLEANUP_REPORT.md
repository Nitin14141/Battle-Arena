# Cleanup Report — Phases A/B

Nothing user-created was deleted. The original artwork in `images/` is untouched. Only dead code
that could not compile or was superseded was removed.

## Removed files

| File | Reason | Referenced? | Safe? |
|---|---|---|---|
| `packages/simulation-engine/src/intelligence-enhanced.ts` | Called AI for outcomes, read wrong fields, failed to compile | Only from old index | Yes |
| `packages/simulation-engine/src/strength-enhanced.ts` | Same | Only from old index | Yes |
| `packages/simulation-engine/src/overall-enhanced.ts` | Same | Only from old index | Yes |
| `packages/simulation-engine/src/intelligence.ts` | Superseded by the unified engine | Only from old index | Yes |
| `packages/simulation-engine/src/strength.ts` | Superseded | Only from old index | Yes |
| `packages/simulation-engine/src/overall.ts` | Superseded | Only from old index | Yes |
| `packages/simulation-engine/src/overall-battle.ts` | Duplicate orchestrator | No | Yes |
| `packages/simulation-engine/src/strength-battle.ts` | Duplicate orchestrator | No | Yes |
| `packages/report-engine/src/intelligence.ts` | AI-dependent, unused | Yes, by index only | Yes |
| `packages/report-engine/src/strength.ts` | AI-dependent, unused | Yes, by index only | Yes |
| `packages/report-engine/src/overall.ts` | AI-dependent, unused | Yes, by index only | Yes |
| `packages/report-engine/src/enhanced-reports.ts` | AI-dependent, unused | No | Yes |
| `apps/web/src/app/api/battles/**` | Superseded by `/api/battle/run` | Old battle page only | Yes |
| `apps/web/src/app/api/admin/claims` | Static mock data | Old admin page only | Yes |
| `apps/web/src/app/api/admin/research` | Did nothing | Old admin page only | Yes |
| `apps/web/src/app/api/admin/usage` | Fake metrics | Old admin page only | Yes |

## Replaced (not deleted)

- `apps/web/src/components/CharacterSearch.tsx` is now unused; the working
  `CharacterSelector.tsx` replaced it. The old file can be deleted in a later cleanup pass after
  confirming no imports remain.
- `apps/web/src/components/BattleModeCard.tsx` is unused after the homepage rewrite.
- `apps/web/src/components/ui/Button.tsx` remains for future use.

## Renamed assets

The seven artwork files in `apps/web/public/images/` were renamed from spaces to URL-safe slugs.
The originals remain untouched in `images/`.

## Preserved

- `.git`, `.env`, `.env.example`
- All user artwork in `images/` and `apps/web/public/images/`
- Prisma schema (will be expanded, not replaced, in Phase E)
- Docker, nginx, worker and validation packages
