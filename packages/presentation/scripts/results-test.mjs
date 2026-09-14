#!/usr/bin/env node
// Vier Handys antworten, die Leinwand muss sich füllen.
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch();

const live = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
live.on("pageerror", (e) => console.log("LIVE-FEHLER:", e.message));
await live.goto(`${BASE}/audience?clean=1`, { waitUntil: "networkidle" });
await live.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Home" })));
await live.waitForTimeout(600);
for (let i = 0; i < 11; i++) { await live.keyboard.press("ArrowRight"); await live.waitForTimeout(110); }
await live.waitForTimeout(2000);
console.log("Leinwand steht auf", await live.getAttribute("[data-slideno]", "data-slideno") + "." +
  (Number(await live.getAttribute("[data-slideno]", "data-panel")) + 1));

// Vier Teilnehmer mit verschiedenen Kombinationen
const kombis = [["ja","ja"], ["ja","nein"], ["etwas","ja"], ["ja","ja"]];
for (const [beunruhigt, freude] of kombis) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true });
  const phone = await ctx.newPage();
  await phone.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await phone.waitForTimeout(1800);
  const cards = phone.locator("div").filter({ hasText: /Beunruhigt|Freuen/ });
  // Erste Frage: erste Knopfgruppe, zweite Frage: zweite Knopfgruppe
  const alle = phone.locator('button[aria-pressed]');
  const n = await alle.count();
  const map = { ja: 0, etwas: 1, nein: 2 };
  if (n >= 6) {
    await alle.nth(map[beunruhigt]).click();
    await phone.waitForTimeout(350);
    await alle.nth(3 + map[freude]).click();
    await phone.waitForTimeout(600);
  } else {
    console.log("  ! nur", n, "Knöpfe gefunden");
  }
  await cards.first().count();
}

await live.waitForTimeout(2500);
const bilanz = await live.textContent("p.font-mono.text-\\[23px\\]").catch(() => null);
console.log("Bilanz auf der Leinwand:", (bilanz ?? "—").trim());
const zahlen = await live.locator('span.tabular-nums').allTextContents();
console.log("Zellen:", zahlen.filter(z => /^\d+$|^–$/.test(z.trim())).join(" "));
await live.screenshot({ path: "shots/matrix-live.png" });
await browser.close();
