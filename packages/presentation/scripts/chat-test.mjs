#!/usr/bin/env node
// Prüft den Chat aus Abschnitt 16 auf dem Handy: startet er mit der Mail von
// Hallbach, antwortet der Agent, kommt eine angetippte Antwort durch — und
// findet ein gesperrtes Handy sein Gespräch nach dem Neuladen wieder?
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

// Zu Abschnitt 16, Panel 2 — dort liegt der Chat
await live.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Home" })));
await live.waitForTimeout(800);
for (let i = 0; i < 27; i++) {
  await live.keyboard.press("ArrowRight");
  await live.waitForTimeout(80);
}
await live.waitForTimeout(2500);

const slide = await live.getAttribute("[data-slideno]", "data-slideno");
console.log(`Leinwand      Abschnitt ${slide} · Handy: „${await phone.textContent("h1")}“`);

const startBtn = phone.getByRole("button", { name: "Chat starten" });
console.log(`Startknopf    ${(await startBtn.count()) === 1 ? "da" : "FEHLT"}`);

await startBtn.click();
await phone.waitForTimeout(6000);

const mail = await phone.textContent("body");
console.log(`Mail im Chat  ${mail.includes("Crispy Bites") ? "ja" : "NEIN"}`);
console.log(`Getippt?      ${mail.includes("Posteingang") ? "nein — als Posteingang gezeigt" : "UNKLAR"}`);

const bubbles = async () =>
  phone.evaluate(() =>
    [...document.querySelectorAll("div[class*='rounded-bl-sm'], div[class*='rounded-br-sm']")].map(
      (e) => `${e.className.includes("rounded-br-sm") ? "ich" : "agent"}: ${e.textContent.slice(0, 70)}`,
    ),
  );
console.log("Nach Start   ", await bubbles());

// Vorschlag antippen — niemand soll auf dem Handy tippen müssen
const sug = phone.getByRole("button", { name: /Kategorie wächst/ });
if ((await sug.count()) > 0) {
  await sug.first().click();
  await phone.waitForTimeout(6000);
  console.log("Nach Vorschlag", await bubbles());
} else {
  console.log("Vorschlag     FEHLT");
}

// Handy gesperrt und zurück: Gespräch muss wieder dastehen
await phone.reload({ waitUntil: "networkidle" });
await phone.waitForTimeout(5000);
const after = await bubbles();
console.log("Nach Neuladen", after);
console.log(
  `Wiederkehr    ${after.length > 0 ? "Gespräch steht wieder" : "VERLOREN"} · Startknopf ${
    (await phone.getByRole("button", { name: "Chat starten" }).count()) === 0 ? "weg (richtig)" : "WIEDER DA"
  }`,
);

await phone.screenshot({ path: "/tmp/chat-phone.png", fullPage: true });
await browser.close();
