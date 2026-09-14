/**
 * Die Systeme, in denen Lisas Assistent nachschlägt.
 *
 * Sie sind simuliert, und der Vortrag sagt das auch so: „Die Systeme sind
 * simuliert. Die Arbeit des Agenten ist es nicht." Die Entscheidung aus den
 * Zahlen trifft das Modell selbst, und genau die ist echt.
 *
 * Was hier steht, sind nur noch Adapter: Werkzeugschema hinein, Portaufruf
 * hinaus. Die Kalkulation ist umgestellt und rechnet auf die Argumente, die
 * das Modell übergibt. Die übrigen vier geben noch feste Werte zurück und
 * ignorieren ihre Argumente — das ist `zsqk`.
 */
import { marge } from "@ecr-talk/handelswelt";

export interface Werkzeug {
  readonly name: string;
  readonly beschreibung: string;
  readonly schema: Record<string, unknown>;
  /**
   * Bekommt die Argumente, die das Modell aufgerufen hat.
   *
   * Dass hier bisher nichts ankam, war der eigentliche Fehler: Ein Werkzeug,
   * das seine Argumente nicht sieht, antwortet auf jede Frage dasselbe.
   */
  readonly antwort: (args: Record<string, unknown>) => Record<string, unknown>;
}

/** Eine Zahl aus dem Werkzeugaufruf — das Modell schickt sie mal als Zahl, mal als Text. */
function zahl(wert: unknown): number {
  if (typeof wert === 'number') return wert;
  if (typeof wert === 'string') return Number(wert.replace(',', '.').replace(/[^0-9.\-]/g, ''));
  return Number.NaN;
}

/** Anteil als deutsche Prozentangabe — so, wie es in der Antwortmail stehen soll. */
function prozent(anteil: number): string {
  return `${(anteil * 100).toFixed(1).replace('.', ',')} %`;
}

const leer = { type: "object", properties: {}, required: [] as string[] };

export const WERKZEUGE: readonly Werkzeug[] = [
  {
    name: "warenwirtschaft_kategorie",
    beschreibung:
      "Entwicklung der Kategorie Schokolade & Pralinen in den letzten zwölf Monaten, samt schwächstem Artikel.",
    schema: leer,
    antwort: () => ({
      kategorie: "Schokolade & Pralinen",
      entwicklung: "+3,2 % gegenüber Vorjahr",
      schwaechsterArtikel: "Nocturne Mini",
      entwicklungSchwaechster: "-12 %",
    }),
  },
  {
    name: "marktdaten_segment",
    beschreibung: "Marktentwicklung des Segments, in das ein Produkt fällt.",
    schema: {
      type: "object",
      properties: { produkt: { type: "string", description: "Produktname" } },
      required: ["produkt"],
    },
    antwort: () => ({
      segment: "Crispy / gefüllte Riegel",
      entwicklung: "zweistellig, deutlich schneller als die Gesamtkategorie",
    }),
  },
  {
    name: "regalplanung_platz",
    beschreibung: "Gibt es Regalplatz für eine Neulistung, und wer müsste dafür weichen?",
    schema: leer,
    antwort: () => ({
      freierPlatz: false,
      freiWenn: "Nocturne Mini ausgelistet wird",
      hinweis: "Beide liegen in derselben Regalzone.",
    }),
  },
  {
    name: "kalkulation_marge",
    beschreibung: "Marge aus Einkaufs- und empfohlenem Verkaufspreis, gegen die Kategorievorgabe.",
    schema: {
      type: "object",
      properties: {
        ekPreis: { type: "number", description: "Einkaufspreis in Euro" },
        vkPreis: { type: "number", description: "Empfohlener Verkaufspreis in Euro" },
      },
      required: ["ekPreis", "vkPreis"],
    },
    antwort: (args) => {
      const befund = marge(zahl(args.ekPreis), zahl(args.vkPreis));
      if (!befund.ok) return { fehler: befund.grund, hinweis: befund.hinweis };
      const d = befund.daten;
      return {
        marge: prozent(d.rohertrag),
        gerechnetAus: `EK ${d.ekPreis.toFixed(2).replace(".", ",")} € / VK ${d.vkPreis
          .toFixed(2)
          .replace(".", ",")} € netto ${d.vkNetto.toFixed(2).replace(".", ",")} €`,
        kategorievorgabe: `mindestens ${prozent(d.mindestRohertrag)}`,
        erfuellt: d.erfuellt,
        luft: `${d.luftInPunkten.toFixed(1).replace(".", ",")} Prozentpunkte`,
        quelle: befund.quelle,
        stand: befund.stand,
      };
    },
  },
  {
    name: "aktionskalender_zeitraum",
    beschreibung: "Freie Aktionsflächen im Zeitraum um einen gewünschten Starttermin.",
    schema: {
      type: "object",
      properties: { termin: { type: "string", description: "Wunschtermin, z. B. 15. Oktober" } },
      required: ["termin"],
    },
    antwort: () => ({
      datum: "22. Oktober",
      maerkte: 12,
      region: "Raum Hamburg",
      flaeche: "Zweitplatzierung, Aufsteller",
      grund: "Eine geplante Aktion wurde abgesagt.",
    }),
  },
];
