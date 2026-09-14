#!/usr/bin/env node
// Die Bühne muss auf jedem Fensterformat mittig sitzen und vollständig
// sichtbar sein. Auf einem Full-HD-Beamer fällt ein Fehler nicht auf, weil dort
// nichts skaliert wird — deshalb hier bewusst krumme Formate.
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3000";
const b = await chromium.launch();
let fehler = 0;

for (const [w, h, name] of [
  [1512, 982, "MacBook 14\" (3024×1964 @2x)"],
  [1920, 1080, "Full HD"],
  [1440, 900, "MacBook Air"],
  [2560, 1440, "WQHD"],
  [1280, 1024, "5:4 Beamer"],
  [3840, 1080, "sehr breit"],
]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on("pageerror", (e) => console.log("  FEHLER:", e.message));
  await p.goto(`${BASE}/audience?clean=1`, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(900);
  const m = await p.evaluate(() => {
    const r = document.querySelector("[data-block]").getBoundingClientRect();
    return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), bo: Math.round(r.bottom) };
  });
  const linksRechts = Math.abs(m.l - (w - m.r));
  const obenUnten = Math.abs(m.t - (h - m.bo));
  const drin = m.l >= -1 && m.r <= w + 1 && m.t >= -1 && m.bo <= h + 1;
  const mittig = linksRechts <= 1 && obenUnten <= 1;
  const ok = drin && mittig;
  if (!ok) fehler++;
  console.log(
    `${ok ? "  ok  " : " FEHLER"} ${name.padEnd(28)} ${w}×${h}  ` +
      `Ränder ${m.l}/${w - m.r} links/rechts, ${m.t}/${h - m.bo} oben/unten`,
  );
  await p.close();
}
await b.close();
console.log(fehler ? `\n${fehler} Format(e) falsch.` : "\nAuf allen Formaten mittig und vollständig.");
process.exitCode = fehler ? 1 : 0;
