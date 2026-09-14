#!/usr/bin/env node
// Prüft die Zuschauersicht: folgt sie der Live-View, hält sie Antworten fest,
// und findet ein Teilnehmer nach dem Neuladen seinen Stand wieder?
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch();

const liveCtx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const phoneCtx = await browser.newContext({
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});

const live = await liveCtx.newPage();
const phone = await phoneCtx.newPage();
for (const p of [live, phone]) p.on("pageerror", (e) => console.log("FEHLER:", e.message));

await live.goto(`${BASE}/audience?clean=1`, { waitUntil: "networkidle" });
await phone.goto(`${BASE}/`, { waitUntil: "networkidle" });
await phone.waitForTimeout(2500);

// Vor Abschnitt 6 zeigt das Handy nur den Wartehinweis und hat keine
// Überschrift — dann nehmen wir den Seitentext.
const head = async (p) => {
  const h1 = p.locator("h1");
  if ((await h1.count()) > 0) return (await h1.first().textContent()) ?? "";
  return ((await p.textContent("body")) ?? "").replace(/\s+/g, " ").trim().slice(0, 50);
};
const slideNo = async () => live.getAttribute("[data-slideno]", "data-slideno");

console.log(`Start        Folie ${await slideNo()} · Handy: „${(await head(phone)).slice(0, 40)}“`);

// Zu Folie 8, Schritt 2 — dort liegt die Umfrage
await live.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Home" })));
await live.waitForTimeout(800);
for (let i = 0; i < 11; i++) {
  await live.keyboard.press("ArrowRight");
  await live.waitForTimeout(90);
}
await live.waitForTimeout(2000);
console.log(`Nach 11 Klick Folie ${await slideNo()} · Handy: „${(await head(phone)).slice(0, 40)}“`);

const frage = await phone.locator("p").first().textContent().catch(() => null);
console.log(`Handy zeigt  „${(frage ?? "nichts").slice(0, 55)}“`);

// Antwort geben
const btn = phone.locator('button[aria-pressed]').first();
if (await btn.count()) {
  await btn.click();
  await phone.waitForTimeout(1500);
  console.log(`Antwort      „${(await btn.textContent())?.trim()}“ · gespeichert: ${await btn.getAttribute("aria-pressed")}`);
}

await phone.screenshot({ path: "shots/audience-poll.png" });

// Handy gesperrt und zurück: neu laden
await phone.reload({ waitUntil: "networkidle" });
await phone.waitForTimeout(2500);
const wieder = phone.locator('button[aria-pressed="true"]').first();
const hatAntwort = (await wieder.count()) > 0;
console.log(`Nach Neuladen Folie-Überschrift: „${(await head(phone)).slice(0, 40)}“`);
console.log(`             Antwort wieder da: ${hatAntwort ? "ja" : "NEIN"}`);

// Weiter zur Mail-Interaktion
await live.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" })));
await live.waitForTimeout(2000);
const mailLink = await phone.getAttribute('a[href^="mailto:"]', "href").catch(() => null);
console.log(`Mail-Schritt  ${mailLink ? mailLink.slice(0, 60) + "…" : "kein Link"}`);
await phone.screenshot({ path: "shots/audience-mail.png" });

await browser.close();
