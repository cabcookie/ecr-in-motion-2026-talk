/**
 * Probelauf des Mailwegs ohne AWS und ohne Modell.
 *
 *   pnpm --filter @ecr-talk/presentation mail:test
 *
 * Geprüft wird, was ohne Konto prüfbar ist: dass eine echte Rohmail zerlegt
 * wird, dass die Werkzeuge des Postfach-Agenten mitschreiben, was sie
 * gefunden haben, und dass die Antwortmail die Belege trägt, die der Vortrag
 * verspricht — ohne die internen Rückfragen. Die Werkzeuge werden dafür direkt
 * aufgerufen, so wie das Modell sie aufriefe.
 *
 * Ob das Modell sie auch so aufruft, prüft `scripts/postfach-lauf.ts` gegen
 * echtes Bedrock.
 */
import { readFileSync } from "node:fs";
import { antworteVerMail, frageLisa, type Brief } from "../aws-blocks/agent/antwort";
import { akteFuer, type Akte } from "../aws-blocks/agent/akte";
import { fachwerkzeuge } from "../aws-blocks/agent/werkzeuge";
import { baueRohmail, baueRumpf, lies, mitAnhang } from "../aws-blocks/mail/brief";
import { postfachFuer } from "../aws-blocks/mail/konfig";
import { anhangStruktur, anhangText } from "../aws-blocks/mail/anhang";
import { RUHE_HINWEIS, ruheRumpf } from "../aws-blocks/mail/ruhe";

/*
  Der feste Teil der Mail kommt aus anhang.md. Unter tsx gibt es kein
  __dirname, deshalb ueber import.meta.url - in der Lambda liest der Handler
  dieselbe Datei auf seinem Weg. Eine Quelle, drei Laufzeiten.
*/
const ROH = readFileSync(new URL("../aws-blocks/mail/anhang.md", import.meta.url), "utf8");
const ANHANG = anhangText(ROH);
const ABSPANN = anhangStruktur(ROH);

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

/*
  Die Werkzeugfabrik von Blocks gibt die Definition mit einer Marke zurück.
  Für den Test reicht die Definition selbst: Ihr `handler` ist genau das, was
  das Rahmenwerk beim Aufruf ausführt.
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tool = ((definition: unknown) => definition) as any;
type Aufrufbar = {
  handler: (args: { input: Record<string, unknown>; context: Record<string, unknown>; interrupt: () => never }) => Promise<unknown>;
  parameters: { shape: Record<string, unknown> };
};
const unterbrochen = (): never => {
  throw new Error("interrupt() aufgerufen - der Mailweg darf nicht anhalten");
};

/**
 * Der Wortlaut einer Frage an das Team, der NIE in einer Mail stehen darf.
 *
 * Bewusst unverwechselbar gewählt: Taucht dieser Satz in der Mail an Andreas
 * Walter auf, ist der Adressat vertauscht (zn2m).
 */
const GEHEIME_FRAGE =
  "Wie hoch ist unsere interne Absatzerwartung für die Riegelzone im vierten Quartal?";

function pruefe(bedingung: boolean, was: string) {
  console.log(`${bedingung ? "  ok  " : "  FEHLER  "} ${was}`);
  if (!bedingung) process.exitCode = 1;
}

const eingang = await lies(new TextEncoder().encode(ROHMAIL));
console.log("Rohmail zerlegt");
pruefe(eingang.absender === "andreas.walter@example.com", "Absender gelesen");
pruefe(eingang.absenderName === "Andreas Walter", "Anzeigename gelesen");
pruefe(eingang.betreff === "Anfrage an das Category Management", "Betreff entschlüsselt (RFC 2047)");
pruefe(eingang.text.includes("Crispy Bites"), "Text gelesen");
pruefe(eingang.text.includes("Wunschtermin"), "Umlaute unbeschädigt");
pruefe(eingang.messageId === "<abc123@example.com>", "Message-ID für den Gesprächsfaden");

console.log("\nPostfach erkannt");
pruefe(postfachFuer(["ecr2026@carstenbkoch.de"])?.adresse === "ecr2026@carstenbkoch.de", "ecr2026 → Assistent");
pruefe(postfachFuer(["ECR2026@carstenbkoch.de"])?.adresse === "ecr2026@carstenbkoch.de", "Groß- und Kleinschreibung egal");
pruefe(
  postfachFuer(["Lisa <ecr2026@carstenbkoch.de>"])?.adresse === "ecr2026@carstenbkoch.de",
  "Adresse mit Anzeigename",
);
pruefe(
  postfachFuer(["ecr2026-probe@carstenbkoch.de"])?.adresse === "ecr2026@carstenbkoch.de",
  "das entfallene Postfach ecr2026-probe@ fällt auf ecr2026@ zurück",
);
pruefe(
  postfachFuer(["andere@carstenbkoch.de", "ecr2026@carstenbkoch.de"])?.adresse === "ecr2026@carstenbkoch.de",
  "mehrere Empfänger, einer davon der Vortrag",
);
pruefe(postfachFuer(["carsten@carstenbkoch.de"]) === undefined, "fremde Adresse der Domain → keine Antwort");
pruefe(postfachFuer(["xecr2026@carstenbkoch.de"]) === undefined, "Teilstück reicht nicht");
pruefe(postfachFuer([]) === undefined, "ohne Empfänger → keine Antwort");

console.log("\nFachwerkzeuge schreiben mit");
const kanal = "test-kanal";
const kontext = {
  absender: eingang.absender,
  absenderName: eingang.absenderName,
  betreff: eingang.betreff,
  eingang: eingang.text,
  kanal,
};
const werkzeuge = fachwerkzeuge(tool) as unknown as Record<string, Aufrufbar>;
pruefe(Object.keys(werkzeuge).length === 8, `acht Fachwerkzeuge (${Object.keys(werkzeuge).join(", ")})`);
pruefe(
  Object.values(werkzeuge).every((w) => "warum" in w.parameters.shape),
  "jedes Fachwerkzeug verlangt ein warum",
);
const ohneZiele = fachwerkzeuge(tool, ["kategorie_ziele"]);
pruefe(!("kategorie_ziele" in ohneZiele) && Object.keys(ohneZiele).length === 7, "ohne nimmt ein Werkzeug heraus");

await werkzeuge.kalkulation_marge.handler({
  input: { ekPreis: 2.89, vkPreis: 4.49, warum: "Ich prüfe, ob die Konditionen tragen." },
  context: kontext,
  interrupt: unterbrochen,
});
await werkzeuge.regalplanung_platz.handler({
  input: { zone: "riegel", warum: "Ich prüfe, ob im Regal Platz ist." },
  context: kontext,
  interrupt: unterbrochen,
});
/* Der Chat hat keinen Kanal und schreibt nichts mit. */
await werkzeuge.warenwirtschaft_kategorie.handler({
  input: { warum: "Chatfrage" },
  context: { absender: "teilnehmer-1" },
  interrupt: unterbrochen,
});
const akte = akteFuer(kanal);
pruefe(akte.schritte.length === 2, `zwei Systeme in der Akte (${akte.schritte.map((s) => s.system).join(", ")})`);
pruefe(akte.schritte[0]?.warum === "Ich prüfe, ob die Konditionen tragen.", "das warum steht in der Akte");

console.log("\nRückfrage an das Team hält nicht an");
const abgelegt: string[] = [];
const frage = frageLisa(tool, async (f) => {
  abgelegt.push(f.frage);
}) as unknown as Aufrufbar;
const frageErgebnis = (await frage.handler({
  input: { frage: GEHEIME_FRAGE, warum: "Für die Mindestabnahme." },
  context: kontext,
  interrupt: unterbrochen,
})) as { vermerkt?: boolean };
pruefe(frageErgebnis.vermerkt === true, "die Frage kommt sofort zurück, ohne interrupt()");
pruefe(abgelegt.length === 1, "die Frage liegt in der Ablage");
pruefe(akte.fragen.length === 1, "die Frage steht in der Akte");

console.log("\nVersand");
const gesendet: { brief: Brief; akte: Akte }[] = [];
const mail = antworteVerMail(tool, async (_k, brief, a) => {
  gesendet.push({ brief, akte: a });
}) as unknown as Aufrufbar;
const brief: Brief = {
  betreff: "Ihre Anfrage zu Hallbach Crispy Bites",
  anrede: "Guten Tag Herr Walter,",
  text: "wir möchten Hallbach Crispy Bites listen, allerdings erst zum 22. Oktober.",
  grussformel: "Viele Grüße",
};
await mail.handler({ input: { ...brief }, context: kontext, interrupt: unterbrochen });
const zweiter = (await mail.handler({ input: { ...brief }, context: kontext, interrupt: unterbrochen })) as {
  gesendet: boolean;
};
pruefe(gesendet.length === 1, "genau eine Mail, auch bei zwei Aufrufen");
pruefe(zweiter.gesendet === false, "der zweite Aufruf erfährt, dass schon gesendet ist");

console.log("\nAntwortmail");
const rumpf = baueRumpf(brief, akte);
const text = mitAnhang(rumpf, ANHANG, eingang);
pruefe(text.startsWith("Guten Tag Herr Walter,"), "beginnt mit der Anrede, ohne Vorrede");
pruefe(text.includes("Viele Grüße\nLisa Berger"), "Unterschrift vom Code gesetzt");
pruefe(text.includes("Kalkulation — Marge"), "Schrittfolge im Klartext");
pruefe(text.includes("Ich prüfe, ob die Konditionen tragen."), "Begründung des Agenten in der Fusszeile");
pruefe(text.includes("erfüllt unsere Kategorievorgabe"), "Ergebnis als Befund");
pruefe(!/\d+,\d+ ?%/.test(rumpf), "keine Prozentwerte in Brief und Fusszeile");
pruefe(!/Nocturne|Facings/i.test(rumpf), "weder Weichkandidat noch Facings in der Fusszeile");
pruefe(text.includes("ecr2026.carstenbkoch.de"), "Link zum Vortrag");
pruefe(text.includes("github.com/cabcookie"), "Link zum Quelltext");
pruefe(text.includes("von einem KI-Agenten"), "Kennzeichnung als Maschine");
pruefe(text.includes("> wir möchten unser neues Produkt"), "Zitat der Anfrage");
pruefe(text.indexOf("> wir möchten") > text.indexOf("von einem KI-Agenten"), "Zitat nach dem Anhang");
/*
  Markdown darf den Empfaenger nie erreichen. Die Datei ist Markdown, weil
  Folie und PDF ihre Struktur brauchen — die Mail ist reiner Text, und ein ##
  kaeme dort als ## an.
*/
pruefe(!/^#|^- \[|\]\(http|^</m.test(text), "keine Markdown-Zeichen in der Mail");
pruefe(text.includes("Ich lösche diese Daten"), "Ehrlicher Hinweis zur Adresse");
pruefe(!text.includes("ist damit gelöscht"), "Kein Versprechen, das der Betrieb nicht hält");

for (const abschnitt of ABSPANN.abschnitte) {
  for (const e of abschnitt.eintraege) {
    pruefe(text.includes(e.url), `Einstieg verlinkt: ${e.was}`);
  }
}
/*
  Eine umgebrochene URL ist keine. Deshalb steht dort nur die URL und nichts
  sonst; die Prüfung schlägt an, sobald jemand Text danebenzieht.
*/
const alleAdressen = ABSPANN.abschnitte.flatMap((a) => a.eintraege.map((e) => e.url));
const langeZeilen = text.split("\n").filter((z) => alleAdressen.some((u) => z.includes(u)));
pruefe(
  langeZeilen.length > 0 && langeZeilen.every((z) => z.trim().startsWith("http")),
  "Jede URL der Einstiege steht allein auf ihrer Zeile",
);

/*
  Der Adressat (zn2m): Die Frage an das Team darf den Absender nie erreichen.
*/
console.log("\nAdressatentrennung");
pruefe(!text.includes(GEHEIME_FRAGE), "Der Wortlaut der Frage steht NICHT in der Mail");
pruefe(!/Absatzerwartung|vierten Quartal/i.test(text), "Auch kein Bruchstück davon steht in der Mail");
pruefe(!text.includes("frage_das_team"), "Der Werkzeugname steht nicht in der Mail");
pruefe(text.includes("interne Rückfrage"), "Dass eine Rückfrage läuft, darf der Absender erfahren");
pruefe(
  !baueRumpf(brief, { schritte: [], fragen: [], gesendet: false }).includes("interne Rückfrage"),
  "Ohne Rückfrage steht der Satz auch nicht da",
);

/*
  Gegenprobe: Ohne die Trennung wäre nichts aufgefallen. Dieser Test muss bei
  einer Mail anschlagen, in der die Frage tatsächlich steht.
*/
pruefe(
  `Guten Tag,\n\n${GEHEIME_FRAGE}`.includes(GEHEIME_FRAGE),
  "Die Prüfung schlägt an, wenn der Wortlaut doch in einem Text steht",
);

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
const rohRumpf = roh.split("\r\n\r\n").slice(1).join("\r\n\r\n").replace(/\r\n/g, "");
pruefe(Buffer.from(rohRumpf, "base64").toString("utf8").includes("Kalkulation — Marge"), "Rumpf lesbar zurück");

/*
  Außerhalb des Vortragsfensters: kein Agent, kein Zitat, nur der
  Hinweis und der feste Teil. So baut die Mail-Lambda sie zusammen.
*/
console.log("\nFeste Antwort außerhalb des Vortragsfensters");
const ruhe = mitAnhang(ruheRumpf(), ANHANG);
pruefe(ruhe.includes("Lisa ist im Moment nicht aktiv."), "Hinweis, dass Lisa nicht aktiv ist");
pruefe(ruhe.includes("frag gerne eine Präsentation bei Euch an"), "Einladung, eine Präsentation anzufragen");
pruefe(RUHE_HINWEIS.split("\n").includes("https://carstenbkoch.de/"), "Verweis auf carstenbkoch.de, allein auf der Zeile");
pruefe(ruhe.includes("von einem KI-Agenten"), "Kennzeichnung als automatische Antwort bleibt");
pruefe(ruhe.includes("ecr2026.carstenbkoch.de/vortrag"), "Link zum Vortrag");
for (const abschnitt of ABSPANN.abschnitte) {
  for (const e of abschnitt.eintraege) pruefe(ruhe.includes(e.url), `Material verlinkt: ${e.was}`);
}
pruefe(!ruhe.includes("> "), "kein Zitat");
pruefe(!ruhe.includes("schrieb"), "keine Zitatzeile");
pruefe(!ruhe.includes(eingang.text.split("\n")[2] ?? "Crispy Bites"), "kein Wort aus der eingegangenen Mail");
pruefe(!/Lisa Berger|abgefragt/.test(ruhe), "keine Unterschrift und keine Schrittfolge des Agenten");
pruefe(!/^#|^- \[|\]\(http|^</m.test(ruhe), "keine Markdown-Zeichen");

console.log(process.exitCode ? "\nMit Fehlern." : "\nAlles grün.");
