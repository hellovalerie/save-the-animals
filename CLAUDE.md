# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Two educational games built as ES modules with a shared codebase, bundled by Vite for Cloudflare Pages.

```
src/
  shared/
    tts.js                  — createSpeaker(clips, {lang}) factory used by both games
  beat-the-teacher/
    data.js                 — CHAPTERS, WORDS, ALL_RADICALS, game helpers
    tts-manifest.js         — Chinese TTS clip manifest (auto-generated)
    App.jsx                 — React component (speak hoisted to module scope)
    main.jsx                — createRoot entry point
  save-the-animals/
    data.js                 — WORD_DATA, ANIMALS, MASCOTS, genericPraise
    tts-manifest.js         — English TTS clip manifest (auto-generated)
    styles.css              — All game CSS including Google Fonts import
    main.js                 — Vanilla JS game logic

beat-the-teacher/
  index.html                — HTML entry for Vite (mounts #root, loads main.jsx)
save-the-animals/
  index.html                — HTML entry for Vite (full DOM, loads main.js)
index.html                  — Landing page linking to both games

scripts/
  generate-tts.mjs          — Synthesizes TTS clips and injects manifests
```

## Architecture

### beat-the-teacher
React 18 app. `src/beat-the-teacher/App.jsx` imports from `data.js` and `tts-manifest.js`. Key data:
- `CHAPTERS` — 8 chapters (ch0–ch6) grouping vocabulary
- `WORDS` — ~250+ word objects: `{ ch, chinese, pinyin, english, emoji, radical, radicalName, radicalChinese }`
- `ALL_RADICALS` — radical lookup table for Radical Mode
- Game phases: `menu` → `chapter` → `playing` → `win`
- Five modes: `english`, `chinese`, `radical`, `blank`, `nightmare`
- `buildBlankQuestion()` — fill-in-the-blank with sibling-character distractors
- `speak` — module-level, created by `createSpeaker(TTS_CLIPS, { lang: "zh" })`

### save-the-animals
Vanilla JS (not React). `src/save-the-animals/main.js` imports data and the shared TTS factory. Key data:
- `WORD_DATA` — ~100 English sight words with `{ chunks: [...], hint: '...' }`
- `ANIMALS` / `MASCOTS` — cosmetic game data
- Persistence via `localStorage` (`sightwords_flagged_v1`, `sightwords_rounds_v1`)
- `buildWeightedPool()` — flagged words appear 3x more often in rotation
- `speak` / `speakSeq` — from `createSpeaker(TTS_CLIPS, { lang: "en" })`

### Shared TTS (`src/shared/tts.js`)
`createSpeaker(clips, { lang })` returns `{ speak, speakSeq }`. Plays pre-generated Fish Audio mp3s
from S3, falls back to Web Speech API for any text missing from the manifest.

## Adding Content

To add words to **beat-the-teacher**, append to `WORDS` in `src/beat-the-teacher/data.js`. Each entry needs at minimum `{ ch, chinese, pinyin, english, emoji }`. Radical fields are optional but required for Radical Mode.

To add words to **save-the-animals**, add entries to `WORD_DATA` in `src/save-the-animals/data.js` with `{ chunks: [...], hint: '...' }`.

After adding or changing any spoken text, regenerate the TTS manifests (see below).

## Voice Audio (Fish TTS)

Both games speak through pre-generated Fish Audio TTS clips. English uses voice `55acd8e2296f4e758a8f8fbf2e6c57fa` (Theatrical Wizard); Chinese uses voice `9a941ae106cc4977ba37f21d2858e260` (故事讲述男声). `scripts/generate-tts.mjs` reads from the data modules, synthesizes via the self-hosted fish-audio MCP server (`https://fish.hellovalerie.com/mcp`, cached server-side), and injects a `text → clip key` manifest between the `FISH TTS MANIFEST` markers in each `tts-manifest.js`.

Regenerate after changing words or spoken phrases:

```bash
FISH_MCP_TOKEN=<token> node scripts/generate-tts.mjs
```

The token is the fish-audio-server MCP bearer token (not committed; see the fish-audio-server project).

## Build and Deployment

This repo deploys to Cloudflare Pages project `improved-octo-journey`.

Live routes:
- `/` — landing page
- `/save-the-animals/` — English sight words game
- `/beat-the-teacher/` — Chinese vocabulary game

Tech stack: Vite + React 18 (JSX plugin) + vanilla JS. Build output goes to `dist/` (git-ignored).

Build locally:

```bash
npm install
npm run build
```

Dev server (hot reload):

```bash
npm run dev
```

Cloudflare Pages config is in `wrangler.toml`:

```toml
name = "improved-octo-journey"
pages_build_output_dir = "dist"
compatibility_date = "2026-06-10"
```

GitHub Actions deployment is defined in `.github/workflows/deploy-cloudflare-pages.yml`. It runs on pushes to `main` and on manual `workflow_dispatch`, then:
- checks out the repo
- installs Node 20
- runs `npm ci` + `npm run build`
- deploys `dist/` with `cloudflare/wrangler-action@v3`

Required GitHub repository secrets:
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

The Cloudflare API token should be scoped for Pages deployment only, with `Account > Cloudflare Pages > Edit` on the account containing the Pages project.

For a local manual deploy:

```bash
npm run build
npx wrangler pages deploy dist --project-name improved-octo-journey --commit-dirty=true
```
