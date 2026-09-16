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
import { mkdir, readFile } from "node:fs/promises";
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
/*
  Kurz warten, bis das Layout steht.

  Der Maßstab ist fest gerechnet, es gibt also nichts einzupassen — aber die
  Folien bauen sich zum Teil in Schritten auf, und wer zu früh druckt, erwischt
  den halben Aufbau.
*/
await page.waitForTimeout(1500);

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

const abschnitte = await page.locator(".papier-seite").count();

await page.pdf({
  path: ZIEL,
  printBackground: true,
  /*
    Das Seitenmaß hier und nicht über @page.

    Mit `preferCSSPageSize` kamen aus zweiundsechzig Abschnitten acht Seiten:
    Die Regel aus dem eingebetteten <style> wurde beim Drucken nicht
    berücksichtigt, und Chromium wählte eine eigene, riesige Seite. Angegeben
    ist es eindeutig.
  */
  width: "297mm",
  height: "210mm",
  margin: { top: "0", right: "0", bottom: "0", left: "0" },
});

await browser.close();

/*
  Die Seiten im FERTIGEN PDF zählen, nicht die Abschnitte im DOM.

  Das ist nicht dasselbe, und die Verwechslung hat einmal teuer gemeldet: Das
  Skript sagte „62 Seiten", während im PDF zwei standen — der Rest war
  abgeschnitten, weil die Seite nicht wachsen durfte. Eine Zahl, die man nicht
  am Ergebnis misst, beruhigt nur.
*/
const roh = (await readFile(ZIEL)).toString("latin1");
/*
  Der GRÖSSTE /Count-Eintrag, nicht der erste.

  Der Seitenbaum eines PDF hat Zwischenknoten, und jeder trägt seinen eigenen
  Count. Der erste Treffer war hier acht — ein Teilbaum —, während die Wurzel
  zweiundsechzig sagte. Die Prüfung hat damit einen fehlerfreien Bau
  abgebrochen; eine falsche Kontrolle ist schlimmer als keine, weil man ihr
  glaubt.
*/
const zaehler = [...roh.matchAll(/\/Count\s+(\d+)/g)].map((m) => Number(m[1]));
const seiten = zaehler.length ? Math.max(...zaehler) : 0;

if (seiten !== abschnitte) {
  console.error(
    `Das PDF hat ${seiten} Seiten, die Druckfassung aber ${abschnitte} Abschnitte. ` +
      "Da geht etwas verloren.",
  );
  process.exit(1);
}

if (fehler.length) {
  console.error("Fehler beim Aufbau der Druckfassung:\n  " + fehler.join("\n  "));
  process.exit(1);
}
console.log(`${seiten} Seiten → ${ZIEL}`);
