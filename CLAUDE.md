# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal educational games project with two games in separate subdirectories:

- **`save-the-animals/save-the-animals.html`** — Source content for the English sight words game. The deploy build extracts its CSS, markup, and script into a React-mounted route.
- **`beat-the-teacher/beat-the-teacher.jsx`** — React JSX source for a Chinese vocabulary game (学中文).
- **`scripts/build-pages.mjs`** — Generates the Cloudflare Pages-ready `dist/` directory. Both game routes are emitted as the same runtime shape: `index.html` + React 18 UMD + Babel Standalone + `app.jsx`.

## Architecture

### save-the-animals/save-the-animals.html
Single-file source with all CSS, JS, and markup inline. `scripts/build-pages.mjs` extracts these sections and wraps them in a React component for deployment. Key sections:
- `WORD_DATA` — ~100 English sight words with phonics chunks and hints
- `ANIMALS` / `MASCOTS` — cosmetic game data
- Persistence via `localStorage` (`sightwords_flagged_v1`, `sightwords_rounds_v1`)
- `buildWeightedPool()` — flagged words appear 3x more often in rotation
- `speak()` — Web Speech API (SpeechSynthesis) for audio

### beat-the-teacher/beat-the-teacher.jsx
Single-component React app (`export default function App`). Key data:
- `CHAPTERS` — 8 chapters (ch0–ch6) grouping vocabulary
- `WORDS` — ~250+ word objects with `{ ch, chinese, pinyin, english, emoji, radical, radicalName, radicalChinese }`
- `ALL_RADICALS` — full radical lookup table used in Radical Mode
- Game phases: `menu` → `chapter` → `playing` → `win`
- Five game modes: `english`, `chinese`, `radical`, `blank`, `nightmare`
- `buildBlankQuestion()` — constructs fill-in-the-blank questions with sibling-character distractors
- `speak()` — Web Speech API targeting `zh-CN` voice

## Adding Content

To add words to `beat-the-teacher/beat-the-teacher.jsx`, append to the `WORDS` array with the correct `ch` field matching an existing chapter id. Each word object requires at minimum `{ ch, chinese, pinyin, english, emoji }`. Radical fields (`radical`, `radicalName`, `radicalChinese`) are optional but required for the word to appear in Radical Mode.

To add words to `save-the-animals/save-the-animals.html`, add an entry to `WORD_DATA` with `{ chunks: [...], hint: '...' }`.

After adding or changing any spoken text, regenerate the TTS manifests (see below).

## Voice Audio (Fish TTS)

Both games speak through pre-generated Fish Audio TTS clips instead of the Web Speech API. English uses voice `55acd8e2296f4e758a8f8fbf2e6c57fa` (Theatrical Wizard); Chinese uses voice `9a941ae106cc4977ba37f21d2858e260` (故事讲述男声). `scripts/generate-tts.mjs` extracts every speakable string from both sources, synthesizes them via the self-hosted fish-audio MCP server (`https://fish.hellovalerie.com/mcp`, cached server-side), and injects a `text → clip key` manifest between the `FISH TTS MANIFEST` markers in each source file. The clips are served as public S3 mp3 URLs; `speak()` plays them with an `Audio` element and falls back to SpeechSynthesis for any text missing from the manifest.

Regenerate after changing words or spoken phrases:

```bash
FISH_MCP_TOKEN=<token> node scripts/generate-tts.mjs
```

The token is the fish-audio-server MCP bearer token (not committed; see the fish-audio-server project).

## Build and Deployment

This repo deploys to Cloudflare Pages project `improved-octo-journey`.

Live routes:
- `/` — generated index page linking to both games
- `/save-the-animals/` — generated React/Babel route from `save-the-animals/save-the-animals.html`
- `/beat-the-teacher/` — generated React/Babel route from transformed `beat-the-teacher/beat-the-teacher.jsx`

Both game routes use the same deployed tech stack:
- static Cloudflare Pages hosting
- React 18 UMD
- ReactDOM 18 UMD
- Babel Standalone for in-browser JSX transform
- one route-local `app.jsx` entry mounted at `#root`

Build locally with:

```bash
node scripts/build-pages.mjs
```

The script deletes and recreates `dist/`. `dist/` is generated output and is ignored by git.

Cloudflare Pages config is in `wrangler.toml`:

```toml
name = "improved-octo-journey"
pages_build_output_dir = "dist"
compatibility_date = "2026-06-10"
```

GitHub Actions deployment is defined in `.github/workflows/deploy-cloudflare-pages.yml`. It runs on pushes to `main` and on manual `workflow_dispatch`, then:
- checks out the repo
- installs Node 20
- runs `node scripts/build-pages.mjs`
- deploys `dist/` with `cloudflare/wrangler-action@v3`

Required GitHub repository secrets:
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

The Cloudflare API token should be scoped for Pages deployment only, with `Account > Cloudflare Pages > Edit` on the account containing the Pages project.

For a local manual deploy, build first and then run:

```bash
node scripts/build-pages.mjs
npx wrangler pages deploy dist --project-name improved-octo-journey --commit-dirty=true
```
