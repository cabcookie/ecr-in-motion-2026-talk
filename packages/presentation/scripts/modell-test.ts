/**
 * Ein echter Lauf gegen Bedrock — mit genau dem Agenten, der hinter dem
 * Postfach steht.
 *
 * Warum es diese Prüfung gibt: `mail:test` ruft die Werkzeuge direkt auf und
 * prüft die Verrohrung. Als das Modell von Sonnet 4.6 auf Opus 4.8 wechselte,
 * blieb ein solcher Test grün — während in Wahrheit JEDER echte Aufruf
 * scheiterte, weil Opus `temperature` nicht mehr annimmt. Aufgefallen wäre das
 * erst am Vortragsabend, bei der ersten Teilnehmer-Mail.
 *
 * Eine Attrappe prüft, ob wir richtig verdrahtet haben. Sie kann nicht prüfen,
 * ob das Modell unsere Werkzeuge so benutzt, wie wir es vorsehen. Dafür
 * braucht es einen echten Lauf.
 *
 *   AWS_PROFILE=ecrtag pnpm --filter @ecr-talk/presentation modell:test
 */
import { HALLBACH, laufePostfach } from "./postfach-lauf";

let fehler = 0;
function pruefe(was: string, bedingung: boolean, zusatz = ""): void {
  if (bedingung) console.log(`  ok   ${was}`);
  else {
    fehler += 1;
    console.error(`  FEHL ${was}${zusatz ? ` — ${zusatz}` : ""}`);
  }
}

console.log("\nDer Postfach-Agent beantwortet die Hallbach-Mail");

try {
  const lauf = await laufePostfach(HALLBACH);
  const systeme = lauf.akte?.schritte.map((s) => s.system) ?? [];
  pruefe(`Der Agent hat gesendet (${Math.round(lauf.dauerMs / 1000)} s)`, Boolean(lauf.rumpf));
  pruefe(`Mindestens ein System wurde abgefragt (${systeme.join(", ") || "keins"})`, systeme.length > 0);
  pruefe("Die Ziele der Kategorie wurden befragt", systeme.includes("kategorie_ziele"));
  pruefe(
    "Jede Abfrage trägt eine Begründung",
    (lauf.akte?.schritte ?? []).every((s) => Boolean(s.warum?.trim())),
  );
  pruefe("Der Brief spricht Herrn Walter an", /Walter/.test(lauf.brief?.anrede ?? ""), lauf.brief?.anrede);
  pruefe(
    "Keine Prozentwerte im Brief",
    !/\d+[.,]?\d* ?(%|Prozent)/.test(lauf.brief?.text ?? ""),
    lauf.brief?.text.match(/\d+[.,]?\d* ?(%|Prozent)/)?.[0],
  );
} catch (f) {
  pruefe("Der Lauf geht durch", false, f instanceof Error ? f.message : String(f));
}

if (fehler > 0) process.exitCode = 1;
