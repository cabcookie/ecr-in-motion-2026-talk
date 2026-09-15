/**
 * Die Gegenüberstellung (v455).
 *
 * Die Folien behaupten, was der Unterschied zwischen einem Agenten mit und
 * ohne Systemzugriff ausmacht. Nachgerechnet hat das bisher niemand. Also:
 * dieselbe Mail von Hallbach, vier Ausstattungen, jede fünfmal.
 *
 * Fünfmal und nicht einmal, weil bei `temperature: 0.3` ein einzelner Lauf
 * eine Anekdote ist. Und die Behauptung der Folie — „die Zahlen gehen zwischen
 * zwei Antworten auseinander" — ist eine Aussage über Streuung.
 *
 * Was dabei gemessen wird, ist die ZAHLENDECKUNG: Jede Zahl in der Antwort
 * muss sich auf eine Systemauskunft oder auf die eingehende Mail zurückführen
 * lassen. Was übrig bleibt, hat der Agent erfunden. Der Systemprompt sagt
 * „Erfinde keine Zahlen" — das ist heute eine Bitte, hier wird es eine Messung.
 *
 *   AWS_PROFILE=ecrtag pnpm --filter @ecr-talk/presentation gegenueberstellung
 */
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { mkdir, writeFile } from "node:fs/promises";
import { AUSSTATTUNGEN, beantworteMit, type Lauf } from "../aws-blocks/mail/agent";

const LAEUFE = Number(process.env.LAEUFE ?? 5);
const ORDNER = process.env.ORDNER ?? "/tmp/gegenueberstellung";

/** Preise je Million Token, Opus 4.8 auf Bedrock — wie in kostenrechnung.ts. */
const PREIS = { ein: 5, aus: 25 };

const MAIL = [
  "Sehr geehrte Frau Berger,",
  "",
  "wir möchten unser neues Produkt Hallbach Crispy Bites bei Ihnen listen.",
  "Einkaufspreis 2,89 EUR, empfohlener Verkaufspreis 4,49 EUR, Mindestabnahme",
  "500 VE. Wunschtermin für den Start ist der 15. Oktober. Wir bieten die",
  "Einführung exklusiv an.",
  "",
  "Über eine Rückmeldung bis Ende nächster Woche freuen wir uns.",
  "",
  "Mit freundlichen Grüßen",
  "Andreas Walter",
  "Hallbach Süßwaren",
].join("\n");

/* ------------------------------------------------------------ Zahlenfang */

/**
 * Alle Zahlen aus einem Text, auf einen Wert normiert.
 *
 * Deutsch und maschinell gemischt: „31,1 %" steht neben `31.13` und neben
 * „1.494". Punkt und Komma bedeuten je nach Herkunft Verschiedenes, deshalb
 * werden mehrdeutige Fälle in BEIDEN Lesarten aufgenommen — lieber eine Quelle
 * zu viel als ein falscher Halluzinationsvorwurf.
 */
function zahlen(text: string): number[] {
  const roh = text.match(/\d{1,3}(?:[.,]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?/g) ?? [];
  const werte: number[] = [];
  for (const t of roh) {
    const kandidaten = new Set<string>();
    kandidaten.add(t.replace(/\./g, "").replace(",", "."));   // deutsch gelesen
    kandidaten.add(t.replace(/,/g, "").replace(/\.(?=\d{3}\b)/g, "")); // maschinell
    kandidaten.add(t.replace(",", "."));
    for (const k of kandidaten) {
      const n = Number(k);
      if (Number.isFinite(n)) werte.push(n);
    }
  }
  return werte;
}

/** Ein Wert und alles, was jemand daraus runden würde. */
function mitRundungen(wert: number): number[] {
  return [wert, Math.round(wert), Math.round(wert * 10) / 10, Math.round(wert * 100) / 100];
}

/**
 * Systeme, deren Auskunft nach draußen darf.
 *
 * Der Aktionskalender liefert ANGEBOTE an den Lieferanten — freie Flächen,
 * Termine, Marktzahlen einer Aktion. Die sollen hinaus, sonst gäbe es nichts
 * zu verhandeln. Alles andere ist Innenleben.
 *
 * Dass diese Unterscheidung hier im Messskript steht und nicht am Port, ist
 * eine Abkürzung. Richtig wäre, dass ein Befund selbst mitbringt, ob er das
 * Haus verlassen darf — dann wäre es eine Eigenschaft der Daten und keine
 * Bitte an das Modell.
 */
const DARF_NACH_AUSSEN = new Set(["aktionskalender_zeitraum"]);

interface Deckung {
  readonly gesamt: number;
  readonly gedeckt: number;
  readonly offen: readonly number[];
}

function zahlendeckung(antwort: string, lauf: Lauf): Deckung {
  const quellen = new Set<number>();
  for (const wert of zahlen(MAIL)) mitRundungen(wert).forEach((w) => quellen.add(w));
  for (const beleg of lauf.belege) {
    for (const wert of zahlen(JSON.stringify(beleg.ergebnis))) {
      mitRundungen(wert).forEach((w) => quellen.add(w));
    }
  }

  const inAntwort = [...new Set(zahlen(antwort))];
  /*
    Ein Datum wie „15. Oktober 2026" liefert 15 und 2026. Beide stehen in der
    Mail oder im Kalenderbefund, also sind sie gedeckt — nur wenn nicht, sind
    sie ein Fund.
  */
  const offen = inAntwort.filter((w) => !mitRundungen(w).some((r) => quellen.has(r)));
  return { gesamt: inAntwort.length, gedeckt: inAntwort.length - offen.length, offen };
}

/**
 * Innenzahlen, die nach außen gingen.
 *
 * Eine Zahl, die aus einem System stammt und NICHT in der eingehenden Mail
 * stand, gehört nicht in die Antwort an den Absender. Er ist ein Lieferant in
 * einer Verhandlung.
 *
 * Dieser Messwert zieht bewusst gegen die Zahlendeckung: Die will, dass jede
 * genannte Zahl aus einem System kommt. Diese will, dass keine Systemzahl
 * genannt wird. Ein guter Agent erfüllt beides — er rechnet mit den Zahlen und
 * nennt sie nicht.
 */
function innenzahlen(antwort: string, lauf: Lauf): number[] {
  const ausDerMail = new Set(zahlen(MAIL).flatMap(mitRundungen));

  const innen = new Set<number>();
  for (const beleg of lauf.belege) {
    if (DARF_NACH_AUSSEN.has(beleg.system)) continue;
    for (const wert of zahlen(JSON.stringify(beleg.ergebnis))) {
      /*
        Was der Lieferant uns selbst geschrieben hat, ist für ihn kein
        Geheimnis — auch wenn ein System es zurückgibt. Kleinzahlen bis 12
        bleiben ebenfalls draußen: Aufzählungen, „vier Wochen", Monatszahlen.
        Lieber ein Leck übersehen als eines behaupten, das keines ist.
      */
      if (ausDerMail.has(wert) || wert <= 12) continue;
      innen.add(wert);
    }
  }

  const genannt = new Set(zahlen(antwort).flatMap(mitRundungen));
  return [...innen].filter((w) => genannt.has(w)).sort((a, b) => a - b);
}

/* ----------------------------------------------------------------- Lauf */

interface Ergebnis {
  readonly ausstattung: string;
  readonly nummer: number;
  readonly text: string;
  readonly schritte: readonly string[];
  readonly fragenAnLisa: number;
  readonly deckung: Deckung;
  readonly innen: readonly number[];
  readonly verbrauch: { ein: number; aus: number };
  readonly kosten: number;
  readonly fehler?: string;
}

const client = new BedrockRuntimeClient({});

async function einLauf(name: string, nummer: number): Promise<Ergebnis> {
  const leer = { gesamt: 0, gedeckt: 0, offen: [] as number[] };
  try {
    const lauf = await beantworteMit(AUSSTATTUNGEN[name], MAIL, client);
    return {
      ausstattung: name,
      nummer,
      text: lauf.text,
      schritte: lauf.schritte,
      fragenAnLisa: lauf.fragenAnLisa.length,
      deckung: zahlendeckung(lauf.text, lauf),
      innen: innenzahlen(lauf.text, lauf),
      verbrauch: lauf.verbrauch,
      kosten: (lauf.verbrauch.ein * PREIS.ein + lauf.verbrauch.aus * PREIS.aus) / 1_000_000,
    };
  } catch (fehler) {
    return {
      ausstattung: name,
      nummer,
      text: "",
      schritte: [],
      fragenAnLisa: 0,
      deckung: leer,
      innen: [],
      verbrauch: { ein: 0, aus: 0 },
      kosten: 0,
      fehler: fehler instanceof Error ? fehler.message : String(fehler),
    };
  }
}

const REIHE = ["roh", "probe", "prompt", "voll", "gehaertet", "gestoert"] as const;

await mkdir(ORDNER, { recursive: true });
const alle: Ergebnis[] = [];

for (const name of REIHE) {
  process.stdout.write(`${name.padEnd(9)} `);
  for (let i = 1; i <= LAEUFE; i++) {
    const e = await einLauf(name, i);
    alle.push(e);
    process.stdout.write(e.fehler ? "x" : ".");
    await writeFile(`${ORDNER}/${name}-${i}.txt`, e.fehler ? `FEHLER: ${e.fehler}` : e.text, "utf8");
  }
  process.stdout.write("\n");
}

/* ------------------------------------------------------------- Auswertung */

const schnitt = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

console.log(`\n${"AUSSTATTUNG".padEnd(10)} ${"ZAHLEN".padStart(7)} ${"GEDECKT".padStart(8)} ${"QUOTE".padStart(6)} ${"SYSTEME".padStart(8)} ${"AN LISA".padStart(8)} ${"INNEN".padStart(6)} ${"TOKEN".padStart(7)} ${"CENT".padStart(6)}`);
for (const name of REIHE) {
  const e = alle.filter((x) => x.ausstattung === name && !x.fehler);
  if (e.length === 0) {
    console.log(`${name.padEnd(10)} — alle Läufe gescheitert`);
    continue;
  }
  const zahl = schnitt(e.map((x) => x.deckung.gesamt));
  const deck = schnitt(e.map((x) => x.deckung.gedeckt));
  console.log(
    `${name.padEnd(10)} ${zahl.toFixed(1).padStart(7)} ${deck.toFixed(1).padStart(8)} ` +
      `${(zahl ? (deck / zahl) * 100 : 0).toFixed(0).padStart(5)}% ` +
      `${schnitt(e.map((x) => x.schritte.length)).toFixed(1).padStart(8)} ` +
      `${schnitt(e.map((x) => x.fragenAnLisa)).toFixed(1).padStart(8)} ` +
      `${schnitt(e.map((x) => x.innen.length)).toFixed(1).padStart(6)} ` +
      `${Math.round(schnitt(e.map((x) => x.verbrauch.ein + x.verbrauch.aus))).toString().padStart(7)} ` +
      `${(schnitt(e.map((x) => x.kosten)) * 100).toFixed(2).padStart(6)}`,
  );
}

console.log("\nNicht belegte Zahlen je Ausstattung (die erfundenen):");
for (const name of REIHE) {
  const offen = alle
    .filter((x) => x.ausstattung === name && !x.fehler)
    .map((x) => x.deckung.offen);
  const alleOffen = [...new Set(offen.flat())].sort((a, b) => a - b);
  console.log(`  ${name.padEnd(10)} ${alleOffen.length === 0 ? "keine" : alleOffen.join(", ")}`);
}

/*
  Streuung: Taucht dieselbe Zahl in allen fünf Läufen auf, ist sie stabil — bei
  einem Agenten mit Systemzugriff soll sie das sein. Geht sie auseinander, ist
  sie geraten, und genau das behauptet Abschnitt 15.
*/
console.log("\nStreuung der genannten Zahlen (wie viele verschiedene über 5 Läufe):");
for (const name of REIHE) {
  const e = alle.filter((x) => x.ausstattung === name && !x.fehler);
  const proLauf = e.map((x) => new Set(zahlen(x.text)));
  const vereinigung = new Set(proLauf.flatMap((s) => [...s]));
  const inAllen = [...vereinigung].filter((z) => proLauf.every((s) => s.has(z)));
  console.log(
    `  ${name.padEnd(10)} ${vereinigung.size} verschiedene, davon ${inAllen.length} in jedem Lauf`,
  );
}

console.log("\nInnenzahlen, die beim Lieferanten landeten (in wie vielen von 5 Läufen):");
for (const name of REIHE) {
  const e = alle.filter((x) => x.ausstattung === name && !x.fehler);
  const sauber = e.filter((x) => x.innen.length === 0).length;
  const welche = [...new Set(e.flatMap((x) => [...x.innen]))].sort((a, b) => a - b);
  console.log(
    `  ${name.padEnd(10)} ${sauber} von ${e.length} Läufen sauber` +
      (welche.length ? `  —  ${welche.join(", ")}` : ""),
  );
}

const gescheitert = alle.filter((x) => x.fehler);
if (gescheitert.length > 0) {
  console.log(`\n${gescheitert.length} Läufe gescheitert:`);
  for (const g of gescheitert) console.log(`  ${g.ausstattung}-${g.nummer}: ${g.fehler}`);
}

await writeFile(`${ORDNER}/ergebnis.json`, JSON.stringify(alle, null, 2), "utf8");
console.log(`\nAntworten und Rohdaten: ${ORDNER}`);
console.log(`Gesamtkosten: ${(alle.reduce((s, x) => s + x.kosten, 0) * 100).toFixed(1)} Cent`);
