#!/usr/bin/env node
// Screenshot der Operator-View + Test der Kopplung über BroadcastChannel.
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:5180";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });

const live = await ctx.newPage();
await live.goto(`${BASE}/audience?clean=1`, { waitUntil: "networkidle" });

const op = await ctx.newPage();
await op.goto(`${BASE}/operator`, { waitUntil: "networkidle" });
await op.evaluate(() => document.fonts.ready);
await op.waitForTimeout(800);

const read = async (p) => p.getAttribute("[data-slideno]", "data-slideno");
console.log(`Start — live: ${await read(live)}, operator: ${await read(op)}`);

// Operator klickt fünfmal weiter
for (let i = 0; i < 5; i++) {
  await op.click("text=Weiter →");
  await op.waitForTimeout(120);
}
await live.waitForTimeout(400);
console.log(`Operator +5 — live: ${await read(live)}, operator: ${await read(op)}`);

// Live springt per Tastatur zurück
await live.keyboard.press("ArrowLeft");
await live.keyboard.press("ArrowLeft");
await op.waitForTimeout(400);
console.log(`Live -2   — live: ${await read(live)}, operator: ${await read(op)}`);

// Auf eine Folie mit vielen Notizen springen
await op.click('button[title^="Und das ist die Antwort"]');
await op.waitForTimeout(500);
await live.waitForTimeout(300);
console.log(`Sprung 25 — live: ${await read(live)}, operator: ${await read(op)}`);

await op.screenshot({ path: "shots/operator.png", fullPage: true });
await browser.close();
console.log("shots/operator.png");
