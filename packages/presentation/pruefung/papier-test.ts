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
import { anhangEinstiege } from "../aws-blocks/mail/anhang";

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
  Die letzte Seite des PDFs liest ihre Liste aus aws-blocks/mail/anhang.md —
  derselben Datei, aus der die Antwortmail ihren festen Teil nimmt. Das ist
  gewollt, hat aber eine Kante: Die Mail kippt den Text aus und ueberlebt jede
  Formatierung, das Blatt braucht Gruppen und erkennt sie an der Einrueckung.
  Wer beim Bearbeiten das Muster verlaesst, merkt es in der Mail NICHT — und im
  PDF stuende dann eine leere Seite.

  Deshalb hier: Wir zaehlen, was herauskommt. Vier Gruppen sind es heute; die
  Schwelle steht bei zwei, damit ein Umbau der Liste nicht sofort anschlaegt,
  ein zerbrochenes Muster aber schon.
*/
const einstiege = anhangEinstiege(
  readFileSync(new URL("../aws-blocks/mail/anhang.md", import.meta.url), "utf8"),
);
const punkte = einstiege.reduce((n, b) => n + b.punkte.length, 0);
console.log(`Anhang: ${einstiege.length} Gruppen, ${punkte} Adressen.`);
if (einstiege.length < 2 || punkte < 4) {
  console.log(
    "\nDie Einstiegsliste in aws-blocks/mail/anhang.md ist so nicht lesbar.\n" +
      "Gelesen wird ab der Marke (ein Kommentar, der nur „liste“ enthält).\n" +
      "Danach gilt je Absatz: endet er auf einer Adresse, ist er ein Eintrag —\n" +
      "endet er nicht auf einer, ist er die Überschrift der Einträge darunter.",
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
