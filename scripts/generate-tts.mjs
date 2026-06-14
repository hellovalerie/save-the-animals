// Pre-generates Fish Audio TTS clips for every string the games can speak and
// injects a { text -> clip key } manifest into each game source between the
// FISH TTS MANIFEST markers. Run after changing any spoken text:
//
//   FISH_MCP_TOKEN=... node scripts/generate-tts.mjs
//
// The Fish MCP server caches by (text, voice, ...), so re-runs only synthesize
// new strings.

import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const MCP_URL = process.env.FISH_MCP_URL || "https://fish.hellovalerie.com/mcp";
const MCP_TOKEN = process.env.FISH_MCP_TOKEN;
const EN_VOICE = "55acd8e2296f4e758a8f8fbf2e6c57fa"; // Theatrical Wizard
const ZH_VOICE = "9a941ae106cc4977ba37f21d2858e260"; // 故事讲述男声 (Story Narrator)
const CONCURRENCY = 4;
const ATTEMPTS = 5;

if (!MCP_TOKEN) {
  console.error("FISH_MCP_TOKEN is required");
  process.exit(1);
}

const animalsPath = new URL("../save-the-animals/save-the-animals.html", import.meta.url);
const beatPath = new URL("../beat-the-teacher/beat-the-teacher.jsx", import.meta.url);

function extractLiteral(source, pattern, label) {
  const match = source.match(pattern);
  if (!match) throw new Error(`Could not extract ${label}`);
  return vm.runInNewContext(`(${match[1]})`);
}

// ----- collect spoken strings -----

const animalsHtml = await readFile(animalsPath, "utf8");
const WORD_DATA = extractLiteral(animalsHtml, /const WORD_DATA = (\{[\s\S]*?\n\});/, "WORD_DATA");
const ANIMALS = extractLiteral(animalsHtml, /const ANIMALS = (\[[\s\S]*?\n\]);/, "ANIMALS");
const genericPraise = extractLiteral(animalsHtml, /const genericPraise = (\[[\s\S]*?\n  \]);/, "genericPraise");

const enTexts = new Set();
for (const word of Object.keys(WORD_DATA)) {
  enTexts.add(word);
  enTexts.add(`The word is ${word}. Try again next time!`);
}
for (const praise of genericPraise) enTexts.add(praise);
for (const a of ANIMALS) {
  const lower = a.name.toLowerCase();
  enTexts.add(`Let's save the ${a.name}!`);
  enTexts.add(`The ${lower} thank you!`);
  enTexts.add(`You just rescued ${a.singular}!`);
  enTexts.add(`${a.name} everywhere are cheering!`);
  enTexts.add(a.shout);
  for (let n = 0; n <= 10; n++) enTexts.add(`You rescued ${n} ${lower}!`);
}
for (const title of ["PERFECT!", "Super Star!", "Great Job!", "Good Try!"]) enTexts.add(title);

const beatJsx = await readFile(beatPath, "utf8");
const WORDS = extractLiteral(beatJsx, /const WORDS = (\[[\s\S]*?\n\]);/, "WORDS");

const zhTexts = new Set();
for (const w of WORDS) {
  zhTexts.add(w.chinese);          // english / chinese / nightmare modes
  zhTexts.add(w.chinese[0]);       // radical mode + fill-the-blank prompt
}

// ----- synthesize -----

async function tts(text, voiceId) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(MCP_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MCP_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: { name: "text_to_speech", arguments: { text, voice_id: voiceId } },
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.text();
      const dataLine = raw.split("\n").find((l) => l.startsWith("data: "));
      const rpc = JSON.parse(dataLine ? dataLine.slice(6) : raw);
      if (rpc.error) throw new Error(rpc.error.message);
      const payload = rpc.result.content[0].text;
      if (rpc.result.isError) throw new Error(payload);
      return JSON.parse(payload).url;
    } catch (err) {
      if (attempt >= ATTEMPTS) throw new Error(`tts failed for "${text}": ${err.message}`);
      await new Promise((r) => setTimeout(r, 3000 * attempt));
    }
  }
}

async function generateAll(texts, voiceId, label) {
  const queue = [...texts];
  const urls = new Map();
  const failed = [];
  let done = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let text; (text = queue.shift()) !== undefined; ) {
        try {
          urls.set(text, await tts(text, voiceId));
        } catch (err) {
          console.error(`  ${label}: ${err.message} (will retry at end)`);
          failed.push(text);
        }
        done++;
        if (done % 50 === 0) console.log(`  ${label}: ${done}/${texts.size}`);
      }
    }),
  );
  for (const text of failed) urls.set(text, await tts(text, voiceId)); // serial retry pass
  console.log(`  ${label}: ${texts.size}/${texts.size} done`);
  return urls;
}

console.log(`Generating ${enTexts.size} English + ${zhTexts.size} Chinese clips…`);
const enUrls = await generateAll(enTexts, EN_VOICE, "en");
const zhUrls = await generateAll(zhTexts, ZH_VOICE, "zh");

// ----- inject manifests -----

function toManifest(urls) {
  let base = null;
  const clips = {};
  for (const [text, url] of urls) {
    const slash = url.lastIndexOf("/") + 1;
    const urlBase = url.slice(0, slash);
    base ??= urlBase;
    if (urlBase !== base) throw new Error(`URL base mismatch: ${url}`);
    clips[text] = url.slice(slash).replace(/\.mp3$/, "");
  }
  return { base, clips };
}

function inject(source, { base, clips }) {
  const entries = Object.keys(clips)
    .sort()
    .map((text) => `  ${JSON.stringify(text)}: ${JSON.stringify(clips[text])},`)
    .join("\n");
  const block =
    `// === FISH TTS MANIFEST START (auto-generated — do not edit by hand) ===\n` +
    `const TTS_BASE = ${JSON.stringify(base)};\n` +
    `const TTS_CLIPS = {\n${entries}\n};\n` +
    `// === FISH TTS MANIFEST END ===`;
  const pattern = /\/\/ === FISH TTS MANIFEST START[\s\S]*?\/\/ === FISH TTS MANIFEST END ===/;
  if (!pattern.test(source)) throw new Error("Manifest markers not found");
  return source.replace(pattern, block);
}

await writeFile(animalsPath, inject(animalsHtml, toManifest(enUrls)));
await writeFile(beatPath, inject(beatJsx, toManifest(zhUrls)));
console.log("Manifests injected into both game sources.");
