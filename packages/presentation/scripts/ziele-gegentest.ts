/**
 * Der Gegentest zu den Kategoriezielen — die Messung hinter der Folie
 * „Sechs Werkzeuge / Sieben Werkzeuge".
 *
 * Dieselbe Mail (Morgenrot, eine Preiseinstiegstafel), dasselbe Modell,
 * derselbe Systemprompt. Einmal mit allen Fachwerkzeugen, einmal ohne
 * `kategorie_ziele`. Die Marge stimmt, der Termin auch; absagen kann der
 * Agent nur, wenn er weiß, dass der Preiseinstieg der Eigenmarke gehört.
 *
 * Ausgewertet wird durch Lesen, nicht hier: Ein Klassifikator per Regex hielt
 * zwei eindeutige Absagen für unklar bzw. für ein Ja.
 *
 *   AWS_PROFILE=ecrtag pnpm --filter @ecr-talk/presentation ziele:gegentest
 *
 * Schreibt nach messungen/ziele-gegentest/ und überschreibt, was dort liegt.
 * LAEUFE (Standard 3) und ORDNER lassen sich über die Umgebung setzen.
 */
import { mkdir, writeFile } from "node:fs/promises";
import type { Werkzeugauswahl } from "../aws-blocks/agent";
import { BRIEFINGS } from "../src/slides/briefing";
import { laufePostfach } from "./postfach-lauf";

const LAEUFE = Number(process.env.LAEUFE ?? 3);
const ORDNER = process.env.ORDNER ?? "messungen/ziele-gegentest";

const AUSSTATTUNGEN: Readonly<Record<string, Werkzeugauswahl>> = {
  "mit-zielen": {},
  "ohne-ziele": { ohne: ["kategorie_ziele"] },
};

const briefing = BRIEFINGS.find((b) => b.id === "morgenrot");
if (!briefing) throw new Error("Das Briefing 'morgenrot' fehlt in src/slides/briefing.ts.");

const MAIL = {
  absender: "kontakt@morgenrot.example",
  absenderName: "Jan Kerner",
  betreff: briefing.betreff,
  text: briefing.text.replace("[Dein Name]", "Jan Kerner"),
};

await mkdir(ORDNER, { recursive: true });

let gescheitert = 0;
for (const [name, auswahl] of Object.entries(AUSSTATTUNGEN)) {
  for (let i = 1; i <= LAEUFE; i++) {
    const lauf = await laufePostfach(MAIL, auswahl);
    const schritte = lauf.akte?.schritte.map((s) => s.system) ?? [];
    const inhalt = lauf.rumpf
      ? `WERKZEUGE: ${schritte.join(" → ")}\n\n${lauf.rumpf}`
      : "FEHLER: Der Agent hat nicht gesendet.";
    if (!lauf.rumpf) gescheitert += 1;
    await writeFile(`${ORDNER}/${name}-${i}.txt`, inhalt, "utf8");
    console.log(
      `${name.padEnd(11)} ${i}  ${schritte.includes("kategorie_ziele") ? "mit Zielen " : "ohne Ziele "}` +
        `${(lauf.dauerMs / 1000).toFixed(0)} s`,
    );
  }
}

console.log(`\nGeschrieben nach ${ORDNER}. Jetzt lesen: Wird entschieden, und wie?`);
if (gescheitert > 0) process.exitCode = 1;
