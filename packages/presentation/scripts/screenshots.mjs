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

await page.goto(`${BASE}/audience?clean=1`, { waitUntil: "networkidle" });
// Schriften müssen geladen sein, sonst wird der Fallback abgelichtet
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);

await page.waitForSelector("[data-slideno]");
// Jedes Panel ist ein eigener Klick — die Gesamtzahl steht im Datenmodell
const total = await page.evaluate(() => Number(document.body.dataset.panels ?? 0)) ||
  Number(process.env.PANELS ?? 40);

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const tight = [];

for (let i = 1; i <= total; i++) {
  const n = await page.getAttribute("[data-slideno]", "data-slideno");
  const pn = await page.getAttribute("[data-slideno]", "data-panel");
  const fit = await page.getAttribute("[data-fit]", "data-fit").catch(() => null);
  await page.screenshot({ path: `${OUT}/${String(i).padStart(2, "0")}-s${String(n).padStart(2,"0")}p${Number(pn)+1}.png` });
  if (fit && Number(fit) < 0.95) tight.push(`${String(n).padStart(2, "0")}: ${fit}`);
  process.stdout.write(`${String(n).padStart(2, "0")} `);
  if (i < total) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(950);
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
