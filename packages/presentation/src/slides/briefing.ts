import { SORTIMENT, gruppeMit, type Artikel } from "@ecr-talk/handelswelt";

/**
 * Wer der Teilnehmer in dieser Mail ist — und was er konkret will.
 *
 * Ohne Briefing schreibt jeder ins Blaue: Man weiß weder, für welche Marke man
 * steht, noch was Nordkorb davon führt. Der Agent antwortet dann mit Belegen
 * auf eine Anfrage, die keine Grundlage hatte.
 *
 * Zwei Regeln, die dieses Modul zusammenhalten:
 *
 * **Die Zahlen sind keine zweite Wahrheit.** Der Bestand wird aus demselben
 * `SORTIMENT` gerechnet, in dem der Agent nachschlägt. Was im Briefing steht,
 * findet er auch.
 *
 * **Jedes Produkt hat einen Grund zu existieren.** Ein Name allein sagt
 * niemandem etwas — weder dem Teilnehmer noch dem Agenten. Deshalb trägt jedes
 * Produkt, was es ist, für wen es gedacht ist und warum jemand danach greift.
 * Erst das macht es prüfbar: Der Agent kann eine Käufergruppe gegen die Ziele
 * der Kategorie halten, ein Adjektiv nicht.
 */

/** Worum es in der Mail geht. Nicht jede Anfrage ist eine Listung. */
export type Szenariotyp =
  | "neulistung"
  | "exklusivitaet"
  | "aktionsflaeche"
  | "ek-erhoehung"
  | "auslistung-abwenden"
  | "facings"
  | "lieferengpass"
  | "relaunch"
  | "preissenkung"
  | "regional"
  | "terminverschiebung"
  | "sortimentstausch";

export interface Produkt {
  readonly name: string;
  /** Format, Rezeptur, Preislage — was ein Category Manager wissen muss. */
  readonly was: string;
  /** Warum jemand danach greift. Das, was auf keiner Packung steht. */
  readonly warum: string;
  /** Kennung der Käufergruppe aus der Handelswelt. */
  readonly gruppe: string;
  readonly ekPreis?: number;
  readonly vkPreis?: number;
}

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
  readonly typ: Szenariotyp;
  readonly marke: string;
  readonly firma: string;
  readonly rolle: string;
  /**
   * `bestand` leer heißt: Nordkorb führt diese Marke nicht. Das ist kein
   * Mangel, sondern die zweite Sorte Gespräch — eine Neulistung.
   */
  readonly bestand: readonly Bestandszeile[];
  /** Das Produkt, um das es geht. Fehlt, wo es um Bestand oder Termine geht. */
  readonly produkt?: Produkt;
  readonly auftrag: string;
  /** Der Haken — das, was der Agent finden wird. */
  readonly haken: string;
  readonly betreff: string;
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

function signatur(rolle: string, firma: string): string {
  return `Mit freundlichen Grüßen\n\n[Dein Name]\n${rolle}\n${firma}`;
}

/**
 * Die Szenarien.
 *
 * Absichtlich ungleich verteilt über die Ziele der Kategorie: Ein Teil trifft
 * eine Gruppe, die wir gewinnen wollen, ein Teil eine, die geschlossen ist, der
 * Rest liegt dazwischen. Bekäme der halbe Saal dieselbe Antwort, wäre der
 * Abend langweilig — und bekäme er nur Absagen, wäre er ärgerlich.
 */
const ROHLINGE: ReadonlyArray<Omit<Briefing, "bestand">> = [
  // ───────────────────────── Bewusst: die Gruppe, die wir gewinnen wollen
  {
    id: "salzwiese",
    typ: "neulistung",
    marke: "Salzwiese",
    firma: "Salzwiese Manufaktur",
    rolle: "Gründerin",
    produkt: {
      name: "Salzwiese Meersalz",
      was: "90-g-Tafel, vegane Rezeptur auf Haferbasis, 55 % Kakao, grobes Meersalz. EK 1,65 €, empfohlener VK 2,79 €.",
      warum:
        "Wer auf Milch verzichtet, findet im Tafelregal fast nur Bitterschokolade. Diese Tafel schmeckt wie Vollmilch und kommt ohne aus — die Käuferin kauft sie, weil sie nicht verzichten will.",
      gruppe: "bewusst",
      ekPreis: 1.65,
      vkPreis: 2.79,
    },
    auftrag: "Deine Marke erstmals bei Nordkorb listen.",
    haken:
      "Du bist neu — es gibt keine Zahlen zu Dir. Alles, was zählt, sind Marge, freier Regalplatz und die Frage, ob Nordkorb diese Käufergruppe überhaupt ausbauen will.",
    betreff: "Listungsanfrage Salzwiese Meersalz — vegane Tafel",
    text: `Guten Tag Frau Berger,

wir möchten unsere Tafel Salzwiese Meersalz erstmals bei Nordkorb listen.

Zum Produkt: 90 g, vegane Rezeptur auf Haferbasis, 55 % Kakao, grobes Meersalz. EK 1,65 €, empfohlener VK 2,79 €. Mindestabnahme 400 VE, Start zum 2. November.

Warum wir daran glauben: Wer auf Milch verzichtet, findet im Tafelregal heute fast nur Bitterschokolade. Unsere Tafel schmeckt wie Vollmilch und kommt ohne aus. Gekauft wird sie nicht aus Verzicht, sondern weil sie schmeckt — das ist der Unterschied, den unsere Testmärkte zeigen.

Für die Einführung bieten wir 12 % Rabatt über die ersten sechs Wochen.

${signatur("Gründerin", "Salzwiese Manufaktur")}`,
  },
  {
    id: "kliffgold",
    typ: "exklusivitaet",
    marke: "Kliffgold",
    firma: "Kliffgold GmbH",
    rolle: "Vertriebsleiterin",
    produkt: {
      name: "Kliffgold Noir 72",
      was: "90-g-Riegel, 72 % Kakao aus Einzelherkunft, ohne Zuckerzusatz gesüßt mit Dattelpaste. EK 1,19 €, empfohlener VK 1,99 €.",
      warum:
        "Der Riegel für Leute, die abends etwas Dunkles wollen, ohne gleich eine ganze Tafel aufzumachen. Hoher Kakaoanteil in einem Format, das man in einem Zug isst.",
      gruppe: "bewusst",
      ekPreis: 1.19,
      vkPreis: 1.99,
    },
    auftrag: "Neulistung mit Exklusivität für den Norden durchsetzen.",
    haken:
      "Exklusivität klingt nach einem Geschenk und ist eine Bindung. Sie ist nicht im Category Management zu entscheiden — frag Dich, was Du anbietest, damit sie das Haus höher trägt.",
    betreff: "Exklusive Markteinführung Kliffgold Noir 72",
    text: `Guten Tag Frau Berger,

wir möchten unseren Riegel Kliffgold Noir 72 exklusiv mit Nordkorb einführen — vor allen anderen Händlern im Norden, für zwölf Monate.

Zum Produkt: 90 g, 72 % Kakao aus Einzelherkunft, ohne Zuckerzusatz, gesüßt mit Dattelpaste. EK 1,19 €, empfohlener VK 1,99 €. Mindestabnahme 600 VE, Start zum 5. November.

Die Zielgruppe ist der abendliche Genuss ohne schlechtes Gewissen: Wer etwas Dunkles möchte, muss heute eine ganze Tafel aufmachen. Unser Format isst man in einem Zug.

Für die Exklusivität bieten wir Ihnen 8 % besseren Einstand als dem übrigen Handel sowie einen Werbekostenzuschuss von 4.000 € für die Einführung.

${signatur("Vertriebsleiterin", "Kliffgold GmbH")}`,
  },

  // ───────────────────────── Impuls: die Gruppe, die wir steigern wollen
  {
    id: "helvetia",
    typ: "neulistung",
    marke: "Helvetia",
    firma: "Helvetia Schokoladenmanufaktur",
    rolle: "Leiterin Handelspartner",
    produkt: {
      name: "Helvetia Grand Cru Mini",
      was: "40-g-Einzelriegel für die Kassenzone, 64 % Kakao, Vollmilch-Nougat-Kern. EK 0,42 €, empfohlener VK 0,79 €.",
      warum:
        "Der Griff an der Kasse, wenn man sich etwas gönnen will und keine Tafel braucht. Preislage unter einem Euro — die Grenze, ab der niemand mehr nachdenkt.",
      gruppe: "impuls",
      ekPreis: 0.42,
      vkPreis: 0.79,
    },
    auftrag: "Ein zweites Produkt bei Nordkorb unterbringen — im Kleinformat.",
    haken:
      "Du bist mit einem einzigen Artikel gelistet. Für den zweiten musst Du zeigen, dass er den ersten nicht kannibalisiert — und die Riegelzone ist randvoll.",
    betreff: "Helvetia Grand Cru Mini — Listung für die Kassenzone",
    text: `Guten Tag Frau Berger,

wir sind mit unserem Knusperkreuz bei Ihnen gelistet und möchten das Engagement um ein Kleinformat erweitern.

Zum Produkt: Helvetia Grand Cru Mini, 40 g Einzelriegel, 64 % Kakao mit Vollmilch-Nougat-Kern. EK 0,42 €, empfohlener VK 0,79 €. Mindestabnahme 1.200 Stück, Start zum 2. November.

Gedacht ist er für den Griff an der Kasse: Wer sich etwas gönnen will, braucht dafür keine Tafel. Unter einem Euro denkt niemand mehr nach — genau dort liegen wir.

Das Kleinformat steht nicht im Wettbewerb zu unserem Knusperkreuz, sondern bedient einen anderen Moment.

${signatur("Leiterin Handelspartner", "Helvetia Schokoladenmanufaktur")}`,
  },
  {
    id: "bambini",
    typ: "aktionsflaeche",
    marke: "Bambini",
    firma: "Bambini Süßwaren",
    rolle: "Nationaler Verkaufsleiter",
    auftrag: "Eine Aktionsfläche für Deine wachsenden Riegel bekommen.",
    haken:
      "Zwei Deiner sechs Artikel schrumpfen. Wer Fläche will, wird gefragt, was dafür weicht — und es gibt nur zwei freie Aktionsflächen im Quartal.",
    betreff: "Bambini — Anfrage Zweitplatzierung Q4",
    text: `Guten Tag Frau Berger,

unsere Riegel Carte und Doppio entwickeln sich bei Ihnen zweistellig. Diesen Schwung möchten wir mit einer Zweitplatzierung verstärken.

Konkret fragen wir eine Aktionsfläche zum 22. Oktober an, vier Wochen Laufzeit, für die beiden Artikel im Doppelpack-Display.

Unser Beitrag: 15 % Aktionsrabatt über die Laufzeit, Displaykosten übernehmen wir vollständig, dazu 2.500 € Werbekostenzuschuss für die Handzettelanzeige.

Kalkulatorisch ändert sich für Sie nichts — der Rabatt geht zu unseren Lasten.

Passt das in Ihre Aktionsplanung?

${signatur("Nationaler Verkaufsleiter", "Bambini Süßwaren")}`,
  },

  // ───────────────────────── Preiseinstieg: die Gruppe, die geschlossen ist
  {
    id: "morgenrot",
    typ: "neulistung",
    marke: "Morgenrot",
    firma: "Morgenrot Schokolade",
    rolle: "Vertriebsleiter",
    produkt: {
      name: "Morgenrot Alltagstafel",
      was: "100-g-Vollmilchtafel, klassische Rezeptur, Preiseinstieg. EK 0,55 €, empfohlener VK 0,89 €.",
      warum:
        "Die Tafel für Haushalte, die in Cent je 100 Gramm rechnen. Kein Erlebnis, sondern Grundversorgung — und billiger als jede Herstellermarke im Regal.",
      gruppe: "preiseinstieg",
      ekPreis: 0.55,
      vkPreis: 0.89,
    },
    auftrag: "Eine Preiseinstiegstafel bei Nordkorb listen.",
    haken:
      "Die Marge stimmt, der Termin auch. Trotzdem wirst Du wahrscheinlich eine Absage bekommen — und der Grund steht nicht in der Kalkulation.",
    betreff: "Listungsanfrage Morgenrot Alltagstafel",
    text: `Guten Tag Frau Berger,

wir möchten unsere Morgenrot Alltagstafel bei Ihnen listen.

Zum Produkt: 100 g Vollmilch, klassische Rezeptur. EK 0,55 €, empfohlener VK 0,89 €. Mindestabnahme 800 VE, Start zum 2. November.

Die Alltagstafel ist bewusst als Preiseinstieg gerechnet: Sie richtet sich an Haushalte, die in Cent je 100 Gramm rechnen und heute zur Eigenmarke greifen. Wir liegen unter jeder Herstellermarke in Ihrem Regal.

Für die Einführung bieten wir 10 % Rabatt über acht Wochen.

${signatur("Vertriebsleiter", "Morgenrot Schokolade")}`,
  },
  {
    id: "wildberg",
    typ: "neulistung",
    marke: "Wildberg",
    firma: "Wildberg Süßwarenwerk",
    rolle: "Key Account Manager",
    produkt: {
      name: "Wildberg Familienriegel",
      was: "300-g-Multipack, zehn Einzelriegel mit Karamellfüllung. EK 1,15 €, empfohlener VK 1,69 €.",
      warum:
        "Der Vorrat für die Brotdose. Gekauft wird nach Preis je Riegel, nicht nach Geschmack — die Packung muss günstig aussehen und lange halten.",
      gruppe: "preiseinstieg",
      ekPreis: 1.15,
      vkPreis: 1.69,
    },
    auftrag: "Einen preisaggressiven Multipack listen.",
    haken:
      "Rechne selbst nach, bevor Du sendest: Bei 7 % Mehrwertsteuer auf den Netto-VK kommen hier keine 30 % heraus. Das wird auffallen.",
    betreff: "Listungsanfrage Wildberg Familienriegel",
    text: `Guten Tag Frau Berger,

wir möchten unseren Familienriegel bei Ihnen listen: 300-g-Multipack mit zehn Einzelriegeln, Karamellfüllung. EK 1,15 €, empfohlener VK 1,69 €. Mindestabnahme 500 VE, Start zum 2. November.

Das Produkt zielt auf die Brotdose: gekauft wird nach Preis je Riegel. Mit 16,9 Cent je Riegel liegen wir deutlich unter allem, was Sie heute im Regal haben.

Wir sind überzeugt, dass der Artikel Frequenz bringt.

${signatur("Key Account Manager", "Wildberg Süßwarenwerk")}`,
  },

  // ───────────────────────── Bestand: keine Listung, echter Alltag
  {
    id: "nussberg",
    typ: "ek-erhoehung",
    marke: "Nussberg",
    firma: "Nussberg Confiserie",
    rolle: "Vertriebsleiter",
    auftrag: "Eine Einstandspreiserhöhung von 8 % zum 1. November durchsetzen.",
    haken:
      "Dein Artikel läuft heute schon mit einer Marge unter der Kategorievorgabe — und verliert zweistellig. Die Erhöhung macht aus einem Problem eine Entscheidung.",
    betreff: "Nussberg Riegel — Anpassung der Einstandskonditionen zum 1. November",
    text: `Guten Tag Frau Berger,

wir müssen unsere Einstandspreise anpassen. Für den Nussberg Riegel steigt der EK zum 1. November von 1,24 € auf 1,34 €, das sind 8 %.

Der Grund liegt in den Rohstoffen: Der Kakaopreis hat sich binnen achtzehn Monaten mehr als verdoppelt, Haselnüsse sind nach dem Frostschaden in der türkischen Ernte um 40 % teurer. Wir haben die Erhöhung zweimal verschoben und können sie nicht weiter tragen.

Der empfohlene VK bleibt unverändert bei 1,79 €.

Wir wissen, dass das eine unangenehme Nachricht ist, und stehen für ein Gespräch zur Verfügung.

${signatur("Vertriebsleiter", "Nussberg Confiserie")}`,
  },
  {
    id: "korngold",
    typ: "facings",
    marke: "Korngold",
    firma: "Korngold Naturwaren",
    rolle: "Key Account Manager",
    auftrag: "Facings zwischen Deinen beiden Artikeln umverteilen.",
    haken:
      "Deine wachsende Sorte steht auf dem schlechteren Platz, die schrumpfende auf dem besseren. Das ist belegbar — sag es, statt um Fläche zu bitten.",
    betreff: "Korngold — Anpassung der Platzierung zwischen unseren Artikeln",
    text: `Guten Tag Frau Berger,

wir bitten um eine Anpassung der Platzierung innerhalb unserer beiden gelisteten Artikel — ohne zusätzlichen Regalbedarf für Sie.

Unsere Joghurt-Beere entwickelt sich klar positiv, steht aber mit nur einem Facing im Tafelregal. Unser Korn-Riegel hat drei Facings und verliert. Wir schlagen vor, ein Facing vom Korn auf die Joghurt-Beere zu verlagern.

Für uns ist das ein Nullsummenspiel in der Fläche und ein Gewinn im Abverkauf. Für Sie ebenfalls: Der stärkere Artikel bekommt den Platz.

Über Ihre Einschätzung würden wir uns freuen.

${signatur("Key Account Manager", "Korngold Naturwaren")}`,
  },
  {
    id: "vega",
    typ: "lieferengpass",
    marke: "Vega",
    firma: "Vega Foods",
    rolle: "Key Account Managerin",
    auftrag: "Einen Lieferausfall ankündigen und den Schaden begrenzen.",
    haken:
      "Du forderst nichts — Du bringst eine schlechte Nachricht. Trotzdem muss jemand entscheiden, was sechs Wochen lang auf Deinem Platz steht.",
    betreff: "Vega Buntlinsen — Lieferausfall KW 43 bis KW 48",
    text: `Guten Tag Frau Berger,

eine unangenehme Mitteilung: Unsere Abfüllanlage für die Buntlinsen Erdnuss fällt wegen eines Umbaus von KW 43 bis KW 48 aus. Wir können in diesem Zeitraum nicht liefern.

Betroffen ist ausschließlich dieser Artikel, sechs Wochen, Wiederaufnahme sicher zum 1. Dezember.

Als Ausgleich bieten wir an: eine Vorablieferung von 250 VE in KW 41, damit Sie den Anfang überbrücken, sowie 5 % Nachlass auf alle Lieferungen im ersten Quartal.

Wir verstehen, wenn Sie den Platz zwischenzeitlich anders belegen. Sagen Sie uns bitte, was Sie brauchen.

${signatur("Key Account Managerin", "Vega Foods")}`,
  },
  {
    id: "torretta",
    typ: "sortimentstausch",
    marke: "Torretta",
    firma: "Torretta Dolciaria",
    rolle: "Export Manager",
    produkt: {
      name: "Torretta Nocciola",
      was: "150-g-Pralinenschachtel, ganze Piemonteser Haselnuss in Milchschokolade. EK 1,95 €, empfohlener VK 3,19 €.",
      warum:
        "Das Mitbringsel für zwischendurch: kleiner und günstiger als eine große Schachtel, aber sichtbar kein Supermarktkauf. Wird für andere gekauft, nicht für sich.",
      gruppe: "geschenk",
      ekPreis: 1.95,
      vkPreis: 3.19,
    },
    auftrag: "Deinen schwächsten Artikel gegen einen neuen tauschen.",
    haken:
      "Der Artikel, den Du ersetzen willst, verkauft in Stück noch gut — er fällt nur. Die Begründung muss besser sein als „läuft nicht“.",
    betreff: "Torretta — Sortimentswechsel Tondo gegen Nocciola",
    text: `Guten Tag Frau Berger,

wir möchten unser Pralinensortiment bei Ihnen auffrischen und schlagen einen Tausch vor: Tondo läuft aus, Nocciola kommt neu — gleicher Platz, gleiche Facingzahl.

Zum neuen Artikel: 150-g-Schachtel, ganze Piemonteser Haselnuss in Milchschokolade. EK 1,95 €, empfohlener VK 3,19 €. Mindestabnahme 300 VE, Umstellung zum 2. November.

Gedacht ist die Schachtel als Mitbringsel für zwischendurch — kleiner und günstiger als eine große Packung, aber sichtbar kein Supermarktkauf. Gekauft wird sie für andere, nicht für sich selbst.

Für die Umstellung bieten wir einen reduzierten Einstand über die ersten acht Wochen.

${signatur("Export Manager", "Torretta Dolciaria")}`,
  },
  {
    id: "almgold",
    typ: "relaunch",
    marke: "Almgold",
    firma: "Almgold Alpenschokolade",
    rolle: "Gebietsverkaufsleiter",
    auftrag: "Einen Relaunch mit neuer Artikelnummer durchbekommen.",
    haken:
      "Ein Relaunch mit neuer Artikelnummer ist formal eine Neulistung. Alle Tore gelten wieder — auch die, an die Du nicht denkst.",
    betreff: "Almgold Tafel — Relaunch zum 2. November",
    text: `Guten Tag Frau Berger,

unsere Almgold Tafel 100 g bekommt zum 2. November eine überarbeitete Rezeptur und eine neue Verpackung. Damit ändert sich die Artikelnummer.

Was gleich bleibt: Format, Platzierung, EK und VK.
Was sich ändert: höherer Kakaoanteil (jetzt 38 %), Papierverpackung statt Folie, neue Artikelnummer.

Wir würden den Bestandsartikel auslaufen lassen und den neuen nahtlos anschließen. Aus unserer Sicht ist das kein Sortimentseingriff, sondern eine Fortschreibung.

Was brauchen Sie dafür von uns?

${signatur("Gebietsverkaufsleiter", "Almgold Alpenschokolade")}`,
  },
  {
    id: "duenenhof",
    typ: "regional",
    marke: "Dünenhof",
    firma: "Dünenhof Naturkost",
    rolle: "Key Account Manager",
    produkt: {
      name: "Dünenhof Hafer & Kakao",
      was: "120-g-Tafel aus Haferdrink statt Milch, regional hergestellt in Schleswig-Holstein. EK 1,32 €, empfohlener VK 2,29 €.",
      warum:
        "Käufer, die auf Milch verzichten und trotzdem regional kaufen wollen — zwei Ansprüche, die sich im Regal heute ausschließen.",
      gruppe: "bewusst",
      ekPreis: 1.32,
      vkPreis: 2.29,
    },
    auftrag: "Eine regionale Listung nur im Raum Hamburg erreichen.",
    haken:
      "Du willst nicht die ganze Kette, sondern eine Region. Ob die Kategorie so überhaupt steuert, musst Du erfragen — Regalplanung und Aktionskalender antworten unterschiedlich darauf.",
    betreff: "Dünenhof — regionale Listung im Raum Hamburg",
    text: `Guten Tag Frau Berger,

wir stellen in Schleswig-Holstein her und würden gern regional starten: in Ihren Märkten im Raum Hamburg, nicht bundesweit.

Zum Produkt: Dünenhof Hafer & Kakao, 120-g-Tafel auf Haferdrink statt Milch. EK 1,32 €, empfohlener VK 2,29 €. Mindestabnahme 200 VE für den regionalen Start, ab 2. November.

Die Zielgruppe verbindet zwei Ansprüche, die sich im Regal heute ausschließen: auf Milch verzichten und trotzdem regional kaufen. Genau dafür gibt es bisher kaum etwas.

Ein regionaler Start begrenzt Ihr Risiko — und unseres.

Ist eine regional begrenzte Listung bei Ihnen möglich?

${signatur("Key Account Manager", "Dünenhof Naturkost")}`,
  },
  {
    id: "steinkrone",
    typ: "terminverschiebung",
    marke: "Steinkrone",
    firma: "Steinkrone Confiserie",
    rolle: "Leiter Vertrieb Handel",
    auftrag: "Eine zugesagte Aktion um drei Wochen nach vorn ziehen.",
    haken:
      "Eine Verschiebung nach vorn ist keine Kleinigkeit: Die Vorlauffrist gilt vom neuen Termin an, nicht vom alten. Rechne nach, bevor Du fragst.",
    betreff: "Steinkrone Winteredition — Bitte um Vorverlegung der Aktion",
    text: `Guten Tag Frau Berger,

wir haben für unsere Winteredition eine Aktionsfläche zum 19. November abgestimmt. Wir würden diese gern auf den 22. Oktober vorziehen.

Der Grund: Unser Wettbewerber startet seine Winterlinie in diesem Jahr drei Wochen früher als sonst. Wenn wir erst Ende November kommen, ist das Thema im Markt bereits gesetzt.

Zum Artikel unverändert: Steinkrone Winteredition, 200 g, EK 1,74 €, empfohlener VK 2,69 €, Aktionsrabatt 12 % über vier Wochen.

Wir wissen, dass wir damit kurzfristig sind, und würden die Displaykosten vollständig übernehmen.

Lässt sich das noch einrichten?

${signatur("Leiter Vertrieb Handel", "Steinkrone Confiserie")}`,
  },
  {
    id: "fjordbach",
    typ: "preissenkung",
    marke: "Fjordbach",
    firma: "Fjordbach Naturriegel",
    rolle: "Geschäftsführerin",
    produkt: {
      name: "Fjordbach Cranberry",
      was: "150-g-Riegel mit Cranberry und Mandel, ohne Palmöl. EK 1,48 €, empfohlener VK 2,19 €.",
      warum:
        "Der Riegel für den Nachmittag im Büro: sättigend genug, um die Mahlzeit zu ersetzen, und ohne das schlechte Gewissen eines Schokoriegels.",
      gruppe: "bewusst",
      ekPreis: 1.48,
      vkPreis: 2.19,
    },
    auftrag: "Einen niedrigeren Verkaufspreis durchsetzen, um Marktanteil zu gewinnen.",
    haken:
      "Ein niedrigerer VK geht direkt vom Rohertrag ab. Prüf die Rechnung, bevor Du sie vorschlägst — sonst schlägst Du etwas vor, das die Kategorievorgabe reißt.",
    betreff: "Fjordbach Cranberry — Vorschlag zur Preisposition",
    text: `Guten Tag Frau Berger,

wir möchten unseren Cranberry-Riegel bei Ihnen listen und dabei gleich über die Preisposition sprechen.

Zum Produkt: 150 g mit Cranberry und Mandel, ohne Palmöl. EK 1,48 €. Wir schlagen einen VK von 2,19 € vor — bewusst unter dem, was vergleichbare Riegel im Markt kosten.

Gedacht ist er für den Nachmittag im Büro: sättigend genug, um eine Mahlzeit zu ersetzen, ohne das schlechte Gewissen eines Schokoriegels.

Unsere Überzeugung ist, dass wir über den Preis schneller Reichweite aufbauen und dann gemeinsam nachziehen können.

Wie sehen Sie das?

${signatur("Geschäftsführerin", "Fjordbach Naturriegel")}`,
  },
];

export const BRIEFINGS: readonly Briefing[] = ROHLINGE.map((r) => ({
  ...r,
  bestand: bestandVon(r.marke),
}));

/** Der Name der Käufergruppe, wie ihn die Handelswelt führt. */
export function gruppenName(kennung: string): string {
  return gruppeMit(kennung)?.name ?? kennung;
}

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
 * Rolle wiederfinden. Ein neuer Wurf mitten im Schreiben wäre der sicherste
 * Weg, jemanden zu verlieren.
 */
export function briefingFuer(teilnehmer: string): Briefing {
  return BRIEFINGS[streuung(teilnehmer) % BRIEFINGS.length];
}
