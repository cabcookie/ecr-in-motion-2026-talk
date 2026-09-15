import { SORTIMENT, type Artikel } from "@ecr-talk/handelswelt";

/**
 * Wer der Teilnehmer in dieser Mail ist.
 *
 * Ohne Briefing schreibt jeder ins Blaue: Man weiß weder, für welche Marke man
 * steht, noch was Nordkorb davon überhaupt führt. Der Agent antwortet dann mit
 * Belegen auf eine Anfrage, die keine Grundlage hatte — und die Pointe des
 * Abends geht verloren.
 *
 * Die Zahlen hier sind KEINE zweite Wahrheit. Sie werden aus demselben
 * `SORTIMENT` gerechnet, in dem der Agent nachschlägt. Was im Briefing steht,
 * findet er auch — und was er zusätzlich findet, ist der eigentliche Gewinn
 * des Gesprächs.
 */

export interface Bestandszeile {
  readonly bezeichnung: string;
  readonly gramm: number;
  readonly zone: string;
  readonly facings: number;
  readonly absatzJahr: number;
  readonly entwicklung: number;
}

export interface Briefing {
  readonly id: string;
  /** Die Marke, für die der Teilnehmer steht. */
  readonly marke: string;
  readonly firma: string;
  readonly rolle: string;
  /**
   * `bestand` leer heißt: Nordkorb führt diese Marke nicht. Das ist kein
   * Mangel, sondern die zweite Sorte Gespräch — eine Neulistung, wie im
   * Szenario auf der Leinwand.
   */
  readonly bestand: readonly Bestandszeile[];
  /** Was der Teilnehmer erreichen will, in einem Satz. */
  readonly auftrag: string;
  /** Der Haken an der Sache — das, was der Agent finden wird. */
  readonly haken: string;
  readonly betreff: string;
  /** Vorgefüllter Mailtext. Die Rolle steht drin, der Name nicht. */
  readonly text: string;
}

const ZONE: Record<string, string> = {
  tafel: "Tafeln",
  riegel: "Riegel",
  pralinen: "Pralinen",
};

function bestandVon(marke: string): Bestandszeile[] {
  return SORTIMENT.filter((a: Artikel) => a.marke === marke).map((a: Artikel) => ({
    bezeichnung: a.bezeichnung,
    gramm: a.gramm,
    zone: ZONE[a.zone] ?? a.zone,
    facings: a.facings,
    absatzJahr: a.absatzJahr,
    entwicklung: a.entwicklung,
  }));
}

/** Die Unterschrift, die jeder Entwurf trägt — der Name bleibt offen. */
function signatur(rolle: string, firma: string): string {
  return `Mit freundlichen Grüßen\n\n[Dein Name]\n${rolle}\n${firma}`;
}

/**
 * Die Briefings.
 *
 * Jedes stammt aus der tatsächlichen Lage seiner Marke im Sortiment, und jedes
 * hat einen Haken, den der Agent finden kann: eine schrumpfende Sorte auf gutem
 * Platz, eine wachsende auf schlechtem, ein Regal, das voll ist. Ohne Haken
 * wäre jede Antwort ein Ja, und ein Agent, der nur Ja sagt, beweist nichts.
 */
const ROHLINGE: ReadonlyArray<Omit<Briefing, "bestand">> = [
  {
    id: "nussberg",
    marke: "Nussberg",
    firma: "Nussberg Confiserie",
    rolle: "Vertriebsleiter",
    auftrag: "Die Listung Deines einzigen Artikels verteidigen.",
    haken:
      "Der Artikel verliert deutlich. Nordkorb hat gute Gründe, den Platz anders zu vergeben — Du brauchst ein Angebot, nicht nur eine Bitte.",
    betreff: "Nussberg Riegel — Vorschlag zur Absatzbelebung",
    text: `Guten Tag Frau Berger,

wir führen bei Ihnen seit Jahren unseren Nussberg Riegel. Uns ist bewusst, dass die Abverkäufe zuletzt nachgelassen haben, und wir möchten das nicht aussitzen.

Wir schlagen eine Einführungsaktion mit Zweitplatzierung im kommenden Quartal vor und beteiligen uns mit einem Aktionsrabatt. Im Gegenzug bitten wir darum, die Listung zunächst fortzuführen.

Wie sehen Sie die Chancen?

${signatur("Vertriebsleiter", "Nussberg Confiserie")}`,
  },
  {
    id: "korngold",
    marke: "Korngold",
    firma: "Korngold Naturwaren",
    rolle: "Key Account Manager",
    auftrag: "Facings umverteilen: mehr für die wachsende Sorte.",
    haken:
      "Deine stärker wachsende Sorte steht auf dem schlechteren Platz. Das lässt sich belegen — wenn Du es ansprichst.",
    betreff: "Korngold — Bitte um Anpassung der Platzierung",
    text: `Guten Tag Frau Berger,

wir sehen bei unseren beiden Artikeln in Ihrem Sortiment eine sehr unterschiedliche Entwicklung. Die Sorte, die am stärksten zulegt, hat dabei den geringsten Regalanteil.

Wir möchten anregen, die Platzierung zwischen unseren beiden Artikeln neu aufzuteilen — ohne zusätzlichen Regalbedarf für Sie.

Über Ihre Einschätzung würden wir uns freuen.

${signatur("Key Account Manager", "Korngold Naturwaren")}`,
  },
  {
    id: "bambini",
    marke: "Bambini",
    firma: "Bambini Süßwaren",
    rolle: "Nationaler Verkaufsleiter",
    auftrag: "Einen Aktionsplatz für Deine wachsenden Riegel bekommen.",
    haken:
      "Zwei Deiner sechs Artikel schrumpfen. Wer mehr Fläche will, wird gefragt, was dafür weicht — rechne damit.",
    betreff: "Bambini — Anfrage Aktionsfläche",
    text: `Guten Tag Frau Berger,

unsere Riegel entwickeln sich bei Ihnen sehr erfreulich. Wir würden diesen Schwung gern mit einer Aktionsfläche verstärken und fragen deshalb einen Zweitplatzierungsplatz im kommenden Quartal an.

Über Konditionen sprechen wir selbstverständlich.

Wann wäre ein Start möglich?

${signatur("Nationaler Verkaufsleiter", "Bambini Süßwaren")}`,
  },
  {
    id: "torretta",
    marke: "Torretta",
    firma: "Torretta Dolciaria",
    rolle: "Export Manager",
    auftrag: "Einen schwachen Artikel gegen einen neuen tauschen.",
    haken:
      "Der Artikel, den Du ersetzen willst, verkauft sich in Stück noch gut — er fällt nur. Die Begründung muss also besser sein als „läuft nicht“.",
    betreff: "Torretta — Sortimentswechsel zum Quartal",
    text: `Guten Tag Frau Berger,

wir möchten unser Sortiment bei Ihnen auffrischen. Konkret schlagen wir vor, unseren schwächsten Artikel auslaufen zu lassen und dafür eine neue Sorte einzulisten — ohne Veränderung der Gesamtfläche.

Für die Einführung bieten wir einen Aktionszeitraum mit reduziertem Einstandspreis an.

Passt das in Ihre Planung zum Quartalswechsel?

${signatur("Export Manager", "Torretta Dolciaria")}`,
  },
  {
    id: "almgold",
    marke: "Almgold",
    firma: "Almgold Alpenschokolade",
    rolle: "Gebietsverkaufsleiter",
    auftrag: "Mehr Regalanteil für Deine Tafeln.",
    haken:
      "Beide Sorten wachsen — aber von einem sehr kleinen Absatz aus. Prozente allein werden hier nicht reichen.",
    betreff: "Almgold — Ausbau der Tafelplatzierung",
    text: `Guten Tag Frau Berger,

unsere beiden Tafeln entwickeln sich bei Ihnen positiv, stehen aber mit sehr wenigen Facings im Regal. Wir sind überzeugt, dass mehr Sichtbarkeit sich unmittelbar im Absatz zeigen würde.

Wir bitten um Prüfung, ob im Tafelbereich eine Ausweitung möglich ist.

${signatur("Gebietsverkaufsleiter", "Almgold Alpenschokolade")}`,
  },
  {
    id: "helvetia",
    marke: "Helvetia",
    firma: "Helvetia Schokoladenmanufaktur",
    rolle: "Leiterin Handelspartner",
    auftrag: "Eine zweite, hochpreisige Sorte einlisten.",
    haken:
      "Du bist mit einem einzigen Artikel gelistet. Für den zweiten musst Du zeigen, warum er nicht den ersten kannibalisiert.",
    betreff: "Helvetia — Listungsanfrage Premiumlinie",
    text: `Guten Tag Frau Berger,

wir sind mit einem Artikel bei Ihnen gelistet und würden das Engagement gern ausbauen. Konkret geht es um eine höherpreisige Sorte, die eine andere Käufergruppe anspricht als unser bestehender Artikel.

Wir sehen darin keinen Wettbewerb zum laufenden Artikel, sondern eine Ergänzung nach oben.

Wären Sie offen für eine Listung zum kommenden Quartal?

${signatur("Leiterin Handelspartner", "Helvetia Schokoladenmanufaktur")}`,
  },
  {
    id: "vega",
    marke: "Vega",
    firma: "Vega Foods",
    rolle: "Key Account Managerin",
    auftrag: "Einen zweiten Artikel unterbringen.",
    haken:
      "Dein bestehender Artikel verliert leicht und ist der teuerste seiner Zone. Ein zweiter wird nicht ohne Weiteres durchgehen.",
    betreff: "Vega — Erweiterung unseres Sortiments",
    text: `Guten Tag Frau Berger,

wir möchten unser Sortiment bei Ihnen um einen zweiten Artikel erweitern und bitten um einen Termin zur Vorstellung.

Uns ist bewusst, dass Regalfläche knapp ist. Wir sind deshalb offen dafür, über die Gesamtaufstellung unserer Marke bei Ihnen zu sprechen.

${signatur("Key Account Managerin", "Vega Foods")}`,
  },

  // ─── Neueinsteiger: Nordkorb führt diese Marken nicht ──────────────────────

  {
    id: "salzwiese",
    marke: "Salzwiese",
    firma: "Salzwiese Manufaktur",
    rolle: "Gründerin",
    auftrag: "Deine Marke erstmals bei Nordkorb listen.",
    haken:
      "Du bist neu — es gibt keine Zahlen zu Dir. Alles, was zählt, sind Marge, freier Regalplatz und der Vorlauf.",
    betreff: "Listungsanfrage Salzwiese — Meersalz-Tafeln",
    text: `Guten Tag Frau Berger,

wir sind eine kleine Manufaktur und möchten unsere Meersalz-Tafeln erstmals bei Nordkorb listen. Als Einstieg schlagen wir zwei Sorten vor, mit einem Start zum kommenden Quartal.

Für die Einführung bieten wir einen Einführungsrabatt über die ersten Wochen an.

Wie gehen wir am besten vor?

${signatur("Gründerin", "Salzwiese Manufaktur")}`,
  },
  {
    id: "kliffgold",
    marke: "Kliffgold",
    firma: "Kliffgold GmbH",
    rolle: "Vertriebsleiterin",
    auftrag: "Eine Neulistung mit Exklusivität durchsetzen.",
    haken:
      "Exklusivität klingt gut und ist teuer: Sie bindet Regalplatz, den Nordkorb sonst frei vergibt. Rechne mit Gegenfragen.",
    betreff: "Exklusive Markteinführung Kliffgold",
    text: `Guten Tag Frau Berger,

wir möchten unsere neue Riegellinie exklusiv mit Nordkorb einführen — vor allen anderen Händlern im Norden. Als Starttermin schlagen wir den kommenden Quartalswechsel vor.

Im Gegenzug für die Exklusivität bieten wir Ihnen bessere Einstandskonditionen als dem übrigen Handel.

Über Ihre Rückmeldung würden wir uns freuen.

${signatur("Vertriebsleiterin", "Kliffgold GmbH")}`,
  },
  {
    id: "duenenhof",
    marke: "Dünenhof",
    firma: "Dünenhof Naturkost",
    rolle: "Key Account Manager",
    auftrag: "Eine regionale Marke in die Märkte im Norden bringen.",
    haken:
      "Du willst nicht die ganze Kette, sondern eine Region. Ob Nordkorb das überhaupt so steuert, musst Du erfragen.",
    betreff: "Dünenhof — regionale Listung im Raum Hamburg",
    text: `Guten Tag Frau Berger,

wir stellen im Norden her und würden gern zunächst regional starten: in den Märkten im Raum Hamburg, nicht bundesweit.

Wir sehen darin einen guten Weg, das Konzept zu prüfen, ohne dass Sie sich sofort auf die ganze Kette festlegen müssen.

Ist eine regional begrenzte Listung bei Ihnen möglich?

${signatur("Key Account Manager", "Dünenhof Naturkost")}`,
  },
];

export const BRIEFINGS: readonly Briefing[] = ROHLINGE.map((r) => ({
  ...r,
  bestand: bestandVon(r.marke),
}));

/** FNV-1a — dieselbe Streuung wie in der Handelswelt, hier nur für die Zuteilung. */
function streuung(text: string): number {
  let h = 0x811c9dc5;
  for (const zeichen of text) {
    h ^= zeichen.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/**
 * Welches Briefing dieses Gerät bekommt.
 *
 * Aus der Gerätekennung gerechnet und nicht gewürfelt: Wer sein Handy sperrt,
 * die Seite neu lädt oder zwischendurch etwas anderes ansieht, soll dieselbe
 * Rolle wiederfinden. Ein neuer Würfelwurf mitten im Schreiben wäre der
 * sicherste Weg, jemanden zu verlieren.
 */
export function briefingFuer(teilnehmer: string): Briefing {
  return BRIEFINGS[streuung(teilnehmer) % BRIEFINGS.length];
}
