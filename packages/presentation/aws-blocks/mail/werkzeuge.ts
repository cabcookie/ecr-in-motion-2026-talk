/**
 * Die Systeme, in denen Lisas Assistent nachschlägt.
 *
 * Sie sind simuliert, und der Vortrag sagt das auch so: „Die Systeme sind
 * simuliert. Die Arbeit des Agenten ist es nicht." Was hier steht, sind
 * dieselben Zahlen wie auf den Folien — die Entscheidung daraus trifft das
 * Modell selbst, und genau die ist echt.
 */
export interface Werkzeug {
  readonly name: string;
  readonly beschreibung: string;
  readonly schema: Record<string, unknown>;
  readonly antwort: () => Record<string, unknown>;
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
    antwort: () => ({ marge: "34,2 %", kategorievorgabe: "mindestens 30 %", erfuellt: true }),
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
