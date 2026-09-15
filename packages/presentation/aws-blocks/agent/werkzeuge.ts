/**
 * Die Werkzeuge des Agenten — einmal geschrieben, von beiden Eingangswegen
 * benutzt.
 *
 * Vorher gab es zwei Agenten: eine selbstgeschriebene Werkzeugschleife für den
 * Mailweg und den Blocks-Agent für den Handy-Chat. Zwei Prompts, zwei
 * Konfigurationen, zwei Codewege — und beide drifteten auseinander.
 *
 * Jetzt ist es ein Agent. Der Unterschied zwischen den Eingangswegen liegt
 * allein darin, womit er antworten kann:
 *
 *   E-Mail  →  `antworte_per_mail` (Entwurf, der Mensch bestätigt) + `frage_das_team`
 *   Chat    →  `antworte_im_chat`
 *
 * Die sechs Fachwerkzeuge teilen sich beide. Sie sind dünne Adapter über die
 * Ports in `@ecr-talk/handelswelt` — Werkzeugschema hinein, Portaufruf hinaus.
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
} from '@ecr-talk/handelswelt';
import { z } from 'zod';
import type { JSONValue, ToolFactory } from '@aws-blocks/bb-agent';

/* ------------------------------------------------------------- Darstellung */

const prozent = (anteil: number) => `${(anteil * 100).toFixed(1).replace('.', ',')} %`;
const punkte = (wert: number) => `${wert.toFixed(1).replace('.', ',')} %`;
const euro = (wert: number) => `${wert.toFixed(2).replace('.', ',')} €`;

/**
 * Übersetzt einen Befund in das, was das Modell sieht.
 *
 * Ein Fehlschlag wird NICHT zum Fehler, sondern zu einer Antwort mit Grund und
 * Hinweis: Ein Fehler, den die Werkzeugschleife verschluckt, kommt als
 * erfundene Zahl wieder heraus. Und bei einem Treffer gehen `quelle` und
 * `stand` immer mit — daher kann der Agent sagen, woher die Zahl stammt.
 */
function ausgabe<T>(
  befund: Befund<T>,
  umbau: (daten: T) => Record<string, unknown>,
): Record<string, JSONValue> {
  if (!befund.ok) {
    return { verfuegbar: false, grund: befund.grund, hinweis: befund.hinweis };
  }
  return ohneLeere({ ...umbau(befund.daten), quelle: befund.quelle, stand: befund.stand });
}

/*
  Der Werkzeugrückgabetyp lässt kein `undefined` zu — und mehrere Adapter lassen
  Felder weg, wenn es nichts zu sagen gibt. Ein fehlendes Feld ist besser als
  eines mit „null" darin: Das Modell soll gar nicht erst danach greifen.
*/
function ohneLeere(objekt: Record<string, unknown>): Record<string, JSONValue> {
  return Object.fromEntries(
    Object.entries(objekt).filter(([, wert]) => wert !== undefined),
  ) as Record<string, JSONValue>;
}

/* ------------------------------------------------------- Die Fachwerkzeuge */

/** Die sechs Systeme der Handelswelt. Beide Eingangswege bekommen sie. */
export function fachwerkzeuge(tool: ToolFactory<any>) {
  return {
    warenwirtschaft_kategorie: tool({
      description:
        'Entwicklung der Kategorie Schokolade & Pralinen in den letzten zwölf Monaten, samt schwächstem und stärkstem Artikel.',
      parameters: z.object({}),
      handler: async () =>
        ausgabe(kategorie(), (d) => ({
          kategorie: d.kategorie,
          artikelzahl: d.artikelzahl,
          absatzJahr: d.absatzJahr,
          entwicklung: `${d.entwicklung > 0 ? '+' : ''}${punkte(d.entwicklung)} gegenüber Vorjahr`,
          schwaechsterArtikel: d.schwaechster.artikel,
          entwicklungSchwaechster: punkte(d.schwaechster.entwicklung),
          schwaechsterIstEigenmarke: d.schwaechster.eigenmarke,
          staerksterArtikel: d.staerkster.artikel,
          entwicklungStaerkster: `+${punkte(d.staerkster.entwicklung)}`,
        })),
    }),

    warenwirtschaft_artikel: tool({
      description:
        'Schlägt einen einzelnen Artikel im Artikelstamm nach. Sagt auch, wenn ein Produkt nicht in diese Kategorie gehört.',
      parameters: z.object({ suche: z.string().describe('Artikel- oder Markenname') }),
      handler: async ({ input }) =>
        ausgabe(artikel(input.suche), (d) => ({
          artikel: d.artikel,
          artikelnummer: d.nummer,
          regalzone: d.zone,
          eigenmarke: d.eigenmarke,
          absatzJahr: d.absatzJahr,
          entwicklung: `${d.entwicklung > 0 ? '+' : ''}${punkte(d.entwicklung)}`,
          ekPreis: euro(d.ekPreis),
          vkPreis: euro(d.vkPreis),
        })),
    }),

    marktdaten_segment: tool({
      description:
        'In welches Marktsegment ein Produkt fällt, wie das Segment im Markt läuft und wie unsere eigenen Artikel darin laufen. Das Produkt muss nicht gelistet sein.',
      parameters: z.object({ produkt: z.string().describe('Produktname') }),
      handler: async ({ input }) =>
        ausgabe(segment(input.produkt), (d) => ({
          segment: d.segment,
          marktentwicklung: `${d.marktentwicklung > 0 ? '+' : ''}${punkte(d.marktentwicklung)}`,
          eigeneEntwicklung:
            d.eigeneEntwicklung === null
              ? 'Wir führen in diesem Segment keinen Artikel.'
              : `${d.eigeneEntwicklung > 0 ? '+' : ''}${punkte(d.eigeneEntwicklung)} über ${d.eigeneArtikel} Artikel`,
          abstand:
            d.abstandInPunkten === null
              ? undefined
              : `${d.abstandInPunkten.toFixed(1).replace('.', ',')} Punkte zwischen Markt und eigenem Sortiment`,
        })),
    }),

    regalplanung_platz: tool({
      description:
        'Belegung einer Regalzone (tafel, riegel oder pralinen) und welche Artikel bei einer Neulistung als Erste weichen würden.',
      parameters: z.object({ zone: z.string().describe('tafel, riegel oder pralinen') }),
      handler: async ({ input }) =>
        ausgabe(platz(input.zone), (d) => ({
          zone: d.zone,
          facingsKapazitaet: d.kapazitaet,
          facingsBelegt: d.belegt,
          facingsFrei: d.frei,
          artikelInZone: d.artikel,
          weichkandidaten: d.weichkandidaten.map((w) => ({
            artikel: w.artikel,
            facings: w.facings,
            entwicklung: punkte(w.entwicklung),
            absatzJahr: w.absatzJahr,
            eigenmarke: w.eigenmarke,
            rohertrag: punkte(w.rohertrag),
          })),
        })),
    }),

    kalkulation_marge: tool({
      description:
        'Rohertrag aus Einkaufs- und empfohlenem Verkaufspreis, gegen die Kategorievorgabe. Rechnet auf den Netto-Verkaufspreis.',
      parameters: z.object({
        ekPreis: z.number().describe('Einkaufspreis in Euro'),
        vkPreis: z.number().describe('Empfohlener Verkaufspreis in Euro'),
      }),
      handler: async ({ input }) =>
        ausgabe(marge(input.ekPreis, input.vkPreis), (d) => ({
          rohertrag: prozent(d.rohertrag),
          gerechnetAus: `EK ${euro(d.ekPreis)} / VK ${euro(d.vkPreis)}, netto ${euro(d.vkNetto)}`,
          kategorievorgabe: `mindestens ${prozent(d.mindestRohertrag)}`,
          erfuellt: d.erfuellt,
          luft: `${punkte(d.luftInPunkten)} Punkte ${d.luftInPunkten >= 0 ? 'über' : 'unter'} der Vorgabe`,
        })),
    }),

    aktionskalender_zeitraum: tool({
      description:
        'Prüft einen Wunschtermin gegen die Vorlauffrist und nennt freie Aktionsflächen in seiner Nähe.',
      parameters: z.object({ termin: z.string().describe('Wunschtermin, z. B. „15. Oktober"') }),
      handler: async ({ input }) =>
        ausgabe(flaechen(input.termin), (d) => ({
          wunschtermin: d.wunschtermin,
          vorlauf: `${d.vorlaufTage} Tage, nötig sind ${d.vorlaufNoetig}`,
          fristErfuellt: d.fristErfuellt,
          ...(d.fehlendeTage > 0 ? { fehlendeTage: d.fehlendeTage } : {}),
          freieFlaechen: d.freieFlaechen.map((f) => ({
            datum: f.datum,
            maerkte: f.maerkte,
            region: f.region,
            flaeche: f.art,
            ...(f.grund ? { grund: f.grund } : {}),
            abstandZumWunschtermin: `${f.abstandZumWunsch > 0 ? '+' : ''}${f.abstandZumWunsch} Tage`,
          })),
          belegt: d.belegt,
        })),
    }),

    listung_anforderungen: tool({
      description:
        'Welche Tore eine Neulistung passieren muss, welche Regel dahintersteht und wer jeweils entscheidet.',
      parameters: z.object({}),
      handler: async () =>
        ausgabe(anforderungen(), (d) => ({
          kategorie: d.kategorie,
          tore: d.tore.map((t) => ({
            tor: t.tor,
            regel: t.regel,
            entscheidet: t.entscheidet,
            ...(t.giltWenn ? { giltWenn: t.giltWenn } : {}),
          })),
        })),
    }),

    /*
      Das einzige Werkzeug, das nicht sagt, ob etwas GEHT, sondern ob es
      GEWOLLT ist. Ohne es endet jede Prüfung beim Ja mit Auflagen — denn wer
      nur Marge, Platz und Frist kennt, hat keinen Grund, etwas Zulässiges
      abzulehnen.
    */
    kategorie_ziele: tool({
      description:
        'Die Ziele der Kategorie für das laufende Geschäftsjahr, je Käufergruppe: ' +
        'welche Gruppe gehalten, gesteigert oder neu gewonnen werden soll, wo wir heute ' +
        'stehen und warum. Nutze das, bevor du eine Anfrage befürwortest oder ablehnst — ' +
        'eine Anfrage kann zulässig sein und trotzdem den Zielen widersprechen.',
      parameters: z.object({}),
      handler: async () =>
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
            anteilFlaeche: punkte(s.anteilFlaeche),
            anteilAbsatz: punkte(s.anteilAbsatz),
            entwicklung: punkte(s.entwicklung),
            ...(s.zielAnteilFlaeche === undefined
              ? {}
              : { zielAnteilFlaeche: punkte(s.zielAnteilFlaeche) }),
            lage: s.lage,
          })),
        })),
    }),
  };
}
