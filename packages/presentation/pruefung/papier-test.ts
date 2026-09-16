/**
 * Findet die Panels, bei denen das PDF lügen würde.
 *
 * Ein PDF wird allein gelesen, später, ohne Saal. Drei Dinge machen ein Panel
 * dort unbrauchbar, und alle drei sind maschinell erkennbar:
 *
 *   – es trägt eine Interaktion, die ohne Publikum nichts tut
 *   – seine Folie lebt vom Augenblick (QR-Code, Live-Auswertung, Chatfenster)
 *   – sein Sprechertext redet mit dem Raum („schau auf Dein Handy")
 *
 * Trifft eines zu und fehlt `papier`, bricht dieser Test ab. Das ist der Punkt:
 * Eine vergessene Folie faellt sonst erst dem Leser auf, und der sagt es
 * niemandem.
 *
 *   pnpm --filter @ecr-talk/presentation papier:test
 */
import { readFileSync } from "node:fs";
import { SECTIONS } from "../src/slides/data";
import { anhangStruktur } from "../aws-blocks/mail/anhang";

/**
 * Folienarten, die ohne den laufenden Vortrag nichts zeigen.
 *
 * `chat` steht bewusst NICHT dabei: Das ist ein gezeichnetes Beispielgespräch
 * und trägt auf Papier genauso wie auf der Leinwand. Live ist nur der Chat als
 * `audience`-Interaktion, und den fängt die erste Regel.
 */
const NUR_LIVE = new Set(["qr", "results"]);

/**
 * Wendungen, die nur im Saal funktionieren.
 *
 * Bewusst großzügig: Ein falscher Treffer kostet eine Zeile `papier`, ein
 * übersehener kostet eine unverständliche Seite im PDF.
 */
const SAALBEZUG =
  /\b(Handy|[Ss]canne|im Raum|Wer hat|meldet sich|Vergleicht|hier auf der Leinwand|Melde)/;

interface Fund {
  readonly nummer: string;
  readonly titel: string;
  readonly gruende: string[];
}

const offen: Fund[] = [];
let geprueft = 0;
let versorgt = 0;

for (const abschnitt of SECTIONS) {
  for (const [i, panel] of abschnitt.panels.entries()) {
    geprueft++;
    const gruende: string[] = [];
    if (panel.audience) gruende.push("trägt eine Interaktion");
    if (panel.mock && NUR_LIVE.has(panel.mock.t)) {
      gruende.push(`Folie „${panel.mock.t}" lebt vom Augenblick`);
    }
    if (panel.say && SAALBEZUG.test(panel.say)) gruende.push("Sprechertext redet mit dem Raum");
    if (gruende.length === 0) continue;
    if (panel.papier) {
      versorgt++;
      continue;
    }
    offen.push({
      nummer: `${abschnitt.n}.${i + 1}`,
      titel: abschnitt.title,
      gruende,
    });
  }
}

/*
  Der Abspann steht an drei Stellen — letzte Folie, letzte PDF-Seite,
  Antwortmail — und kommt aus einer Datei: aws-blocks/mail/anhang.md. Das ist
  gewollt, hat aber zwei Kanten.

  Erstens: Die Mail ueberlebt jede Formatierung, Folie und Blatt nicht. Wer
  beim Bearbeiten das Markdown zerlegt, merkt es in der Mail NICHT und haette
  eine leere Folie.

  Zweitens: Vier Abschnitte passen nebeneinander. Ein fuenfter wuerde die Folie
  sprengen — und das faellt erst im Saal auf.
*/
const abspann = anhangStruktur(
  readFileSync(new URL("../aws-blocks/mail/anhang.md", import.meta.url), "utf8"),
);
const eintraege = abspann.abschnitte.reduce((n, a) => n + a.eintraege.length, 0);
console.log(`Abspann: ${abspann.abschnitte.length} Abschnitte, ${eintraege} Adressen.`);
if (abspann.abschnitte.length < 2 || eintraege < 4) {
  console.log(
    "\nDer Abspann in aws-blocks/mail/anhang.md ist so nicht lesbar.\n" +
      "Erwartet werden Abschnitte als „## Überschrift“ und darunter Einträge\n" +
      "als „- [Titel](adresse) — Beschreibung“.",
  );
  process.exit(1);
}
if (abspann.abschnitte.length > 4) {
  console.log(
    `\n${abspann.abschnitte.length} Abschnitte passen nicht auf die letzte Folie.\n` +
      "Sie steht in zwei Spalten; mehr als vier werden im Saal unleserlich.",
  );
  process.exit(1);
}

console.log(`${geprueft} Panels geprüft.`);
console.log(`${versorgt} heikle Panels haben eine Angabe für das PDF.`);

if (offen.length === 0) {
  console.log("\nAlles grün — jede Folie, die ohne den Saal nicht trägt, ist versorgt.");
  process.exit(0);
}

console.log(`\n${offen.length} Panels würden im PDF nicht tragen und haben keine Angabe:\n`);
for (const f of offen) {
  console.log(`  ${f.nummer.padEnd(6)} ${f.titel.slice(0, 44)}`);
  for (const g of f.gruende) console.log(`         · ${g}`);
}
console.log(
  "\nJedes davon braucht `papier` am Panel: `weg` zum Weglassen, `statt` für eine",
);
console.log("andere Folie, `text` für einen Text, der ohne den Vortragenden trägt.");
process.exit(1);
