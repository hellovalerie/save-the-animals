# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal educational games project with two games in separate subdirectories:

- **`save-the-animals/save-the-animals.html`** — Self-contained HTML/CSS/JS sight words game for young English learners. No build step; open directly in a browser.
- **`beat-the-teacher/beat-the-teacher.jsx`** — React JSX file for a Chinese vocabulary game (学中文). No build setup exists in this repo; it is intended to be used in a React environment (e.g. pasted into a CodeSandbox, Vite project, or similar).

## Architecture

### save-the-animals/save-the-animals.html
Single-file app with all CSS, JS, and markup inline. Key sections:
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
