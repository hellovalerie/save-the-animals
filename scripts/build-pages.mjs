import { mkdir, readFile, rm, writeFile } from "node:fs/promises";

const dist = new URL("../dist/", import.meta.url);
const beatSource = new URL("../beat-the-teacher/beat-the-teacher.jsx", import.meta.url);
const animalsSource = new URL("../save-the-animals/save-the-animals.html", import.meta.url);

function reactPage(title) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="text/babel" data-presets="env,react" src="./app.jsx"></script>
  </body>
</html>
`;
}

function extractSingleMatch(source, pattern, label) {
  const match = source.match(pattern);
  if (!match) {
    throw new Error(`Could not extract ${label}`);
  }
  return match[1].trim();
}

await rm(dist, { recursive: true, force: true });
await mkdir(new URL("beat-the-teacher/", dist), { recursive: true });
await mkdir(new URL("save-the-animals/", dist), { recursive: true });

await writeFile(
  new URL("index.html", dist),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Learning Games</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #f7f3ea;
        color: #1f2933;
        display: grid;
        place-items: center;
        padding: 24px;
      }
      main { width: min(720px, 100%); }
      h1 { margin: 0 0 20px; font-size: clamp(2rem, 6vw, 4rem); line-height: 1; }
      .games { display: grid; gap: 14px; }
      a {
        display: block;
        padding: 20px;
        border: 2px solid #1f2933;
        border-radius: 8px;
        color: inherit;
        text-decoration: none;
        background: #fffef9;
        box-shadow: 0 5px 0 #1f2933;
      }
      a:focus-visible, a:hover { transform: translateY(-2px); }
      strong { display: block; font-size: 1.35rem; }
      span { display: block; margin-top: 6px; color: #53606f; }
    </style>
  </head>
  <body>
    <main>
      <h1>Learning Games</h1>
      <div class="games">
        <a href="/save-the-animals/">
          <strong>Save the Animals</strong>
          <span>English sight words adventure</span>
        </a>
        <a href="/beat-the-teacher/">
          <strong>Beat the Teacher</strong>
          <span>Chinese vocabulary practice</span>
        </a>
      </div>
    </main>
  </body>
</html>
`,
);

await writeFile(
  new URL("beat-the-teacher/index.html", dist),
  reactPage("Beat the Teacher"),
);

const beatApp = (await readFile(beatSource, "utf8"))
  .replace('import { useState, useRef } from "react";', "const { useState, useRef } = React;")
  .replace("export default function App()", "function App()");

await writeFile(
  new URL("beat-the-teacher/app.jsx", dist),
  `${beatApp}\nReactDOM.createRoot(document.getElementById("root")).render(<App />);\n`,
);

await writeFile(
  new URL("save-the-animals/index.html", dist),
  reactPage("Sight Words Adventure!"),
);

const animalsHtml = await readFile(animalsSource, "utf8");
const animalsCss = extractSingleMatch(animalsHtml, /<style>([\s\S]*?)<\/style>/, "save-the-animals CSS");
const animalsBody = extractSingleMatch(animalsHtml, /<body>([\s\S]*?)<script>/, "save-the-animals body");
const animalsScript = extractSingleMatch(animalsHtml, /<script>([\s\S]*?)<\/script>\s*<\/body>/, "save-the-animals script");

await writeFile(
  new URL("save-the-animals/app.jsx", dist),
  `const { useEffect } = React;

function App() {
  useEffect(() => {
    const runGame = new Function(${JSON.stringify(animalsScript)});
    runGame();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ${JSON.stringify(animalsCss)} }} />
      <div dangerouslySetInnerHTML={{ __html: ${JSON.stringify(animalsBody)} }} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
`,
);
