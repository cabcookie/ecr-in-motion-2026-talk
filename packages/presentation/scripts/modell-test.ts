/**
 * Ein einziger echter Aufruf gegen Bedrock — mit genau der Konfiguration, die
 * der Mail-Agent verwendet.
 *
 * Warum es diese Prüfung gibt: `mail:test` läuft gegen eine Attrappe und prüft
 * die Verrohrung. Als das Modell von Sonnet 4.6 auf Opus 4.8 wechselte, blieb
 * er grün — während in Wahrheit JEDER echte Aufruf scheiterte, weil Opus
 * `temperature` nicht mehr annimmt. Aufgefallen wäre das erst am Vortragsabend,
 * bei der ersten Teilnehmer-Mail.
 *
 * Eine Attrappe prüft, ob wir richtig verdrahtet haben. Sie kann nicht prüfen,
 * ob das Modell unsere Anfrage annimmt. Dafür braucht es einen echten Aufruf,
 * und der kostet hier weniger als ein Zehntel Cent.
 *
 *   AWS_PROFILE=ecrtag pnpm --filter @ecr-talk/presentation modell:test
 */
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { beantworteMit, AUSSTATTUNGEN } from "../aws-blocks/mail/agent";

const client = new BedrockRuntimeClient({});

let fehler = 0;
function pruefe(was: string, bedingung: boolean, zusatz = ""): void {
  if (bedingung) console.log(`  ok   ${was}`);
  else {
    fehler += 1;
    console.error(`  FEHL ${was}${zusatz ? ` — ${zusatz}` : ""}`);
  }
}

console.log("\nDas Modell nimmt unsere Anfrage an");

/*
  Ohne Werkzeuge und mit einer kurzen Aufgabe: Geprüft wird das Modell und die
  Inferenzkonfiguration, nicht die Werkzeugschleife. Die hat ihren eigenen Test.
*/
try {
  const lauf = await beantworteMit(
    { systemprompt: "Antworte in einem Satz.", werkzeuge: false },
    "Bestätige kurz den Eingang dieser Nachricht.",
    client,
  );
  pruefe("Ein Aufruf ohne Werkzeuge geht durch", lauf.text.length > 0);
  pruefe("Token werden gezählt", lauf.verbrauch.ein > 0 && lauf.verbrauch.aus > 0);
} catch (f) {
  pruefe("Ein Aufruf ohne Werkzeuge geht durch", false, f instanceof Error ? f.message : String(f));
}

try {
  const lauf = await beantworteMit(
    AUSSTATTUNGEN.gehaertet,
    "Guten Tag, wir möchten ein Produkt listen. Einkaufspreis 2,89 EUR, Verkaufspreis 4,49 EUR.",
    client,
  );
  pruefe("Ein Aufruf MIT Werkzeugen geht durch", lauf.text.length > 0);
  pruefe(
    `Mindestens ein System wurde abgefragt (${lauf.schritte.join(", ") || "keins"})`,
    lauf.schritte.length > 0,
  );
} catch (f) {
  pruefe("Ein Aufruf MIT Werkzeugen geht durch", false, f instanceof Error ? f.message : String(f));
}

if (fehler > 0) process.exitCode = 1;
