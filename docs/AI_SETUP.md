# AI Setup — Free-Model Character Research

Battle Arena can profile **any fictional or deceased historical character**, not only the curated
44. The profile is produced by a free open-weight model, validated, cached, and then passed to the
deterministic TypeScript engine. **The AI never decides a winner.**

## What is already implemented

- `POST /api/characters/research` accepts `{ "name": "Guts" }` and returns a complete character.
- Evidence is gathered from the free Wikipedia API (`en.wikipedia.org/w/api.php`).
- A free-only OpenRouter client builds the profile as strict JSON.
- Every attribute is clamped to 1–100; tags are restricted to the engine's counter vocabulary.
- Historical subjects must be confirmed deceased (`{"error":"living_person"}` is rejected).
- Profiles are cached for 30 days in the OS temp directory (`battle-arena/researched-characters.json`).
- Researched fighters are searchable, have profile pages, and can fight in all three modes.
- The Battle Setup screen exposes a **Research “name”** button; errors are shown inline.

## Required configuration

A free OpenRouter key is configured **server-side** in the root `.env`; every visitor uses it
without adding a model or key. The values look like:

```env
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=qwen/qwen3-next-80b-a3b-instruct:free
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
AI_TIMEOUT=90000
```

`AI_PROVIDER=mock` does not block research: the research client enables itself whenever
`OPENROUTER_API_KEY` is non-empty. Restart `next dev` after changing `.env`.

Never expose the key through `NEXT_PUBLIC_*`, a client component, a commit or a log. Keep it in
`.env` (git-ignored). Anyone who has seen the key should rotate it at
<https://openrouter.ai/keys> and update `.env`.

## Free-only guarantee

`packages/ai-engine/src/free-model.ts` refuses any model that is not a `:free` variant or the
`openrouter/free` router. There is no paid fallback and no env bypass in the research path.
If every free endpoint is rate-limited, the API returns a clear 429/503 instead of charging you.

Model order (first working free model wins):

1. `OPENROUTER_MODEL`, if it is free.
2. `qwen/qwen3-next-80b-a3b-instruct:free` — Apache-2.0 open weights.
3. `deepseek/deepseek-chat-v3-0324:free` — open weights, MIT-style model licence.
4. `google/gemma-3-27b-it:free` — Gemma open-weights licence.
5. `openrouter/free` — OpenRouter's free-only router.

Free-tier limits are roughly **50 requests/day** (or 1,000/day after buying 10 credits) and
**20 requests/minute**. `:free` model availability rotates; the fallback list handles retired IDs.

## Why research can be slow

A cold profile needs a Wikipedia lookup plus one free-model completion. Expect 10–60 seconds;
free models can ramble, so the pipeline repairs invalid JSON with a second model. Cached profiles
return immediately. The API route allows up to 120 seconds.

## Obscure characters

If Wikipedia has no page, the model still produces a conservative profile, but it is clearly
labelled **unverified** in the description and on the profile page. No feats are invented; unknown
values stay near 45–60. For best accuracy, use characters with a documented public page.

## Verification commands

```bash
# Is a key loaded? (never returns the key)
curl -s http://localhost:3000/api/characters/research

# Research one character (uses one free request)
curl -s -X POST http://localhost:3000/api/characters/research \
  -H "Content-Type: application/json" -d '{"name":"Guts"}'

# Run a battle with the researched id
curl -s -X POST http://localhost:3000/api/battle/run \
  -H "Content-Type: application/json" \
  -d '{"a":"gen-guts","b":"gojo-satoru","modes":["overall"],"seed":42}'
```

## Research page

Open `/research` (linked from the navbar, home page, roster and Battle Setup). Type any name; for
a side character add the franchise in brackets. The page shows the generated profile, its evidence
and a **Fight as** button. Cached profiles return immediately. If a roster or Battle Setup search
has no curated match, it offers the same research action inline.

The local research guard allows 30 requests per 10 minutes; OpenRouter's free tier is the real
ceiling at roughly 50 requests/day. If a free model cannot validate a very obscure character, or
the provider is temporarily rate-limited, the API returns a clearly labelled **baseline profile**
with conservative 50/100 attributes instead of failing. It is cached for 24 hours so it can still
be fought, and the result card offers **Try full research again**; a successful retry replaces it
with a validated AI profile.

## Live verification (8 November 2026)

- **Doraemon** — initially misclassified as historical; Wikipedia category evidence now forces
  fictional. Live profile created and playable.
- **Dekisugi (Doraemon)** — the first model returned Doraemon's profile; subject-name enforcement
  retried and returned Dekisugi's own academic/athletic profile.
- **Jaggu (Chhota Bheem)** — no dedicated Wikipedia page; franchise-level evidence is labelled and
  the side-character profile was created successfully.
- Doraemon vs Jaggu ran 100 trials with 10 reports. Battle outcomes still come only from the engine.
- The successful models were free (`openrouter/free` among them). No paid request was made.
- The key is not present in the client static bundle; it is read only in server routes.
