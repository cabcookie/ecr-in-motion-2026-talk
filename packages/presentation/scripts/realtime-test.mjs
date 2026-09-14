#!/usr/bin/env node
// Beweist, dass die Fernsteuerung über AWS Blocks Realtime läuft:
// zwei getrennte Browser-Kontexte teilen sich keinen BroadcastChannel,
// die Kopplung kann also nur über den Server zustande kommen.
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch();

// Getrennte Kontexte = getrennte Ursprünge für BroadcastChannel
const liveCtx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const opCtx = await browser.newContext({ viewport: { width: 420, height: 900 } });

const live = await liveCtx.newPage();
const op = await opCtx.newPage();
for (const p of [live, op]) p.on("pageerror", (e) => console.log("FEHLER:", e.message));

await live.goto(`${BASE}/audience?clean=1`, { waitUntil: "networkidle" });
await op.goto(`${BASE}/operator`, { waitUntil: "networkidle" });
await op.waitForSelector("[data-slideno]");
await op.waitForTimeout(2500);

const read = async (p) => p.getAttribute("[data-slideno]", "data-slideno");
const show = async (label) =>
  console.log(`${label.padEnd(22)} live: ${await read(live)}  operator: ${await read(op)}`);

await show("Start");

for (let i = 0; i < 4; i++) {
  await op.click("text=Weiter →");
  await op.waitForTimeout(250);
}
await live.waitForTimeout(1200);
await show("Operator +4");

await live.keyboard.press("ArrowRight");
await live.waitForTimeout(1200);
await show("Live +1 (Tastatur)");

// Drittes Gerät kommt mitten im Vortrag dazu
const lateCtx = await browser.newContext();
const late = await lateCtx.newPage();
await late.goto(`${BASE}/audience?clean=1`, { waitUntil: "networkidle" });
await late.waitForSelector("[data-slideno]");
await late.waitForTimeout(2500);
console.log(`Spät dazugekommen     zeigt: ${await read(late)} (erwartet: dieselbe Folie)`);

await op.screenshot({ path: "shots/operator-phone.png", fullPage: true });
await browser.close();
