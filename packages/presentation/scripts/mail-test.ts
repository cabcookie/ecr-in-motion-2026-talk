/**
 * Probelauf des Postfach-Agenten ohne AWS.
 *
 *   pnpm --filter @ecr-talk/presentation mail:test
 *
 * Geprüft wird, was ohne Konto prüfbar ist: dass eine echte Rohmail zerlegt
 * wird, dass die Werkzeugschleife die simulierten Systeme abarbeitet und dass
 * die Antwortmail die Belege trägt, die der Vortrag verspricht. Das Modell ist
 * dabei durch eine Attrappe ersetzt.
 */
import { beantworte } from "../aws-blocks/mail/agent";
import { baueAntwort, baueRohmail, lies } from "../aws-blocks/mail/brief";
import { postfachFuer } from "../aws-blocks/mail/konfig";

const ROHMAIL = [
  "Return-Path: <andreas.walter@example.com>",
  "From: Andreas Walter <andreas.walter@example.com>",
  "To: ecr2026@carstenbkoch.de",
  "Subject: =?UTF-8?B?QW5mcmFnZSBhbiBkYXMgQ2F0ZWdvcnkgTWFuYWdlbWVudA==?=",
  "Message-ID: <abc123@example.com>",
  "MIME-Version: 1.0",
  'Content-Type: text/plain; charset="UTF-8"',
  "",
  "Guten Tag Frau Berger,",
  "",
  "wir möchten unser neues Produkt Hallbach Crispy Bites bei Ihnen listen.",
  "Einkaufspreis 2,89 EUR, empfohlener Verkaufspreis 4,49 EUR, Mindestabnahme",
  "500 VE. Wunschtermin für den Start ist der 15. Oktober.",
  "",
  "Mit freundlichen Grüßen",
  "Andreas Walter",
].join("\r\n");

/** Attrappe: ruft erst zwei Werkzeuge auf, dann antwortet sie. */
function attrappe(mitWerkzeugen: boolean) {
  let runde = 0;
  return {
    send: async (befehl: { input: { messages: unknown[]; toolConfig?: unknown } }) => {
      const hatWerkzeuge = Boolean(befehl.input.toolConfig);
      if (hatWerkzeuge !== mitWerkzeugen) {
        throw new Error(`Werkzeuge erwartet: ${mitWerkzeugen}, bekommen: ${hatWerkzeuge}`);
      }
      runde += 1;
      if (mitWerkzeugen && runde === 1) {
        return {
          stopReason: "tool_use",
          output: {
            message: {
              content: [
                { toolUse: { toolUseId: "t1", name: "warenwirtschaft_kategorie", input: {} } },
                { toolUse: { toolUseId: "t2", name: "kalkulation_marge", input: {} } },
              ],
            },
          },
        };
      }
      return {
        stopReason: "end_turn",
        output: { message: { content: [{ text: "Guten Tag Herr Walter,\n\nwir können listen.\n\nMit freundlichen Grüßen" }] } },
      };
    },
  };
}

function pruefe(bedingung: boolean, was: string) {
  console.log(`${bedingung ? "  ok  " : "  FEHLER  "} ${was}`);
  if (!bedingung) process.exitCode = 1;
}

const eingang = await lies(new TextEncoder().encode(ROHMAIL));
console.log("Rohmail zerlegt");
pruefe(eingang.absender === "andreas.walter@example.com", "Absender gelesen");
pruefe(eingang.betreff === "Anfrage an das Category Management", "Betreff entschlüsselt (RFC 2047)");
pruefe(eingang.text.includes("Crispy Bites"), "Text gelesen");
pruefe(eingang.text.includes("Wunschtermin"), "Umlaute unbeschädigt");
pruefe(eingang.messageId === "<abc123@example.com>", "Message-ID für den Gesprächsfaden");

console.log("\nPostfach erkannt");
pruefe(postfachFuer(["ecr2026@carstenbkoch.de"]).modus === "assistent", "ecr2026 → Assistent");
pruefe(postfachFuer(["ecr2026-probe@carstenbkoch.de"]).modus === "probe", "ecr2026-probe → Probe");
pruefe(postfachFuer([]).modus === "assistent", "ohne Empfänger → Assistent");

console.log("\nAssistent mit Werkzeugen");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mit = await beantworte("assistent", eingang.text, attrappe(true) as any);
pruefe(mit.schritte.length === 2, `zwei Systeme abgefragt (${mit.schritte.join(", ")})`);
pruefe(mit.text.includes("listen"), "Antworttext übernommen");

console.log("\nProbe ohne Werkzeuge");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ohne = await beantworte("probe", eingang.text, attrappe(false) as any);
pruefe(ohne.schritte.length === 0, "kein System abgefragt");

console.log("\nAntwortmail");
const text = baueAntwort("assistent", mit);
pruefe(text.includes("Warenwirtschaft — Kategorieentwicklung"), "Schrittfolge im Klartext");
pruefe(text.includes("ecr2026.carstenbkoch.de"), "Link zum Vortrag");
pruefe(text.includes("github.com/cabcookie"), "Link zum Quelltext");
pruefe(text.includes("von einem KI-Agenten"), "Kennzeichnung als Maschine");
pruefe(text.includes("gelöscht"), "Hinweis zur Adresse");
pruefe(!baueAntwort("probe", ohne).includes("Was ich dafür abgefragt"), "Probe ohne Systemliste");

const roh = baueRohmail({
  von: "ecr2026@carstenbkoch.de",
  vonName: "Lisa Berger · Nordkorb",
  an: eingang.absender,
  betreff: eingang.betreff,
  text,
  inAntwortAuf: eingang.messageId,
});
pruefe(roh.includes("In-Reply-To: <abc123@example.com>"), "Antwort hängt am Gesprächsfaden");
pruefe(roh.includes("Subject: Re: Anfrage an das Category Management"), "ASCII-Betreff bleibt lesbar");
const mitUmlaut = baueRohmail({
  von: "ecr2026@carstenbkoch.de",
  vonName: "Lisa Berger · Nordkorb",
  an: eingang.absender,
  betreff: "Listungsanfrage für Süßwaren",
  text: "kurz",
});
pruefe(mitUmlaut.includes("Subject: =?UTF-8?B?"), "Betreff mit Umlauten kodiert (RFC 2047)");
pruefe(mitUmlaut.includes("From: =?UTF-8?B?"), "Anzeigename mit Sonderzeichen kodiert");
const rumpf = roh.split("\r\n\r\n").slice(1).join("\r\n\r\n").replace(/\r\n/g, "");
pruefe(Buffer.from(rumpf, "base64").toString("utf8").includes("Warenwirtschaft"), "Rumpf lesbar zurück");

console.log(process.exitCode ? "\nMit Fehlern." : "\nAlles grün.");
