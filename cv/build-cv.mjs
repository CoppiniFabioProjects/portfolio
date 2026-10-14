// Genera i PDF del CV in public/: cv-fabio-coppini.pdf (IT) e cv-fabio-coppini-en.pdf (EN).
//
// Uso:  npm run cv
//       node cv/build-cv.mjs <cartella>   → salva anche un'anteprima PNG per lingua
//
// Serve Playwright, che non è tra le dipendenze del sito (il deploy non lo usa):
//   npm i --no-save playwright && npx playwright install chromium
// Per usare un Chromium già installato: CHROMIUM_PATH=/percorso/chrome npm run cv
import { readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { cv } from "./content.mjs";
import { renderCv } from "./template.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const previewDir = process.argv[2];

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Serve Playwright: npm i --no-save playwright && npx playwright install chromium");
  process.exit(1);
}

// font incorporati in base64: il PDF non dipende dai font di sistema né dalla rete
const font = (file, family, weight) =>
  `@font-face{font-family:"${family}";font-weight:${weight};font-style:normal;` +
  `src:url(data:font/woff2;base64,${readFileSync(join(here, "..", "public", "fonts", file)).toString("base64")}) format("woff2");}`;
const fontsCss = [
  font("Inter.woff2", "Inter", "400 700"),
  font("JetBrainsMono.woff2", "JetBrains Mono", "400 500"),
  font("Fraunces.woff2", "Fraunces", "400 600"),
].join("\n");

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
// A4 a 96 dpi; scala 2 per anteprime nitide
const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
let ok = true;

for (const d of Object.values(cv)) {
  await page.setContent(renderCv(d, fontsCss), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);

  // il CV è di una pagina: misura lo spazio libero in fondo a ogni colonna
  // (negativo = testo fuori pagina: meglio fermarsi che tagliarlo)
  const free = await page.evaluate(() => {
    const bottom = document.querySelector(".page").getBoundingClientRect().bottom;
    const sideLast = [...document.querySelectorAll(".side > *")].pop();
    const mainLast = [...document.querySelectorAll("main > section")].pop();
    const privacy = document.querySelector(".privacy");
    return {
      side: Math.round(bottom - sideLast.getBoundingClientRect().bottom),
      main: Math.round(bottom - mainLast.getBoundingClientRect().bottom - privacy.offsetHeight),
    };
  });
  const worst = -Math.min(free.side, free.main);
  if (worst > 0) {
    ok = false;
    console.error(`✗ ${d.file}: il contenuto supera la pagina di ${worst}px`);
  }

  await page.pdf({ path: join(root, "public", d.file), printBackground: true, preferCSSPageSize: true });
  if (previewDir) {
    mkdirSync(previewDir, { recursive: true });
    await page.screenshot({ path: join(previewDir, d.file.replace(/\.pdf$/, ".png")) });
  }
  console.log(`${worst > 0 ? "!" : "✓"} public/${d.file} (spazio libero: colonna laterale ${free.side}px, principale ${free.main}px)`);
}

await browser.close();
if (!ok) process.exit(1);
