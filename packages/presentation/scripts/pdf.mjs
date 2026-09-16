#!/usr/bin/env node
/**
 * Macht aus dem Vortrag ein PDF.
 *
 * Gedruckt wird die Route /papier — echter Text, keine Screenshots. Das
 * Ergebnis ist damit durchsuchbar und kopierbar, und ein Vorleseprogramm kommt
 * damit zurecht.
 *
 *   node scripts/pdf.mjs [baseUrl] [ziel]
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const BASE = process.argv[2] ?? "http://localhost:5180";
const ZIEL = process.argv[3] ?? "dist/ecr-in-motion-2026.pdf";

await mkdir(dirname(ZIEL), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
const fehler = [];
page.on("pageerror", (e) => fehler.push(String(e.message)));

await page.goto(`${BASE}/papier`, { waitUntil: "networkidle" });
await page.waitForSelector(".papier-seite");
/* Ohne geladene Schriften druckt der Browser den Rückfall — auf Papier bleibt das. */
await page.evaluate(() => document.fonts.ready);
/* Warten, bis jede Seite in ihre Höhe gepasst wurde — sonst druckt der Browser
   den Zwischenstand und schneidet ab. */
await page.waitForFunction(() => document.body.dataset.papierFertig === "ja", null, {
  timeout: 30_000,
});
await page.waitForTimeout(400);

const ueberlauf = await page.evaluate(() =>
  [...document.querySelectorAll(".papier-seite")]
    .map((s, i) => (s.scrollHeight > s.clientHeight + 2 ? i + 1 : 0))
    .filter(Boolean),
);
if (ueberlauf.length) {
  console.error(`Seiten laufen über und würden abgeschnitten: ${ueberlauf.join(", ")}`);
  await browser.close();
  process.exit(1);
}

const seiten = await page.locator(".papier-seite").count();

await page.pdf({
  path: ZIEL,
  printBackground: true,
  preferCSSPageSize: true,
});

await browser.close();

if (fehler.length) {
  console.error("Fehler beim Aufbau der Druckfassung:\n  " + fehler.join("\n  "));
  process.exit(1);
}
console.log(`${seiten} Seiten → ${ZIEL}`);
