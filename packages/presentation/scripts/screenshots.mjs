#!/usr/bin/env node
// Nimmt jede Folie der Live-View als PNG auf.
// Aufruf: node scripts/screenshots.mjs [baseUrl] [outDir]

import { chromium } from "playwright";
import { mkdir, rm } from "node:fs/promises";

const BASE = process.argv[2] ?? "http://localhost:5180";
const OUT = process.argv[3] ?? "shots";

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
});

await page.goto(`${BASE}/?clean=1`, { waitUntil: "networkidle" });
// Schriften müssen geladen sein, sonst wird der Fallback abgelichtet
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);

const total = await page.evaluate(() =>
  Number(document.querySelector(".slideno")?.textContent ?? 0) ? 35 : 35,
);

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const tight = [];

for (let i = 1; i <= total; i++) {
  const n = await page.textContent(".slideno");
  const fit = await page.getAttribute(".fit-outer", "data-fit").catch(() => null);
  await page.screenshot({ path: `${OUT}/${String(i).padStart(2, "0")}.png` });
  if (fit && Number(fit) < 0.95) tight.push(`${n}: ${fit}`);
  process.stdout.write(`${n} `);
  if (i < total) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(320);
  }
}

console.log(`\n${total} Folien in ${OUT}/`);
if (tight.length) {
  console.log(`\nGeschrumpft (Inhalt zu groß für die Folie):`);
  for (const t of tight) console.log("  " + t);
} else {
  console.log("\nAlle Folien passen ohne Skalierung.");
}
await browser.close();
