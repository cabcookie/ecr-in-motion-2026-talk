/**
 * Alle Szenarien einmal durch den Agenten.
 *
 * Zweck ist nicht die einzelne Antwort, sondern ihre VERTEILUNG: Wenn alle
 * vierzehn dasselbe zurückbekommen, ist der Abend langweilig — egal wie gut
 * die einzelne Antwort ist. Das lässt sich nur messen, indem man sie fährt.
 *
 *   AWS_PROFILE=ecrtag pnpm --filter @ecr-talk/presentation szenarien
 */
import { mkdir, writeFile } from "node:fs/promises";
import { laufePostfach } from "./postfach-lauf";
import { BRIEFINGS } from "../src/slides/briefing";

const ORDNER = "messungen/szenarien";
/* Drei gleichzeitig. Mehr, und Bedrock drosselt — dann misst man die Drossel. */
const PARALLEL = 3;

const NAMEN = [
  "Jan Kerner", "Miriam Stauß", "Tobias Rehm", "Anke Lorenz", "Pavel Novak",
  "Sarah Bremer", "Dirk Waldmann", "Ines Kolb", "Malte Ohlsen", "Ruth Siebert",
  "Frank Dettmer", "Nora Alsleben", "Bernd Quast", "Céline Marchand",
];

await mkdir(ORDNER, { recursive: true });

interface Ergebnis {
  id: string;
  typ: string;
  gruppe?: string;
  schritte: string[];
  text: string;
  fehler?: string;
}

async function einLauf(i: number): Promise<Ergebnis> {
  const b = BRIEFINGS[i];
  const mail = {
    absender: `kontakt@${b.marke.toLowerCase().replace(/[^a-z]/g, "")}.de`,
    absenderName: NAMEN[i],
    betreff: b.betreff,
    text: b.text.replace("[Dein Name]", NAMEN[i]),
  };
  try {
    const l = await laufePostfach(mail);
    if (!l.rumpf || !l.akte) throw new Error("Der Agent hat nicht gesendet.");
    return {
      id: b.id, typ: b.typ, gruppe: b.produkt?.gruppe,
      schritte: l.akte.schritte.map((s) => s.system), text: l.rumpf,
    };
  } catch (e) {
    return { id: b.id, typ: b.typ, schritte: [], text: "", fehler: String(e) };
  }
}

const alle: Ergebnis[] = [];
for (let start = 0; start < BRIEFINGS.length; start += PARALLEL) {
  const gruppe = await Promise.all(
    BRIEFINGS.slice(start, start + PARALLEL).map((_, k) => einLauf(start + k)),
  );
  for (const e of gruppe) {
    await writeFile(
      `${ORDNER}/${e.id}.txt`,
      `TYP: ${e.typ}${e.gruppe ? ` · Gruppe: ${e.gruppe}` : ""}\nWERKZEUGE: ${e.schritte.join(" → ")}\n\n${e.fehler ?? e.text}`,
      "utf8",
    );
    alle.push(e);
    console.log(
      `${e.id.padEnd(12)} ${e.typ.padEnd(20)} ${e.fehler ? "FEHLER" : `${e.schritte.length} Werkzeuge` +
        (e.schritte.includes("kategorie_ziele") ? " ✓Ziele" : " ✗OHNE ZIELE")}`,
    );
  }
}

await writeFile(`${ORDNER}/ergebnis.json`, JSON.stringify(alle, null, 2), "utf8");
console.log(`\n${alle.length} Läufe, ${alle.filter((e) => e.fehler).length} gescheitert`);
