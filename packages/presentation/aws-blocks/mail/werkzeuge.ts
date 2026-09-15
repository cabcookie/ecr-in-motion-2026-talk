/**
 * Die Systeme, in denen Lisas Assistent nachschlägt.
 *
 * Sie sind simuliert, und der Vortrag sagt das auch so: „Die Systeme sind
 * simuliert. Die Arbeit des Agenten ist es nicht." Die Entscheidung aus den
 * Zahlen trifft das Modell selbst, und genau die ist echt.
 *
 * Was hier steht, sind nur Adapter: Werkzeugschema hinein, Portaufruf hinaus.
 * Die Ports liegen in `@ecr-talk/handelswelt` und rechnen auf die Argumente,
 * die das Modell übergibt — vorher gaben sie bei jeder Frage dasselbe zurück.
 */
import {
  anforderungen,
  artikel,
  flaechen,
  kategorie,
  marge,
  platz,
  segment,
  ziele,
  type Befund,
} from "@ecr-talk/handelswelt";

export interface Werkzeug {
  readonly name: string;
  readonly beschreibung: string;
  readonly schema: Record<string, unknown>;
  /**
   * Bekommt die Argumente, die das Modell aufgerufen hat.
   *
   * Dass hier lange nichts ankam, war der eigentliche Fehler: Ein Werkzeug,
   * das seine Argumente nicht sieht, antwortet auf jede Frage dasselbe.
   */
  readonly antwort: (args: Record<string, unknown>) => Record<string, unknown>;
}

/** Eine Zahl aus dem Werkzeugaufruf — das Modell schickt sie mal als Zahl, mal als Text. */
function zahl(wert: unknown): number {
  if (typeof wert === "number") return wert;
  if (typeof wert === "string") return Number(wert.replace(",", ".").replace(/[^0-9.\-]/g, ""));
  return Number.NaN;
}

function text(wert: unknown): string {
  return typeof wert === "string" ? wert : "";
}

/** Anteil als deutsche Prozentangabe — so, wie es in der Antwortmail stehen soll. */
function prozent(anteil: number): string {
  return `${(anteil * 100).toFixed(1).replace(".", ",")} %`;
}

function punkte(wert: number): string {
  return `${wert.toFixed(1).replace(".", ",")} %`;
}

function euro(wert: number): string {
  return `${wert.toFixed(2).replace(".", ",")} €`;
}

/**
 * Übersetzt einen Befund in das, was das Modell sieht.
 *
 * Ein Fehlschlag wird NICHT zum Fehler, sondern zu einer Antwort mit Grund und
 * Hinweis. Das ist der ganze Punkt: Ein Fehler, den die Werkzeugschleife
 * verschluckt, kommt als erfundene Zahl wieder heraus. Ein Grund, den der
 * Agent lesen kann, wird zu einem Satz in der Mail.
 *
 * Und bei einem Treffer gehen `quelle` und `stand` immer mit. Daher kann der
 * Agent sagen, woher die Zahl stammt — vorher lieferte es ihm niemand.
 */
function ausgabe<T>(befund: Befund<T>, umbau: (daten: T) => Record<string, unknown>): Record<string, unknown> {
  if (!befund.ok) return { verfuegbar: false, grund: befund.grund, hinweis: befund.hinweis };
  return { ...umbau(befund.daten), quelle: befund.quelle, stand: befund.stand };
}

const leer = { type: "object", properties: {}, required: [] as string[] };

/**
 * Der Name des Werkzeugs, mit dem der Agent Lisa erreicht.
 *
 * Es steht hier bei den anderen, ist aber keines: Es schlägt nichts nach,
 * sondern legt eine Frage auf Lisas Tisch. Die Werkzeugschleife in agent.ts
 * greift es deshalb gesondert ab — die Frage ist ein ERGEBNIS des Laufs, keine
 * Auskunft eines Systems.
 */
export const FRAGE_LISA = "frage_lisa";

export const WERKZEUGE: readonly Werkzeug[] = [
  {
    name: "warenwirtschaft_kategorie",
    beschreibung:
      "Entwicklung der Kategorie Schokolade & Pralinen in den letzten zwölf Monaten, samt schwächstem und stärkstem Artikel.",
    schema: leer,
    antwort: () =>
      ausgabe(kategorie(), (d) => ({
        kategorie: d.kategorie,
        artikelzahl: d.artikelzahl,
        absatzJahr: d.absatzJahr,
        entwicklung: `${d.entwicklung > 0 ? "+" : ""}${punkte(d.entwicklung)} gegenüber Vorjahr`,
        schwaechsterArtikel: d.schwaechster.artikel,
        entwicklungSchwaechster: `${punkte(d.schwaechster.entwicklung)}`,
        schwaechsterIstEigenmarke: d.schwaechster.eigenmarke,
        staerksterArtikel: d.staerkster.artikel,
        entwicklungStaerkster: `+${punkte(d.staerkster.entwicklung)}`,
      })),
  },
  {
    name: "warenwirtschaft_artikel",
    beschreibung:
      "Schlägt einen einzelnen Artikel im Artikelstamm nach — Absatz, Entwicklung, Preise, Regalzone. Sagt auch, wenn ein Produkt nicht in diese Kategorie gehört.",
    schema: {
      type: "object",
      properties: { suche: { type: "string", description: "Artikel- oder Markenname" } },
      required: ["suche"],
    },
    antwort: (args) =>
      ausgabe(artikel(text(args.suche)), (d) => ({
        artikel: d.artikel,
        artikelnummer: d.nummer,
        regalzone: d.zone,
        eigenmarke: d.eigenmarke,
        absatzJahr: d.absatzJahr,
        entwicklung: `${d.entwicklung > 0 ? "+" : ""}${punkte(d.entwicklung)}`,
        ekPreis: euro(d.ekPreis),
        vkPreis: euro(d.vkPreis),
      })),
  },
  {
    name: "marktdaten_segment",
    beschreibung:
      "In welches Marktsegment ein Produkt fällt, wie das Segment im Markt läuft und wie unsere eigenen Artikel darin laufen. Das Produkt muss nicht gelistet sein.",
    schema: {
      type: "object",
      properties: { produkt: { type: "string", description: "Produktname" } },
      required: ["produkt"],
    },
    antwort: (args) =>
      ausgabe(segment(text(args.produkt)), (d) => ({
        segment: d.segment,
        marktentwicklung: `${d.marktentwicklung > 0 ? "+" : ""}${punkte(d.marktentwicklung)}`,
        eigeneEntwicklung:
          d.eigeneEntwicklung === null
            ? "Wir führen in diesem Segment keinen Artikel."
            : `${d.eigeneEntwicklung > 0 ? "+" : ""}${punkte(d.eigeneEntwicklung)} über ${d.eigeneArtikel} Artikel`,
        abstand:
          d.abstandInPunkten === null
            ? undefined
            : `${d.abstandInPunkten.toFixed(1).replace(".", ",")} Punkte Unterschied zwischen Markt und eigenem Sortiment`,
      })),
  },
  {
    name: "regalplanung_platz",
    beschreibung:
      "Belegung einer Regalzone (tafel, riegel oder pralinen) und welche Artikel bei einer Neulistung als Erste weichen würden.",
    schema: {
      type: "object",
      properties: {
        zone: { type: "string", description: "Regalzone: tafel, riegel oder pralinen" },
      },
      required: ["zone"],
    },
    antwort: (args) =>
      ausgabe(platz(text(args.zone)), (d) => ({
        zone: d.zone,
        facingsKapazitaet: d.kapazitaet,
        facingsBelegt: d.belegt,
        facingsFrei: d.frei,
        artikelInZone: d.artikel,
        weichkandidaten: d.weichkandidaten.map((w) => ({
          artikel: w.artikel,
          facings: w.facings,
          entwicklung: `${punkte(w.entwicklung)}`,
          absatzJahr: w.absatzJahr,
          eigenmarke: w.eigenmarke,
          rohertrag: `${punkte(w.rohertrag)}`,
        })),
      })),
  },
  {
    name: "kalkulation_marge",
    beschreibung:
      "Rohertrag aus Einkaufs- und empfohlenem Verkaufspreis, gegen die Kategorievorgabe. Rechnet auf den Netto-Verkaufspreis.",
    schema: {
      type: "object",
      properties: {
        ekPreis: { type: "number", description: "Einkaufspreis in Euro" },
        vkPreis: { type: "number", description: "Empfohlener Verkaufspreis in Euro" },
      },
      required: ["ekPreis", "vkPreis"],
    },
    antwort: (args) =>
      ausgabe(marge(zahl(args.ekPreis), zahl(args.vkPreis)), (d) => ({
        rohertrag: prozent(d.rohertrag),
        gerechnetAus: `EK ${euro(d.ekPreis)} / VK ${euro(d.vkPreis)}, netto ${euro(d.vkNetto)}`,
        kategorievorgabe: `mindestens ${prozent(d.mindestRohertrag)}`,
        erfuellt: d.erfuellt,
        luft: `${punkte(d.luftInPunkten)} Punkte ${d.luftInPunkten >= 0 ? "über" : "unter"} der Vorgabe`,
      })),
  },
  {
    name: "aktionskalender_zeitraum",
    beschreibung:
      "Prüft einen Wunschtermin gegen die Vorlauffrist und nennt freie Aktionsflächen in seiner Nähe.",
    schema: {
      type: "object",
      properties: {
        termin: { type: "string", description: "Wunschtermin, z. B. „15. Oktober“" },
      },
      required: ["termin"],
    },
    antwort: (args) =>
      ausgabe(flaechen(text(args.termin)), (d) => ({
        wunschtermin: d.wunschtermin,
        vorlauf: `${d.vorlaufTage} Tage, nötig sind ${d.vorlaufNoetig}`,
        fristErfuellt: d.fristErfuellt,
        ...(d.fehlendeTage > 0 ? { fehlendeTage: d.fehlendeTage } : {}),
        freieFlaechen: d.freieFlaechen.map((f) => ({
          datum: f.datum,
          maerkte: f.maerkte,
          region: f.region,
          flaeche: f.art,
          grund: f.grund,
          abstandZumWunschtermin: `${f.abstandZumWunsch > 0 ? "+" : ""}${f.abstandZumWunsch} Tage`,
        })),
        belegt: d.belegt,
      })),
  },
  {
    name: FRAGE_LISA,
    beschreibung:
      "Legt Lisa Berger eine Rückfrage vor. Nutze das für ALLES, was du von ihr brauchst — " +
      "interne Zahlen, Einschätzungen, Freigaben. Die Antwortmail geht an einen Außenstehenden; " +
      "dort hat eine Frage an Lisa nichts zu suchen.",
    schema: {
      type: "object",
      properties: {
        frage: { type: "string", description: "Was du von Lisa wissen musst, als ganzer Satz" },
        warum: { type: "string", description: "Wofür du die Angabe brauchst" },
      },
      required: ["frage", "warum"],
    },
    antwort: (args) => ({
      vermerkt: true,
      hinweis:
        `Die Frage liegt Lisa Berger vor: „${text(args.frage)}". Sie beantwortet sie nicht in ` +
        `diesem Lauf. Schreibe dem Absender ohne sie — benenne die offene Stelle nur so weit, ` +
        `wie er sie kennen darf, und erfinde keinen Wert an ihrer Stelle.`,
    }),
  },
  {
    name: "listung_anforderungen",
    beschreibung:
      "Welche Tore eine Neulistung in dieser Kategorie passieren muss, welche Regel dahinter steht und wer jeweils entscheidet.",
    schema: leer,
    antwort: () =>
      ausgabe(anforderungen(), (d) => ({
        kategorie: d.kategorie,
        tore: d.tore.map((t) => ({
          tor: t.tor,
          regel: t.regel,
          entscheidet: t.entscheidet,
          giltWenn: t.giltWenn,
        })),
      })),
  },
  {
    /*
      Das einzige Werkzeug, das nicht sagt, ob etwas GEHT, sondern ob es
      GEWOLLT ist. Ohne es endet jede Pruefung beim Ja mit Auflagen.
    */
    name: "kategorie_ziele",
    beschreibung:
      "Die Ziele der Kategorie fuer das laufende Geschaeftsjahr, je Kaeufergruppe: welche Gruppe " +
      "gehalten, gesteigert oder neu gewonnen werden soll, wo wir heute stehen und warum. Nutze das, " +
      "bevor du eine Anfrage befuerwortest oder ablehnst - eine Anfrage kann zulaessig sein und " +
      "trotzdem den Zielen widersprechen.",
    schema: leer,
    antwort: () =>
      ausgabe(ziele(), (d) => ({
        geschaeftsjahr: d.geschaeftsjahr,
        imMonat: `${d.monat}. von 12 Monaten`,
        kaeufergruppen: d.staende.map((s) => ({
          gruppe: s.name,
          anlass: s.anlass,
          warumGekauftWird: s.warum,
          richtung: s.richtung,
          vorgabe: s.vorgabe,
          begruendung: s.begruendung,
          anteilFlaeche: `${s.anteilFlaeche} %`,
          anteilAbsatz: `${s.anteilAbsatz} %`,
          entwicklung: `${s.entwicklung} %`,
          zielAnteilFlaeche: s.zielAnteilFlaeche === undefined ? undefined : `${s.zielAnteilFlaeche} %`,
          lage: s.lage,
        })),
      })),
  },
];
