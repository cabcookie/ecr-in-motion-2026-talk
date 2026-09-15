/**
 * Alle Szenarien einmal durch den Agenten.
 *
 * Zweck ist nicht die einzelne Antwort, sondern ihre VERTEILUNG: Wenn alle
 * vierzehn dasselbe zurückbekommen, ist der Abend langweilig — egal wie gut
 * die einzelne Antwort ist. Das lässt sich nur messen, indem man sie fährt.
 *
 *   AWS_PROFILE=ecrtag pnpm --filter @ecr-talk/presentation szenarien
 */
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { mkdir, writeFile } from "node:fs/promises";
import { beantworteMit, AUSSTATTUNGEN } from "../aws-blocks/mail/agent";
import { BRIEFINGS } from "../src/slides/briefing";

const ORDNER = "messungen/szenarien";
/* Drei gleichzeitig. Mehr, und Bedrock drosselt — dann misst man die Drossel. */
const PARALLEL = 3;

const NAMEN = [
  "Jan Kerner", "Miriam Stauß", "Tobias Rehm", "Anke Lorenz", "Pavel Novak",
  "Sarah Bremer", "Dirk Waldmann", "Ines Kolb", "Malte Ohlsen", "Ruth Siebert",
  "Frank Dettmer", "Nora Alsleben", "Bernd Quast", "Céline Marchand",
];

const client = new BedrockRuntimeClient({});
await mkdir(ORDNER, { recursive: true });

interface Ergebnis {
  id: string;
  typ: string;
  gruppe?: string;
  schritte: string[];
  text: string;
  ein: number;
  aus: number;
  fehler?: string;
}

async function einLauf(i: number): Promise<Ergebnis> {
  const b = BRIEFINGS[i];
  const mail =
    `Von: ${NAMEN[i]} <kontakt@${b.marke.toLowerCase().replace(/[^a-z]/g, "")}.de>\n` +
    `Betreff: ${b.betreff}\n\n` +
    b.text.replace("[Dein Name]", NAMEN[i]);
  try {
    const l = await beantworteMit(AUSSTATTUNGEN.gehaertet, mail, client);
    return {
      id: b.id, typ: b.typ, gruppe: b.produkt?.gruppe,
      schritte: [...l.schritte], text: l.text,
      ein: l.verbrauch.ein, aus: l.verbrauch.aus,
    };
  } catch (e) {
    return { id: b.id, typ: b.typ, schritte: [], text: "", ein: 0, aus: 0, fehler: String(e) };
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
const ein = alle.reduce((s, e) => s + e.ein, 0);
const aus = alle.reduce((s, e) => s + e.aus, 0);
console.log(`\n${alle.length} Läufe · ${(((ein / 1e6) * 15 + (aus / 1e6) * 75) * 100).toFixed(0)} ct`);
