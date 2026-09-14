import { chromium } from "playwright";
const BASE = "http://localhost:3000";
const browser = await chromium.launch();
const live = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
await live.goto(`${BASE}/audience?clean=1`, { waitUntil: "networkidle" });
await live.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Home" })));
await live.waitForTimeout(600);
// bis Abschnitt 11 (Freitext)
for (let i = 0; i < 18; i++) { await live.keyboard.press("ArrowRight"); await live.waitForTimeout(110); }
await live.waitForTimeout(1800);
console.log("Leinwand:", await live.getAttribute("[data-slideno]", "data-slideno"));

const texte = ["Protokolle zusammenfassen", "Angebote gegenlesen", "Recherche zu Wettbewerbern", "Excel-Formeln bauen", "Übersetzungen"];
for (const t of texte) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true });
  const phone = await ctx.newPage();
  await phone.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await phone.waitForTimeout(1600);
  const ta = phone.locator("textarea").first();
  if (await ta.count()) {
    await ta.fill(t);
    await phone.locator("button", { hasText: "Senden" }).first().click();
    await phone.waitForTimeout(500);
  } else console.log("  ! kein Textfeld");
}
await live.waitForTimeout(2500);
const karten = await live.locator("div.rounded-lg.border-hair").allTextContents();
console.log("Auf der Leinwand:", karten.filter(Boolean).join(" | ") || "leer");
await live.screenshot({ path: "shots/text-live.png" });
await browser.close();
