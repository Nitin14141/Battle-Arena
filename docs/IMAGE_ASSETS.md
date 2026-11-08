# Image Assets

## Source and served copies

Originals live in `images/` at the repository root (unmodified). Served copies live in
`apps/web/public/images/` with URL-safe filenames.

| Original | Served filename | Dimensions | Size |
|---|---|---|---|
| `Celestial Ring Fortress Arena.png` | `celestial-ring-fortress-arena.png` | 1672×941 | 2.67 MB |
| `Neon Cyberpunk Battle Arena.png` | `neon-cyberpunk-battle-arena.png` | 1672×941 | 2.61 MB |
| `Sunset Battle Arena Ruins.png` | `sunset-battle-arena-ruins.png` | 1671×941 | 2.55 MB |
| `Battle Arena_ Cosmic UI Triptych.png` | `cosmic-ui-triptych.png` | 1672×941 | 2.20 MB |
| `Neon Battle Arena Triptych-1.png` | `neon-battle-arena-triptych.png` | 1672×941 | 2.26 MB |
| `Battle Arena_ Cosmic UI Collection.png` | `cosmic-ui-collection.png` | 1672×941 | 2.20 MB |
| `website overview.png` | `website-overview.png` | 1672×941 | 2.29 MB |

All seven are PNG, roughly 16:9.

## Where they are used

| Asset | Usage |
|---|---|
| `celestial-ring-fortress-arena` | Homepage hero |
| `neon-cyberpunk-battle-arena` | Homepage closing CTA, arena gallery |
| `sunset-battle-arena-ruins` | Arena gallery |
| `cosmic-ui-triptych` | Arena gallery |
| `neon-battle-arena-triptych` | Arena gallery |
| `cosmic-ui-collection` | Arena gallery |
| `website-overview` | Reserved for the About page / documentation |

`lib/images.ts` assigns a stable arena backdrop to every character and matchup, so cards and the
results banner automatically use different artwork.

## Character visuals

There are currently **no character portrait files**. Instead of inventing or downloading
copyrighted portraits, each fighter gets a generated `CharacterEmblem`: initials, a themed
gradient, a glow and a ring. This is deterministic and works offline.

If you later add portraits, use these rules:

- Place originals in `images/characters/`.
- Filenames must match the character ID, e.g. `gojo-satoru.png`.
- Recommended size: 800×800 or larger, square, PNG/WebP.
- Do not rename or overwrite existing arena artwork.
- After adding files, copy them to `apps/web/public/images/characters/` and update the character
  profile `image` field (not yet wired) so the emblem can fall back if a portrait is missing.

## Optimisation note

The arena images are ~2.2–2.7 MB each. Next.js optimises them on demand, but the repository holds
two full copies (root source + public served copy). Before deployment, consider converting the
served copies to WebP at 1920px wide.

## Missing assets that would help

- A dedicated logo mark (currently a ⚡ glyph).
- Character portraits for the curated roster.
- Mode illustrations for intelligence / strength / overall.
- A social share image (1200×630).
