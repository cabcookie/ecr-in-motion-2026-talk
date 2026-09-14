#!/usr/bin/env node
// Stellt nach, was am Vortragsabend ständig passiert: Das Handy wird gesperrt,
// die Verbindung reißt ab, der Teilnehmer kommt zurück. Danach muss die Seite
// wieder dem Vortrag folgen — auch wenn sich zwischendurch etwas geändert hat.
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch();
const ctx = await browser.newContext();
const live = await ctx.newPage();
const phoneCtx = await browser.newContext({
  viewport: { width: 393, height: 852 },
  isMobile: true,
  hasTouch: true,
});
const phone = await phoneCtx.newPage();
for (const p of [live, phone]) p.on("pageerror", (e) => console.log("FEHLER:", e.message));

await live.goto(`${BASE}/audience?clean=1`, { waitUntil: "networkidle" });
await phone.goto(`${BASE}/`, { waitUntil: "networkidle" });
await live.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Home" })));
await live.waitForTimeout(2000);

const folie = () => live.getAttribute("[data-slideno]", "data-slideno");
const handyStand = () =>
  phone.evaluate(() => {
    const t = document.body.innerText.replace(/\s+/g, " ");
    // innerText liefert die Überschrift in Versalien, weil CSS sie so setzt
    const m = t.match(/Abschnitt (\d+)/i);
    return m ? m[1] : t.slice(0, 28);
  });
const verbunden = () =>
  phone.evaluate(() => !document.body.innerText.includes("getrennt"));

const klick = async (n) => {
  for (let i = 0; i < n; i++) {
    await live.keyboard.press("ArrowRight");
    await live.waitForTimeout(120);
  }
  await live.waitForTimeout(2200);
};

let fehler = 0;
const pruefe = (b, was) => {
  console.log(`${b ? "  ok  " : "  FEHLER  "} ${was}`);
  if (!b) fehler++;
};

await klick(11);
console.log(`Leinwand auf ${await folie()}, Handy zeigt ${await handyStand()}`);
pruefe((await handyStand()) === (await folie()), "Handy folgt vor dem Sperren");

// --- Sperren nachstellen -------------------------------------------------
// Erst offline (der Sockel stirbt), dann die Seite in den Hintergrund.
await phoneCtx.setOffline(true);
await phone.evaluate(() => {
  Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
  document.dispatchEvent(new Event("visibilitychange"));
});
await phone.waitForTimeout(1500);
console.log("Handy gesperrt und offline");

// Währenddessen klickt der Vortragende weiter
await klick(2);
console.log(`Leinwand inzwischen auf ${await folie()}`);

// --- Entsperren ----------------------------------------------------------
await phoneCtx.setOffline(false);
await phone.evaluate(() => {
  Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
  document.dispatchEvent(new Event("visibilitychange"));
  window.dispatchEvent(new Event("online"));
});
await phone.waitForTimeout(4000);

console.log(`Nach dem Entsperren: Handy zeigt ${await handyStand()}, verbunden: ${await verbunden()}`);
pruefe((await handyStand()) === (await folie()), "Handy hat den verpassten Stand nachgeholt");
pruefe(await verbunden(), "Handy meldet sich wieder als verbunden");

// --- Und folgt es danach weiter? ----------------------------------------
await klick(1);
pruefe((await handyStand()) === (await folie()), "Handy folgt danach weiterhin");

console.log(fehler ? `\n${fehler} Fehler.` : "\nAlles grün.");
await browser.close();
process.exitCode = fehler ? 1 : 0;
